import fse from "fs-extra";
import path from "path";
import less from "less";
import tcpPortUsed from "tcp-port-used";

const __dirname = path.resolve();

let pagesPugFilePathArr;
export async function getPagesPugFilePathArr() {
  pagesPugFilePathArr = (
    await fse.readdir(path.join(__dirname, "/template/pages"), {
      recursive: true
    })
  ).filter((fileName) => fileName.endsWith(".pug"));
  return pagesPugFilePathArr;
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
