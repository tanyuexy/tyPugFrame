import express from "express";
import ip from "ip";
import fse from "fs-extra";
import path from "path";
import _ from "lodash";
import { getCompilePugFilter, getIdleProt } from "./utils.js";
import { get_common_data } from "./getData.js";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const __dirname = path.resolve();
const config = await fse.readJson("./config.json");
const pagsTemplatePath = path.join(__dirname, "/template/pages");
const localIp = ip.address();
const port = await getIdleProt(config.devServer.port, localIp);
process.env._port = port;
process.env._localIp = localIp;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.set("views", pagsTemplatePath);
app.set("view engine", "pug");
app.use("/static", express.static("./template/static"));
app.use(express.static("./public"));
app.locals.basedir = path.join(__dirname, "/template");
wss.on("connection", function connection(ws) {
  console.log("刷新网页");
});

app.get("/_refresh", (req, res) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send("refresh");
    }
  });
  res.send("刷新成功");
});

app.get("*", async (req, res) => {
  try {
    let lastPath = req.path;
    if (lastPath.endsWith(".html")) {
      lastPath = lastPath.slice(0, -5);
    } else {
      lastPath = path.join(lastPath, "index");
    }
    let language = config.languageList[0];
    let jsonLastPath = lastPath;
    if (config.isMatchLanguage) {
      jsonLastPath = jsonLastPath
        .split("\\")
        .filter((item) => !config.languageList.includes(item))
        .join("\\");
    }
    if (config.isMatchDevice) {
      jsonLastPath = jsonLastPath
        .split("\\")
        .filter((item) => !["pc", "mobile", "ipad"].includes(item))
        .join("\\");
    }
    let jsonDataPath =
      path.join(__dirname, "jsonData", language, jsonLastPath) + ".json";
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
      let _refreshScript = `<script>const ws=new WebSocket('ws://${localIp}:${port}');ws.onmessage=function(event){if(event.data==='refresh'){console.log('Refreshing page...');location.reload()}}</script>`;
      res.render(
        pugPath,
        _.merge(
          {
            data,
            common: _.merge(commonData, config.commonData, {
              _refreshScript
            })
          },
          { filters: getCompilePugFilter() }
        ),
        function (err, html) {
          if (err) {
            console.log(err);
            res.send(_refreshScript + err);
          } else {
            res.send(_refreshScript + html);
          }
        }
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

console.log("Listening:", `http://${localIp}:${port}`);
server.listen(port);
