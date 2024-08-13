import fse from "fs-extra";
import path from "path";
import LangConfig from "./sourceData/langConfig.js";

const __dirname = path.resolve();
const config = await fse.readJson("./config.json");

let allDataObj = new Map();

let indexData = await fse.readJson("./sourceData/index.json");
let pagesDataMap = {
  "index.pug": [indexData],
  "detail/a/c.pug": [1]
};
async function initAllDataObj() {
  let pugFilePath = path.join(__dirname, "/template/pages");
  const files = await fse.readdir(pugFilePath, {
    recursive: true
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
        const element = dataObj[key];
        LangConfig.find((obj) => obj.Site == site);
        element.pageData = pagesDataMap[key.replace(/\\/g, "/")] || [];
      }
    }
    allDataObj.set(site, dataObj);
  });
}

function main() {
  initAllDataObj();
}
main();
export default allDataObj;

export async function generateJsonDataFile() {
  let JsonPath = path.join(__dirname, "/devJsonData");
  await fse.remove(JsonPath);
  for (const [key, value] of allDataObj.entries()) {
    fse.ensureDirSync(path.join(JsonPath, key));
    Object.keys(value).forEach(async (key2) => {
      let obj = value[key2];
      if (obj.pageData.length <= 0) {
        return;
      }
      let pageJsonName;
      if (obj.pageData.length > 1) {
        obj.pageData.forEach(async (item) => {
          if (item.page_name) {
            pageJsonName =
              key2.split("\\").slice(0, -1).join("/") + "/" + item.page_name;
            fse.writeJson(path.join(JsonPath, key, pageJsonName), item);
          } else {
            console.log(key2, ":", "not page_name");
          }
        });
      } else {
        if (obj.pageData[0].page_name) {
          pageJsonName =
            key2.split("\\").slice(0, -1).join("/") + "/" + item.page_name;
        } else {
          pageJsonName = key2.replace(".pug", ".json");
        }
        await fse.ensureFile(path.join(JsonPath, key, pageJsonName));
        fse.writeJson(path.join(JsonPath, key, pageJsonName), obj.pageData[0]);
      }
    });
  }
}
