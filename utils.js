import fse from "fs-extra";
import path from "path";
import less from "less";
import tcpPortUsed from "tcp-port-used";
import { config } from "./config.js";

const __dirname = path.resolve();
const pathSymbol = process.platform == "linux" ? "/" : "\\";

export async function getPagesPugFilePathArr(isFilter) {
  let pagesPugFilePathArr = (
    await fse.readdir(path.join(__dirname, "/template/pages"), {
      recursive: true
    })
  ).filter((fileName) => fileName.endsWith(".pug"));

  if (isFilter) {
    pagesPugFilePathArr = pagesPugFilePathArr.map((fileName) => {
      return pagesPathFilter(fileName);
    });
  }
  pagesPugFilePathArr = Array.from(new Set(pagesPugFilePathArr));
  return pagesPugFilePathArr;
}

export function pagesPathFilter(pugPath) {
  if (config.isMatchLanguage) {
    pugPath = pugPath
      .split(pathSymbol)
      .filter((item) => !config.languageList.includes(item))
      .join(pathSymbol);
  }
  if (config.isMatchDevice) {
    pugPath = pugPath
      .split(pathSymbol)
      .filter((item) => !["pc", "mobile", "ipad"].includes(item))
      .join(pathSymbol);
  }
  return pugPath;
}

export function getCompilePugFilter() {
  return {
    less: async function (text) {
      text = (await less.render(text)).css;
      return text;
    }
  };
}

export function pathIsSame(path1, path2) {
  return (
    path1.replaceAll("/", "").replaceAll("\\", "") ===
    path2.replaceAll("/", "").replaceAll("\\", "")
  );
}

export async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getIdleProt(port, Ip) {
  while (1) {
    if (!(await tcpPortUsed.check(port, Ip))) {
      break;
    }
    port++;
  }
  return port;
}

export function debounce(func, delay) {
  let timeoutId;

  return function () {
    const context = this;
    const args = arguments;

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// async function pugTemplatefilterBlock(pugPath) {
//   try {
//     const regex = new RegExp(
//       `\\$${dynamicContent}\\$(.*?)\\$${dynamicContent}\\$`,
//       "g"
//     );
//     if (pugPath) {
//     } else {
//     }
//     const files = await fse.readdir(folderPath, {
//       recursive: true
//     });
//     files.forEach((fileName) => {
//       if (fileExtArr.some((ext) => fileName.endsWith(ext))) {
//         proList.push(
//           new Promise(async (resolve, reject) => {
//             const filePath = path.join(folderPath, fileName);
//             const fileContent = await fse.readFile(filePath, "utf8");
//             obj[filePath] = fileContent;
//             resolve();
//           })
//         );
//       }
//     });
//   } catch (error) {
//     console.error(`Error reading files: ${error}`);
//   }
// }
