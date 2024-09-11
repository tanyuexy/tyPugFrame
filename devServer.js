import express from "express";
import ip from "ip";
import fse from "fs-extra";
import path from "path";
import _ from "lodash";
import less from "less";

import { getPagesPugFnToGlobal } from "./utils.js";

const __dirname = path.resolve();
const config = await fse.readJson("./config.json");
const app = express();

app.set("views", "./template/pages");
app.set("view engine", "pug");
app.use("/static", express.static("./template/static"));
app.use(express.static("./public"));
app.locals.basedir = path.join(__dirname, "/template");
await getPagesPugFnToGlobal();
app.get("*", async (req, res) => {
  try {
    let key;
    let lastPath = req.path;
    if (lastPath == "/") {
      key = "index";
      lastPath = "/index";
    } else {
      if (lastPath.endsWith(".html")) {
        lastPath = lastPath.slice(0, -5);
        key = lastPath.replaceAll("/", "");
      } else {
        key = lastPath.replaceAll("/", "");
      }
    }
    let firstPath = req.path.split("/")[1];
    lastPath = config.languageList.includes(firstPath)
      ? lastPath
      : "/us" + lastPath;
    let pugFn = global._pugFnMap.get(key);
    let jsonDataPath = path.join(__dirname, "devJsonData", lastPath) + ".json";
    let data;
    if (fse.pathExistsSync(jsonDataPath)) {
      data = await fse.readJSON(jsonDataPath);
    } else {
      console.log(jsonDataPath, "不存在此json文件页面data数据将为null");
      jsonDataPath = null;
    }
    let html;
    // if (pugFn) {
    //   html = pugFn({ data });
    //   console.log(
    //     `请求路径:${req.path}  模版函数路径:${path.join(
    //       __dirname,
    //       "/pagesPugFn",
    //       req.path.replace(".html", "") == "/"
    //         ? "index"
    //         : req.path.replace(".html", "")
    //     )}.js  数据JSON文件路径:${jsonDataPath}`
    //   );
    // } else {
    //   html = `<h1>${path.join(
    //     __dirname,
    //     "/template/pages",
    //     req.path.replace(".html", "")
    //   )}.pug 的模版函数不存在!!!</h1>`;
    //   console.log(
    //     `${path.join(
    //       __dirname,
    //       "/template/pages",
    //       req.path.replace(".html", "")
    //     )}.pug 的模版函数不存在!!!`
    //   );
    // }
    // res.send(html);
    res.render(
      "index.pug",
      _.merge(data, {
        filters: {
          less: async function (text) {
            text = (await less.render(text)).css;
            return text;
          }
        }
      })
    );
  } catch (error) {
    console.log(error);
  }
});

app.listen(config.devServer.port);
const localIp = ip.address();
console.log("Listening: ", localIp + ":" + config.devServer.port);
