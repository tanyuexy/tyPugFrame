import express from "express";
import ip from "ip";
import fse from "fs-extra";
import path from "path";
import { generateJsonDataFile } from "./getData.js";

const __dirname = path.resolve();
const config = await fse.readJson("./config.json");
await generateJsonDataFile();
const app = express();

app.set("views", path.join(__dirname, "temp", "pages"));
app.set("view engine", "pug");
app.locals.basedir = path.join(__dirname, "temp");

app.use("/css", express.static("./assets/css"));
app.use("/js", express.static("./assets/js"));
app.use("/img", express.static("./assets/img"));
app.use(express.static("./assets/rootPath"));

app.get("*", (req, res) => {
  let template = req.path.slice(1).replace(".html", ".pug");
  if (req.path == "/") {
    template = "index.pug";
  }
  if (!fse.pathExistsSync(path.join(__dirname, "temp", "pages", template))) {
    template = "index.pug";
  }
  res.render(template);
});

app.listen(config.devServer.port);
const localIp = ip.address();
console.log("Listening: ", localIp + ":" + config.devServer.port);
