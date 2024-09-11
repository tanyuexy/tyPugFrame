import fse from "fs-extra";
import pug from "pug";
import path from "path";
import less from "less";
import { getPagesPugFilePathArr } from "./utils.js";
import { execSync } from "child_process";

const __dirname = path.resolve();
const config = fse.readJSONSync("./config.json");
const pugRootPath = "/template/pages";
let pagesPugFilePathArr = await getPagesPugFilePathArr();
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
async function compilePagesPugToFn(pugPath) {
  let basedir = path.join(__dirname, "/template");
  let fnRootPath = path.join(__dirname, "/pagesPugFn");
  let fn;
  if (pugPath) {
    if (!fse.pathExistsSync(path.join(basedir, "/pages", pugPath))) {
      console.log("路径不存在! 注意路径前面会自动拼接/template/pages!");
      return Promise.reject(
        "路径不存在! 注意路径前面会自动拼接/template/pages"
      );
    }
    fn = pug.compileFile(path.join(basedir, "/pages", pugPath), {
      basedir,
      filters: {
        less: async function (text) {
          text = (await less.render(text)).css;
          return text;
        }
      }
    });
    let toPath = path.join(fnRootPath, pugPath.replace(".pug", ".js"));
    fse.ensureFileSync(toPath);
    await fse.writeFile(toPath, "return " + fn.toString());
  } else {
    let proList = [];
    pagesPugFilePathArr.forEach((fileName) => {
      proList.push(
        new Promise(async (resolve, reject) => {
          const filePath = path.join(__dirname, pugRootPath, fileName);
          fn = pug.compileFile(filePath, {
            basedir,
            filters: {
              less: async function (text) {
                text = (await less.render(text)).css;
                return text;
              }
            }
          });
          let toPath = path.join(fnRootPath, fileName.replace(".pug", ".js"));
          fse.ensureFileSync(toPath);
          await fse.writeFile(toPath, "return " + fn.toString());
          resolve();
        })
      );
    });
    await Promise.all(proList);
  }
}

/**
 * 向getData.js中写入获取数据函数
 */
async function generateGetDataFn() {
  const getDataFile = await fse.readFile("./getData.js");
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
 * 调用getData中的函数获取模版数据 传入pugPath则只获取这一个模版数据否则全部获取
 * @param pugPath /template/pages下的pug模版路径
 */
async function fetchDataToJsonFile(pugPath) {
  const getData = await import("./getData.js");
  const JsonRootPath = path.join(__dirname, "/devJsonData");
  const languageList = config.languageList;
  languageList.forEach((language) => {
    pagesPugFilePathArr.forEach(async (fileName) => {
      if (pugPath) {
        let fileStr;
        if (process.platform == "linux") {
          fileStr = fileName.split("/").join("");
        } else {
          fileStr = fileName.split("\\").join("");
        }
        if (fileStr !== pugPath.split("/").join("")) {
          return Promise.resolve();
        }
      }
      let funName;
      let jsonFilePath;
      if (process.platform == "linux") {
        funName = "get_" + fileName.split("/").join("_").slice(0, -4) + "_data";
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
      let data = getData[funName](language);
      let pro = [];
      if (Array.isArray(data)) {
        data.forEach(async (item, index) => {
          if (item.page_name && item.page_name.length > 0) {
            jsonFilePath =
              path.join(
                JsonRootPath,
                language,
                ...jsonFilePath.slice(0, -1),
                item.page_name
              ) + ".json";
          } else {
            jsonFilePath =
              path.join(JsonRootPath, language, ...jsonFilePath) +
              "_" +
              index +
              ".json";
          }
          pro.push(fse.outputJson(jsonFilePath, data));
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
        console.log(funName, "未返回数据将不会生成json文件");
      }
    });
  });
}

async function main() {
  compilePagesPugToFn();
  await generateGetDataFn();
  fetchDataToJsonFile();
}
main();
