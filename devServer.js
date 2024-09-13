import express from "express";
import ip from "ip";
import fse from "fs-extra";
import path from "path";
import _ from "lodash";
import { getCompilePugFilter } from "./utils.js";
import { get_common_data } from "./getData.js";

const __dirname = path.resolve();
const config = await fse.readJson("./config.json");
const app = express();
const pagsTemplatePath = path.join(__dirname, "/template/pages");

app.set("views", pagsTemplatePath);
app.set("view engine", "pug");
app.use("/static", express.static("./template/static"));
app.use(express.static("./public"));
app.locals.basedir = path.join(__dirname, "/template");
app.get("*", async (req, res) => {
  try {
    let lastPath = req.path;
    if (lastPath == "/") {
      lastPath = "/index";
    } else {
      if (lastPath.endsWith(".html")) {
        lastPath = lastPath.slice(0, -5);
      }
    }
    let firstPath = req.path.split("/")[1];
    let language = config.languageList.includes(firstPath) ? firstPath : "us";
    lastPath = lastPath
      .split("/")
      .filter((item) => item !== language)
      .join("/");
    let jsonDataPath =
      path.join(__dirname, "jsonData", language, lastPath) + ".json";
    let data;
    if (fse.pathExistsSync(jsonDataPath)) {
      data = await fse.readJSON(jsonDataPath);
    } else {
      console.log(jsonDataPath, "不存在此json文件页面data数据将为null");
      jsonDataPath = null;
    }
    let pugPath = path.join(pagsTemplatePath, lastPath) + ".pug";
    if (fse.pathExistsSync(pugPath)) {
      console.log(
        `请求路径:${req.path}  模版路径:${pugPath}  数据JSON文件路径:${jsonDataPath}`
      );
      const commonData = await get_common_data(language);
      res.render(
        pugPath,
        _.merge(
          {
            data,
            common: _.merge(commonData, config.commonData)
          },
          { filters: getCompilePugFilter() }
        )
      );
    } else {
      let html = `<h1>${pugPath}的模版函数不存在!</h1>`;
      console.log(`${pugPath}的模版函数不存在!`);
      res.send(html);
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(config.devServer.port);
const localIp = ip.address();
console.log("Listening: ", localIp + ":" + config.devServer.port);
