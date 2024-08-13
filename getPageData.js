import fse from "fs-extra";
import path from "path";
import LangConfig from "./sourceData/langConfig.js";

const __dirname = path.resolve();
const config = await fse.readJson("./config.json");
let indexData = await fse.readJson("./sourceData/index.json");

let allDataObj = new Map();
let pagesDataMap = {
  "index.pug": { us: [indexData] },
  "detail/a/c.pug": { us: [{ a: 1 }] },
};

export async function getAllDataObj() {
  let pugFilePath = path.join(__dirname, "/template/pages");
  const files = await fse.readdir(pugFilePath, {
    recursive: true,
  });
  let dataObj = {};
  files
    .filter((filePath) => filePath.endsWith(".pug"))
    .forEach((fileName) => {
      dataObj[fileName] = {};
    });
  config.siteList.forEach((site) => {
    for (const key in dataObj) {
      if (Object.hasOwnProperty.call(dataObj, key)) {
        let pageDataKey = key.replace(/\\/g, "/");
        const element = dataObj[key];
        element.lang = LangConfig.find((obj) => obj.Site == site);
        element.pageData =
          (pagesDataMap[pageDataKey] && pagesDataMap[pageDataKey][site]) ||
          null;
      }
    }
    allDataObj.set(site, dataObj);
  });
  return allDataObj;
}

export function clearDevJson() {
  fse.removeSync(JsonPath);
}

export async function generateJsonDataFile() {
  let JsonPath = path.join(__dirname, "/devJsonData");
  if (fse.pathExistsSync(JsonPath)) {
    return;
  }
  await getAllDataObj();
  let proList = [];
  for (const [key, value] of allDataObj.entries()) {
    Object.keys(value).forEach((pugPath) => {
      let obj = value[pugPath];
      if (
        !obj.pageData ||
        !Array.isArray(obj.pageData) ||
        obj.pageData.length <= 0
      ) {
        console.log(
          `template path: ${pugPath} --- data: ${obj.pageData} --- data error!`
        );
        return;
      }
      let pageJsonName;
      if (obj.pageData.length > 1) {
        obj.pageData.forEach(async (item) => {
          if (item.page_name) {
            pageJsonName =
              pugPath.split("\\").slice(0, -1).join("/") + "/" + item.page_name;
            fse.ensureFileSync(path.join(JsonPath, key, pageJsonName));
            proList.push(
              fse.writeJson(path.join(JsonPath, key, pageJsonName), item)
            );
          } else {
            console.log(`${pugPath} : not page_name`);
          }
        });
      } else {
        if (obj.pageData[0].page_name) {
          pageJsonName =
            pugPath.split("\\").slice(0, -1).join("/") + "/" + item.page_name;
        } else {
          pageJsonName = pugPath.replace(".pug", ".json");
        }
        fse.ensureFileSync(path.join(JsonPath, key, pageJsonName));
        proList.push(
          fse.writeJson(path.join(JsonPath, key, pageJsonName), obj.pageData[0])
        );
      }
    });
  }
  await Promise.all(proList);
}
