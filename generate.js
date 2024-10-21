import fse from "fs-extra";
import pug from "pug";
import path from "path";
import {
  getPagesPugFilePathArr,
  getCompilePugFilter,
  pathIsSame,
  sleep,
  pagesPathFilter,
  asyncArrayEach,
  pathSymbol
} from "./utils.js";
import _ from "lodash";
import { config } from "./config.js";
import UglifyJS from "uglify-js";

const __dirname = path.resolve();
const pugRootPath = path.join(__dirname, "/template/pages");

/**
 * 将pages下的模版编译为生成函数
 * @param pugPath /template/pages下的pug模版路径
 * @returns
 */
export async function compilePagesPugToFn(pugPath) {
  let pagesPugFilePathArr = await getPagesPugFilePathArr();
  let fnRootPath = path.join(__dirname, "/pagesPugFn");
  let fnStr;
  //写入pug编译需要函数
  let lastPugFnStr = fse.readFileSync("./pugLib.js");
  let proList = [];
  pagesPugFilePathArr.forEach((fileName, index) => {
    if (pugPath) {
      if (!fse.pathExistsSync(path.join(pugRootPath, pugPath))) {
        console.log("路径不存在! 注意路径前面会自动拼接/template/pages!");
        return Promise.reject(
          "路径不存在! 注意路径前面会自动拼接/template/pages"
        );
      }
      if (!pathIsSame(pugPath, fileName)) {
        return;
      }
    }
    proList.push(
      new Promise(async (resolve, reject) => {
        const filePath = path.join(pugRootPath, fileName);
        let funName = fileName.split(pathSymbol).join("_").slice(0, -4);
        let pugValue = await fse.readFile(filePath);
        fnStr = pug.compileClient(pugValue, {
          basedir: path.join(__dirname, "/template"),
          compileDebug: true,
          name: funName,
          filters: getCompilePugFilter()
        });
        fnStr = fnStr.replace(
          `function ${funName}\(locals\)`,
          `export function ${funName}\(locals\)`
        );
        lastPugFnStr += fnStr.slice(
          fnStr.indexOf(`export function ${funName}\(locals\)`)
        );
        resolve();
      })
    );
  });
  await Promise.all(proList);
  let toPath = path.join(fnRootPath, "index") + ".js";
  let result = UglifyJS.minify(lastPugFnStr);
  fse.ensureFileSync(toPath);
  await fse.writeFile(toPath, result.code);
}

/**
 * 向getData.js中注入获取数据函数
 */
export async function generateGetDataFn() {
  const getDataFile = await fse.readFile("./getData.js");
  let pagesPugFilePathArr = await getPagesPugFilePathArr(true);

  if (!getDataFile.includes("get_common_data")) {
    let fun = `export async function get_common_data(language) {\n return {} \n}\n`;
    await fse.appendFile("./getData.js", fun);
  }
  pagesPugFilePathArr.forEach(async (fileName) => {
    let funName =
      "get_" + fileName.split(pathSymbol).join("_").slice(0, -4) + "_data";
    if (!getDataFile.includes(funName)) {
      let fun;
      if (config.getDataFnTemplate && config.getDataFnTemplate.length > 0) {
        fun = `export async function ${funName}${config.getDataFnTemplate}\n`;
      } else {
        fun = `export async function ${funName}(language) {\n let data = {page_name:''} || [{page_name:''}] || null \n return data \n}\n`;
      }
      await fse.appendFile("./getData.js", fun);
    }
  });
}

/**
 * 调用getData中的函数获取模版数据
 * @param args /template/pages下的pug模版路径带.pug 或者 语言 将会根据这些过滤模版
 */
