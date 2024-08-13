import fse from "fs-extra";
import pug from "pug";
import path from "path";
import { execSync } from "child_process";
import allDataObj from "./getData";

const __dirname = path.resolve();

//在编译前对pug文件做一些处理
function beforePugFileConversion(fileContent, curPath) {
  fileContent = fileContent.replace(/include.*\.less/g, (str) => {
    return str.replace(/less/g, "css");
  });
  fileContent = fileContent.replace(/extends(.*)(?=.pug)/g, (str) => {
    return str.replace(/template/g, "temp");
  });
  return fileContent;
}

//编译less->css
async function compileLessToCss() {
  let lessFilesPath = path.join(__dirname, "/assets/less");
  await fse.ensureDir(lessFilesPath);
  try {
    const files = await fse.readdir(lessFilesPath, {
      recursive: true
    });
    files
      .filter((item) => item.endsWith(".less"))
      .forEach(async (fileName) => {
        let lessPath = path.join(lessFilesPath, fileName);
        let cssPath = lessPath.replace(/less/g, "css");
        execSync(`lessc ${lessPath} ${cssPath}`);
      });
  } catch (error) {
    console.log(error);
  }
}

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
 * 将处理完的pug文件拷到temp文件夹然后编译pug文件输出到output文件夹下
 * @param {页面所需数据} data
 */
async function createPages(data) {
  try {
    let pugFilePath = path.join(__dirname, "/template/");
    let obj = await readAllFilesValueInFolder(pugFilePath, [".pug"]);
    await compileLessToCss();
    for (const key in obj) {
      obj[key] = beforePugFileConversion(obj[key], key);
      let newKey = key.replace("template", "temp");
      obj[newKey] = obj[key];
      delete obj[key];
      await fse.writeFile(newKey, obj[newKey]);
    }
    let proList = [];
    ["css", "img", "js"].forEach(async (str) => {
      let targetFolderPath = path.join(__dirname, "/temp", str);
      let targetFolderPath2 = path.join(__dirname, "/output", str);
      let sourceFolderPath = path.join(__dirname, "/assets", str);
      if (str !== "img") {
        proList.push(
          new Promise(async (resolve, reject) => {
            await fse.copy(sourceFolderPath, targetFolderPath);
            resolve();
          })
        );
      }
      await fse.copy(sourceFolderPath, targetFolderPath2);
    });
    await Promise.all(proList);
    await fse.remove(path.join(__dirname, "/output/pages"));
    Object.keys(obj).forEach(async (key) => {
      if (key.includes("pages")) {
        // console.log(data, key.slice(key.indexOf("pages")));
        const basedir = path.join(__dirname, "/temp");
        let html = pug.compileFile(key, { basedir })(data);
        let outputPath = key
          .replace(/temp/g, "output")
          .replace(/\.pug/g, ".html");
        await fse.ensureFile(outputPath);
        await fse.writeFile(outputPath, html);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  createPages(allDataObj);
}
main();
