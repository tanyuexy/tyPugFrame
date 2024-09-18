import chokidar from "chokidar";
import fse from "fs-extra";
import path from "path";
import { exec } from "child_process";
import { pathIsSame, debounce } from "./utils.js";
import { generateGetDataFn } from "./generate.js";
import { config } from "./config.js";
const __dirname = path.resolve();

/**
 * 更改/template刷新网页
 */
function watchTemplate() {
  const refreshPagFn = debounce(() => {
    exec(`curl http://${process.env._localIp}:${process.env._port}/_refresh`);
  }, 300);
  const generateFun = debounce(generateGetDataFn, 500);
  let watch = chokidar.watch("./template", {
    persistent: true
    // ignored: [/node_modules/, /\.git/]
  });
  watch
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    })
    .on("add", (path) => {
      if (path.endsWith(".pug")) {
        generateFun();
      }
      refreshPagFn();
    })
    .on("change", refreshPagFn)
    .on("unlink", refreshPagFn)
    .on("unlinkDir", refreshPagFn);
}

let fnOutput = config.fnOutput;
let staticOutput = config.staticOutput;
function watchConfig() {
  let watch = chokidar.watch("./config.json", {
    persistent: true
  });
  watch
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    })
    .on("add", () => {
      let gitignore = fse.readFileSync("./.gitignore").toString();
      if (!gitignore.includes(fnOutput)) {
        gitignore += `${fnOutput}\n`;
        fse.writeFileSync("./.gitignore", gitignore);
      }
      if (!gitignore.includes(staticOutput)) {
        gitignore += `${staticOutput}\n`;
        fse.writeFileSync("./.gitignore", gitignore);
      }
    })
    .on("change", () => {
      config = fse.readJSONSync("./config.json");
      let gitignore = fse.readFileSync("./.gitignore").toString();
      gitignore.replace(fnOutput, config.fnOutput);
      gitignore.replace(staticOutput, config.staticOutput);
    });
}

(() => {
  watchTemplate();
  watchConfig();
})();
