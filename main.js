let curCmd = process.env.npm_lifecycle_event;
import { Worker } from "worker_threads";
import {
  generateGetDataFn,
  compilePagesPugToFn,
  fetchDataToJsonFile,
  buildFn,
  buildStatic
} from "./generate.js";

await generateGetDataFn();
switch (curCmd) {
  case "getData":
    const args = process.argv.slice(2);
    fetchDataToJsonFile(args);
    break;
  case "dev":
    await import("./devServer.js");
    new Worker("./watchFile.js");
    break;
  case "compileFn":
    compilePagesPugToFn();
  case "buildFn":
    buildFn();
    break;
  case "buildStatic":
    buildStatic();
    break;
}
