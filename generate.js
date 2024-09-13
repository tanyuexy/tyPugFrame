import fse from "fs-extra";
import pug from "pug";
import path from "path";
import {
  getPagesPugFilePathArr,
  getCompilePugFilter,
  pathIsSame,
  sleep
} from "./utils.js";
import _ from "lodash";

const __dirname = path.resolve();
const config = fse.readJSONSync("./config.json");
const pugRootPath = path.join(__dirname, "/template/pages");
//根据后缀名读取文件夹里的所有文件内容
async function readAllFilesValueInFolder(folderPath, fileExtArr) {
  let obj = {};
  let proList = [];
  try {
    const files = await fse.readdir(folderPath, {
      recursive: true
    });
    files.forEach((fileName) => {
      if (fileExtArr.some((ext) => fileName.endsWith(ext))) {
        proList.push(
          new Promise(async (resolve, reject) => {
            const filePath = path.join(folderPath, fileName);
            const fileContent = await fse.readFile(filePath, "utf8");
            obj[filePath] = fileContent;
            resolve();
          })
        );
      }
    });
  } catch (error) {
    console.error(`Error reading files: ${error}`);
  }
  await Promise.all(proList);
  return obj;
}

/**
 * 将pages下的模版编译为生成函数
 * @param pugPath /template/pages下的pug模版路径
 * @returns
 */
export async function compilePagesPugToFn(pugPath) {
  let pagesPugFilePathArr = await getPagesPugFilePathArr();
  let fnRootPath = path.join(__dirname, "/pagesPugFn");
  let fnStr;
  let lastPugFnStr = "";
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
        let funName;
        if (process.platform == "linux") {
          funName = "compile_" + fileName.split("/").join("_").slice(0, -4);
        } else {
          funName = "compile_" + fileName.split("\\").join("_").slice(0, -4);
        }
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
        if (index == 0) {
          lastPugFnStr += fnStr;
        } else {
          lastPugFnStr += fnStr.slice(
            fnStr.indexOf(`export function ${funName}\(locals\)`)
          );
        }
        resolve();
      })
    );
  });
  await Promise.all(proList);
  let toPath = path.join(fnRootPath, "index") + ".js";
  fse.ensureFileSync(toPath);
  await fse.writeFile(toPath, lastPugFnStr);
}

/**
 * 向getData.js中注入获取数据函数
 */
