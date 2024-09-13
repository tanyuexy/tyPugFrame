import chokidar from "chokidar";
import fse from "fs-extra";
import path from "path";
import { pathIsSame } from "./utils.js";
import { generateGetDataFn, fetchDataToJsonFile } from "./generate.js";

const __dirname = path.resolve();
const config = fse.readJSONSync("./config.json");
await fetchDataToJsonFile();
const jsonDataAllfileArr = (
  await fse.readdir(path.join(__dirname, "jsonData"), {
    recursive: true
  })
).map((item) => path.join("jsonData", item));
console.log(jsonDataAllfileArr);

function watchRoot() {
  let watch = chokidar.watch(".", {
    persistent: true,
    ignored: [/node_modules/, /\.git/]
  });
  watch
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    })
    .on("unlink", (filePath) => {
      if (jsonDataAllfileArr.find((item) => pathIsSame(item, filePath))) {
        console.log(`文件 ${filePath} 已删除`);
      }
    })
    .on("unlinkDir", async (path) => {
      console.log(`文件夹 ${path} 已删除`);
      if (path.includes("jsonData")) {
        if (!fse.pathExistsSync("./jsonData")) {
          setTimeout(async () => {
            await fetchDataToJsonFile();
          }, 200);
          return;
        }
      }
    });
}
watchRoot();