export async function fetchDataToJsonFile(args) {
  const JsonRootPath = path.join(__dirname, "/jsonData");
  let langArr;
  let pugPathArr;
  if (args && Array.isArray(args) && args.length > 0) {
    langArr = args.filter((item) => !item.endsWith(".pug"));
    pugPathArr = args.filter((item) => item.endsWith(".pug"));
  } else {
    await fse.remove(JsonRootPath);
  }
  const getData = await import("./getData.js");
  let arrPagesPugFilePathArr = await getPagesPugFilePathArr();
  let pagesPugFilePathArr = await getPagesPugFilePathArr(true);
  let filterFinishArr = arrPagesPugFilePathArr.filter(
    (item) => !pagesPugFilePathArr.includes(item)
  );
  const languageList = config.languageList;
  const fileMapTable = config.fileMapTable;
  let starTime = Date.now();

  await asyncArrayEach(languageList, async (language) => {
    if (langArr && langArr.length > 0) {
      if (!langArr.includes(language)) {
        return;
      }
    }

    if (fileMapTable && Array.isArray(fileMapTable)) {
      await asyncArrayEach(fileMapTable, async (obj) => {
        if (
          obj.getDataFn &&
          !obj.pugPath &&
          obj.outPutPath &&
          obj.outPutPath.endsWith(".json")
        ) {
          if (
            obj.languageList &&
            obj.languageList.length > 0 &&
            !obj.languageList.includes(language)
          ) {
            return;
          }
          let dataFn = getData[obj.getDataFn];
          if (!dataFn || typeof dataFn !== "function") {
            return Promise.reject(dataFn + "获取数据函数不存在!");
          }
          let data = await dataFn(language);
          if (!data) {
            return Promise.reject(dataFn + "获取的数据为null!");
          }
          console.log(language, obj.getDataFn, "开始写入json文件");
          let outPutPath = obj.outPutPath.split("/").join(pathSymbol);
          if (Array.isArray(data)) {
            let name = outPutPath.split(pathSymbol).pop().replace(/\..*$/, "");
            const regex = /^\[.+\]$/;
            if (regex.test(name)) {
              let property = name.slice(1, -1);
              for (let index = 0; index < data.length; index++) {
                const dataItem = data[index];
                let fileName = dataItem[property];
                if (
                  fileName === null ||
                  fileName === undefined ||
                  fileName === ""
                ) {
                  return Promise.reject(
                    dataFn +
                      "获取的数据中期望以" +
                      property +
                      `命名但是${index}下标中对象属性不存在`
                  );
                }
                await fse.outputJson(
                  path.join(
                    JsonRootPath,
                    language,
                    outPutPath.replace(name, fileName)
                  ),
                  dataItem
                );
              }
            } else {
              await fse.outputJson(
                path.join(JsonRootPath, language, outPutPath),
                data
              );
            }
          } else if (typeof data === "object") {
            await fse.outputJson(
              path.join(JsonRootPath, language, outPutPath),
              data
            );
          }
        }
      });
    }

    await asyncArrayEach(pagesPugFilePathArr, async (fileName) => {
      if (pugPathArr && pugPathArr.length > 0) {
        if (!pugPathArr.find((item) => pathIsSame(fileName, item))) {
          return;
        }
      }
      let removepathArr = fileName.split(pathSymbol).slice(0, -1);
      if (removepathArr.length > 0) {
        await fse.remove(path.join(JsonRootPath, language, ...removepathArr));
      }
      let funName =
        "get_" + fileName.split(pathSymbol).join("_").slice(0, -4) + "_data";

      let jsonFilePath = fileName.slice(0, -4).split(pathSymbol);
      if (!getData[funName] || typeof getData[funName] !== "function") {
        console.log(funName, "获取数据函数不存在!");
        return Promise.reject(funName + "获取数据函数不存在!");
      }
      let data = await getData[funName](language);
      if (Array.isArray(data) && data.length > 0) {
        console.log(language, funName, "开始写入json文件");
        asyncArrayEach(data, async (item, index) => {
          if (typeof item !== "object") {
            return Promise.reject(
              funName + "返回的数据不为对象数组得到类型" + typeof item + "[]"
            );
          }
          let lastJsonFilePath;
          if (item.page_name && item.page_name.length > 0) {
            lastJsonFilePath = path.join(
              JsonRootPath,
              language,
              ...jsonFilePath.slice(0, -1),
              item.page_name
            );
          } else {
            lastJsonFilePath =
              path.join(JsonRootPath, language, ...jsonFilePath) +
              "_" +
              ++index +
              ".json";
          }
          let templateArr = filterFinishArr.filter(
            (item) => pagesPathFilter(item) === fileName
          );
          if (fse.pathExistsSync(path.join(pugRootPath, fileName))) {
            templateArr.unshift(fileName);
          }
          item._template = templateArr;
          await fse.outputJson(lastJsonFilePath, item);
        });
      } else if (data && typeof data === "object" && !Array.isArray(data)) {
        console.log(language, funName, "开始写入json文件");
        if (data.page_name && data.page_name.length > 0) {
          jsonFilePath = path.join(
            JsonRootPath,
            language,
            ...jsonFilePath.slice(0, -1),
            item.page_name
          );
        } else {
          jsonFilePath =
            path.join(JsonRootPath, language, ...jsonFilePath) + ".json";
        }
        let templateArr = filterFinishArr.filter(
          (item) => pagesPathFilter(item) === fileName
        );
        if (fse.pathExistsSync(path.join(pugRootPath, fileName))) {
          templateArr.unshift(fileName);
        }
        data._template = templateArr;
        await fse.outputJson(jsonFilePath, data);
      } else {
        console.log(language, funName, "期望返回数组、对象类型返回:", data);
      }
    });
  });

  console.log("写入完成花费:", (Date.now() - starTime) / 1000, "s");
}