export async function generateGetDataFn() {
  const getDataFile = await fse.readFile("./getData.js");
  let pagesPugFilePathArr = await getPagesPugFilePathArr();

  if (!getDataFile.includes("get_common_data")) {
    let fun = `export async function get_common_data(language) {\n return {} \n}\n`;
    await fse.appendFile("./getData.js", fun);
  }
  pagesPugFilePathArr.forEach(async (fileName) => {
    let funName;
    if (process.platform == "linux") {
      funName = "get_" + fileName.split("/").join("_").slice(0, -4) + "_data";
    } else {
      funName = "get_" + fileName.split("\\").join("_").slice(0, -4) + "_data";
    }
    if (!getDataFile.includes(funName)) {
      let fun;
      if (config.getDataFnTemplate && config.getDataFnTemplate.length > 0) {
        fun = `export async function ${funName}${config.getDataFnTemplate}\n`;
      } else {
        fun = `export async function ${funName}(language) {\n let data = [{page_name:''}] || {page_name:''} || null \n return data \n}\n`;
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
  try {
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
    let pagesPugFilePathArr = await getPagesPugFilePathArr();
    const languageList = config.languageList;
    languageList.forEach(async (language) => {
      if (langArr && langArr.length > 0) {
        if (!langArr.includes(language)) {
          return;
        }
      }

      pagesPugFilePathArr.forEach(async (fileName) => {
        if (pugPathArr && pugPathArr.length > 0) {
          if (!pugPathArr.find((item) => pathIsSame(fileName, item))) {
            return;
          }
        }
        let funName;
        let jsonFilePath;
        if (process.platform == "linux") {
          let removepathArr = fileName.split("/").slice(0, -1);
          if (removepathArr.length > 0) {
            await fse.remove(
              path.join(JsonRootPath, language, ...removepathArr)
            );
          }
          funName =
            "get_" + fileName.split("/").join("_").slice(0, -4) + "_data";
          jsonFilePath = fileName.slice(0, -4).split("/");
        } else {
          let removepathArr = fileName.split("\\").slice(0, -1);
          if (removepathArr.length > 0) {
            await fse.remove(
              path.join(JsonRootPath, language, ...removepathArr)
            );
          }
          funName =
            "get_" + fileName.split("\\").join("_").slice(0, -4) + "_data";
          jsonFilePath = fileName.slice(0, -4).split("\\");
        }
        if (!getData[funName] || typeof getData[funName] !== "function") {
          console.log(funName, "获取数据函数不存在!");
          return Promise.reject(funName + "获取数据函数不存在!");
        }
        console.log(
          `开始获取${path.join(
            pugRootPath,
            fileName
          )}模版${language}国家的数据调用getData.js的${funName}方法`
        );
        let starTime = Date.now();
        let data = await getData[funName](language);
        console.log(
          funName,
          "数据获取完成执行时间为:",
          (Date.now() - starTime) / 1000,
          "s"
        );
        let pro = [];
        starTime = Date.now();
        console.log(funName, "开始写入json文件");
        if (Array.isArray(data)) {
          data.forEach(async (item, index) => {
            if (typeof item !== "object") {
              return Promise.reject(
                funName + "返回的数据不为对象数组得到类型" + typeof item + "[]"
              );
            }
            let lastJsonFilePath;
            if (item.page_name && item.page_name.length > 0) {
              lastJsonFilePath =
                path.join(
                  JsonRootPath,
                  language,
                  ...jsonFilePath.slice(0, -1),
                  item.page_name
                ) + ".json";
            } else {
              lastJsonFilePath =
                path.join(JsonRootPath, language, ...jsonFilePath) +
                "_" +
                ++index +
                ".json";
            }
            item._template = fileName;
            pro.push(fse.outputJson(lastJsonFilePath, item));
          });
          await Promise.all(pro);
        } else if (data && typeof data === "object") {
          if (data.page_name && data.page_name.length > 0) {
            jsonFilePath =
              path.join(
                JsonRootPath,
                language,
                ...jsonFilePath.slice(0, -1),
                item.page_name
              ) + ".json";
          } else {
            jsonFilePath =
              path.join(JsonRootPath, language, ...jsonFilePath) + ".json";
          }
          data._template = fileName;
          await fse.outputJson(jsonFilePath, data);
        } else {
          if (!data) {
            console.log(funName, "未返回数据将不会生成json文件");
          } else {
            console.log(
              funName,
              "期望返回数组、对象、null返回的类型为:",
              typeof data
            );
          }
        }
        console.log(
          funName,
          "文件写入完成执行时间为:",
          (Date.now() - starTime) / 1000,
          "s"
        );
      });
    });
  } catch (error) {
    console.log(error);
  }
}

export async function buildFn() {
  try {
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
    await fse.copy(path.join(__dirname, "pagesPugFn"), outputPath);
    await fse.copy(path.join(__dirname, "public"), outputPath);
    await fse.copy(
      path.join(__dirname, "jsonData"),
      path.join(outputPath, "data")
    );
    const getData = await import("./getData.js");
    config.languageList.forEach(async (lang) => {
      let commonData = await getData.get_common_data(lang);
      let langDataPath = path.join(outputPath, "data", lang);
      if (!fse.pathExistsSync(langDataPath)) {
        console.log(
          `注意配置了${lang}语言但${langDataPath}中没有生成${lang}语言的数据!`
        );
      } else {
        await fse.writeJSON(
          langDataPath + "/common.json",
          _.merge(commonData, config.commonData)
        );
      }
    });
    ["js", "css", "img"].forEach(async (item) => {
      await fse.copy(
        path.join(__dirname, "/template/static", item),
        path.join(outputPath, "/static", item)
      );
    });

    console.log("打包完成花费:", (Date.now() - starTime) / 1000, "s");
  } catch (error) {
    console.log(error);
  }
}

export async function buildStatic() {
  let jsonDataPath = path.join(__dirname, "jsonData");
  try {
    if (!fse.pathExistsSync(jsonDataPath)) {
      return Promise.reject(
        jsonDataPath + "目录不存在请先执行npm run getData生成数据!"
      );
    }
    console.log("开始打包...");
    let starTime = Date.now();
    let outputPath = path.join(__dirname, config.staticOutput);
    await fse.remove(outputPath);
    await sleep(0);
    await fse.copy(path.join(__dirname, "public"), outputPath);
    ["js", "css", "img"].forEach(async (item) => {
      await fse.copy(
        path.join(__dirname, "/template/static", item),
        path.join(outputPath, "/static", item)
      );
    });
    await compilePagesPugToFn();
    let PagesPugToFn = await import("./pagesPugFn/index.js");
    let pagesPugFilePathArr = await getPagesPugFilePathArr();

    const getData = await import("./getData.js");
    config.languageList.forEach(async (lang) => {
      let langDataPath = path.join(jsonDataPath, lang);
      if (!fse.pathExistsSync(langDataPath)) {
        console.log(
          `注意配置了${lang}语言但${langDataPath}中没有生成${lang}语言的数据!`
        );
        return;
      }
      let commonData = await getData.get_common_data(lang);
      commonData = _.merge(commonData, config.commonData);
      let pagesAllJsonFileName = (
        await fse.readdir(path.join(langDataPath), {
          recursive: true
        })
      ).filter((fileName) => fileName.endsWith(".json"));

      pagesAllJsonFileName.forEach(async (jsonFileName) => {
        let data = await fse.readJSON(path.join(langDataPath, jsonFileName));
        let pugTemplate = pagesPugFilePathArr.find((pugFileName) => {
          return pathIsSame(pugFileName, data._template);
        });
        let funName;
        if (process.platform == "linux") {
          funName = "compile_" + pugTemplate.split("/").join("_").slice(0, -4);
        } else {
          funName = "compile_" + pugTemplate.split("\\").join("_").slice(0, -4);
        }
        let html = PagesPugToFn[funName]({ data, common: commonData });
        let htmlPath = path.join(
          outputPath,
          lang,
          pugTemplate.replace(".pug", ".html")
        );
        fse.ensureFileSync(htmlPath);
        await fse.writeFile(htmlPath, html);
      });
    });
    console.log("打包完成花费:", (Date.now() - starTime) / 1000, "s");
  } catch (error) {
    console.log(error);
  }
}
