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
    const getData = await import("./getData.js");
    let langArr;
    let pugPathArr;
    if (args && Array.isArray(args) && args.length > 0) {
      langArr = args.filter((item) => !item.endsWith(".pug"));
      pugPathArr = args.filter((item) => item.endsWith(".pug"));
    }
    let pagesPugFilePathArr = await getPagesPugFilePathArr();
    const JsonRootPath = path.join(__dirname, "/jsonData");
    const languageList = config.languageList;
    languageList.forEach((language) => {
      if (langArr && langArr.length > 0 && !langArr.includes(language)) {
        return;
      }
      pagesPugFilePathArr.forEach(async (fileName) => {
        if (
          pugPathArr &&
          pugPathArr.length > 0 &&
          !pugPathArr.find((item) => pathIsSame(fileName, item))
        ) {
          return;
        }
        let funName;
        let jsonFilePath;
        if (process.platform == "linux") {
          funName =
            "get_" + fileName.split("/").join("_").slice(0, -4) + "_data";
          jsonFilePath = fileName.slice(0, -4).split("/");
        } else {
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
            pro.push(fse.outputJson(lastJsonFilePath, data));
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
    await sleep(200);
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
    await fse.copy(
      path.join(__dirname, "/template/static/img"),
      path.join(outputPath, "/static/img")
    );
    console.log("打包完成花费:", (Date.now() - starTime) / 1000, "s");
  } catch (error) {
    console.log(error);
  }
}

export async function buildStatic() {
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
    await sleep(200);
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
    await fse.copy(
      path.join(__dirname, "/template/static/img"),
      path.join(outputPath, "/static/img")
    );
    console.log("打包完成花费:", (Date.now() - starTime) / 1000, "s");
  } catch (error) {
    console.log(error);
  }
}