export async function buildFn() {
  if (!fse.pathExistsSync(path.join(__dirname, "jsonData"))) {
    return Promise.reject(
      path.join(__dirname, "jsonData"),
      "目录不存在请先执行npm run getData生成数据!"
    );
  }
  console.log("开始打包...");
  let starTime = Date.now();
  let outputPath = path.join(__dirname, config.fnOutput);
  await fse.remove(outputPath);
  await sleep(0);
  await compilePagesPugToFn();
  await fse.copy(
    path.join(__dirname, "pagesPugFn/index.js"),
    path.join(outputPath, "pages/pages.js")
  );

  await fse.copy(
    path.join(__dirname, "public"),
    path.join(outputPath, "pages")
  );
  await fse.copy(
    path.join(__dirname, "jsonData"),
    path.join(outputPath, "data")
  );
  const getData = await import("./getData.js");
  let totalCommonData = {};
  totalCommonData.langCommon = config.commonData;
  await asyncArrayEach(config.languageList, async (lang) => {
    let commonData = await getData.get_common_data(lang);
    totalCommonData[lang] = commonData;
  });
  await asyncArrayEach(["js", "css", "img"], async (item) => {
    fse.ensureDirSync(path.join(__dirname, "/template/static", item));
    await fse.copy(
      path.join(__dirname, "/template/static", item),
      path.join(outputPath, "pages/static", item)
    );
  });
  await fse.writeJSON(
    path.join(outputPath, "pages", "common") + ".json",
    totalCommonData
  );

  console.log("打包完成花费:", (Date.now() - starTime) / 1000, "s");
}

