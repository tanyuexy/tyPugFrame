import { Worker } from "worker_threads";
import {
  generateGetDataFn,
  compilePagesPugToFn,
  fetchDataToJsonFile,
  buildFn,
  buildStatic
} from "./generate.js";

let curCmd = process.env.npm_lifecycle_event;

try {
  switch (curCmd) {
    case "getFun":
      await generateGetDataFn();
      break;
    case "getData":
      await generateGetDataFn();
      const args = process.argv.slice(2);
      await fetchDataToJsonFile(args);
      break;
    case "dev":
      await import("./devServer.js");
      new Worker("./watchFile.js");
      break;
    case "compileFn":
      await compilePagesPugToFn();
      break;
    case "buildFn":
      await buildFn();
      break;
    case "buildStatic":
      await buildStatic();
      break;
    default:
      console.log(`未知的命令: ${curCmd}`);
  }
} catch (error) {
  console.error(`执行命令 ${curCmd} 时发生错误:`, error);
  process.exit(1);
}