export async function buildStatic() {
  let jsonDataPath = path.join(__dirname, "jsonData");

  if (!fse.pathExistsSync(jsonDataPath)) {
    return Promise.reject(
      jsonDataPath + "目录不存在请先执行npm run getData生成数据!"
    );
  }
  console.log("开始打包...");
  let starTime = Date.now();
  let distOutputPath = path.join(__dirname, config.staticOutput);
  await fse.remove(distOutputPath);
  await sleep(0);
  await fse.copy(path.join(__dirname, "public"), distOutputPath);
  await asyncArrayEach(["js", "css", "img"], async (item) => {
    fse.ensureDirSync(path.join(__dirname, "/template/static", item));
    await fse.copy(
      path.join(__dirname, "/template/static", item),
      path.join(distOutputPath, "/static", item)
    );
  });
  await compilePagesPugToFn();
  let PagesPugToFn = await import("./pagesPugFn/index.js");
  const getData = await import("./getData.js");
  const fileMapTable = config.fileMapTable;
  await asyncArrayEach(config.languageList, async (lang) => {
    let langDataPath = path.join(jsonDataPath, lang);
    if (!fse.pathExistsSync(langDataPath)) {
      console.log(
        `注意配置了${lang}语言但${langDataPath}中没有生成${lang}语言的数据!`
      );
      return;
    }
    let commonData = await getData.get_common_data(lang);
    commonData = _.merge(commonData, config.commonData);

    if (fileMapTable && Array.isArray(fileMapTable)) {
      await asyncArrayEach(fileMapTable, async (obj) => {
        if (
          obj.pugPath &&
          obj.getDataFn &&
          obj.outPutPath &&
          obj.outPutPath.endsWith(".html")
        ) {
          if (
            obj.languageList &&
            obj.languageList.length > 0 &&
            !obj.languageList.includes(lang)
          ) {
            return;
          }
          let langPrefix =
            obj.languageList && obj.languageList.length > 0 ? lang : "";
          let pugPathPreArr = [""];
          if (obj.deviceList && obj.deviceList.length > 0) {
            pugPathPreArr = obj.deviceList;
          }
          await asyncArrayEach(pugPathPreArr, async (devicePrefix) => {
            let pugPath = path.join(
              pugRootPath,
              langPrefix,
              devicePrefix,
              obj.pugPath.split("/").join(pathSymbol)
            );
            if (!fse.pathExistsSync(pugPath)) {
              return Promise.reject(pugPath + "模版路径不存在!");
            }
            let dataFn = getData[obj.getDataFn];
            if (!dataFn || typeof dataFn !== "function") {
              return Promise.reject(dataFn + "获取数据函数不存在!");
            }
            let data = await dataFn(lang);
            if (!data) {
              return Promise.reject(dataFn + "获取的数据为null!");
            }
            let outPutPath = obj.outPutPath.split("/").join(pathSymbol);
            let htmlPath;
            let html;
            if (Array.isArray(data)) {
              let name = outPutPath
                .split(pathSymbol)
                .pop()
                .replace(/\..*$/, "");
              const regex = /^\[.+\]$/;
              if (regex.test(name)) {
                let property = name.slice(1, -1);
                for (let index = 0; index < data.length; index++) {
                  const dataItem = data[index];
                  let fileName = dataItem[property];
                  if (
                    fileName === null ||
                    fileName === undefined ||
                    fileName === ""
                  ) {
                    return Promise.reject(
                      dataFn +
                        "获取的数据中期望以" +
                        property +
                        `命名但是${index}下标中对象${property}属性为:${fileName}`
                    );
                  }
                  htmlPath = path.join(
                    distOutputPath,
                    lang,
                    devicePrefix,
                    outPutPath.replace(name, fileName)
                  );
                  html = pug.compileFile(pugPath, {
                    basedir: path.join(__dirname, "/template"),
                    compileDebug: true,
                    filters: getCompilePugFilter()
                  })({
                    data: dataItem,
                    _pagePath: obj.pugPath,
                    common: commonData
                  });
                  fse.ensureFileSync(htmlPath);
                  await fse.writeFile(htmlPath, html);
                }
              } else {
                htmlPath = path.join(
                  __dirname,
                  "template",
                  lang,
                  devicePrefix,
                  outPutPath
                );
                html = pug.compileFile(pugPath, {
                  basedir: path.join(__dirname, "/template"),
                  compileDebug: true,
                  filters: getCompilePugFilter()
                })({
                  data,
                  _pagePath: obj.pugPath,
                  common: commonData
                });
                fse.ensureFileSync(htmlPath);
                await fse.writeFile(htmlPath, html);
              }
            } else if (typeof data === "object") {
              htmlPath = path.join(
                distOutputPath,
                lang,
                devicePrefix,
                outPutPath
              );
              html = pug.compileFile(pugPath, {
                basedir: path.join(__dirname, "/template"),
                compileDebug: true,
                filters: getCompilePugFilter()
              })({
                data,
                _pagePath: obj.pugPath,
                common: commonData
              });
              fse.ensureFileSync(htmlPath);
              await fse.writeFile(htmlPath, html);
            }
          });
        }
      });
    }

    let pagesAllJsonFileName = (
      await fse.readdir(path.join(langDataPath), {
        recursive: true
      })
    ).filter((fileName) => fileName.endsWith(".json"));
    await asyncArrayEach(pagesAllJsonFileName, async (jsonFileName) => {
      let data = await fse.readJSON(path.join(langDataPath, jsonFileName));
      let pugTemplateArr = data._template;
      if (!pugTemplateArr) {
        return;
      }
      let flag = false;

      let curLangPugTem = data._template.find((item) => {
        let lang2 = item.split(pathSymbol)[0];
        if (config.languageList.includes(lang2) && lang === lang2) {
          return true;
        }
      });
      if (curLangPugTem) {
        flag = true;
        pugTemplateArr = [curLangPugTem];
      } else {
        //没有特殊模版的语言排除其他语言的特殊模版
        pugTemplateArr = data._template.filter((item) => {
          let lang2 = item.split(pathSymbol)[0];
          if (config.languageList.includes(lang2)) {
            return false;
          }
          return true;
        });
      }

      await asyncArrayEach(pugTemplateArr, async (pugTemplate) => {
        let funName = pugTemplate.split(pathSymbol).join("_").slice(0, -4);
        if (flag) {
          pugTemplate = pugTemplate.split(pathSymbol).slice(1).join(pathSymbol);
        }
        let html = PagesPugToFn[funName]({
          data,
          _pagePath: pugTemplate,
          common: commonData
        });
        if (data.page_name) {
          pugTemplate =
            pugTemplate.split(pathSymbol).slice(0, -1).join(pathSymbol) +
            pathSymbol +
            data.page_name;
        }
        let htmlPath = path.join(
          distOutputPath,
          lang,
          pugTemplate.replace(/\..*$/, ".html")
        );
        fse.ensureFileSync(htmlPath);
        await fse.writeFile(htmlPath, html);
      });
    });
  });
  console.log("打包完成花费:", (Date.now() - starTime) / 1000, "s");
}
