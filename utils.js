import fse from "fs-extra";
import path from "path";
import tcpPortUsed from "tcp-port-used";
import { config } from "./config.js";

const __dirname = path.resolve();
export const pathSymbol = process.platform.startsWith("win") ? "\\" : "/";

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
  pugPath = pugPath
    .split(pathSymbol)
    .filter((item) => !config.languageList.includes(item))
    .join(pathSymbol);
  pugPath = pugPath
    .split(pathSymbol)
    .filter((item) => !["pc", "mobile", "ipad"].includes(item))
    .join(pathSymbol);
  return pugPath;
}

export function getCompilePugFilter() {
  return {};
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

/**
 * 匹配修改 ESI
 * @param {*} body - pages 明文
 * @param {*} data - R2 数据
 * @returns
 */
export async function matchESI(body, data) {
  /**
   * 处理单个 ESI
   * @param {*} content 需要替换的文本
   * @param {*} data 数据
   * @returns
   */
  async function setVar(content, data) {
    return await content.replace(/\^\^esi:(.*?)\^\^/g, (match, key) => {
      // 填充 adsense channel id 和 gam key-value
      // if(PLACEMENT_KEY.includes(key)){
      //     return placement[key]
      // }
      // 填充主体内容
      let res = data[key.trim()];
      return typeof res == "object"
        ? JSON.stringify(res).replace(/\"/g, "&quot;")
        : res;
    });
  }
  try {
    let newBody = "";
    let current = 0;
    let esiReg = /<esi:for(.*?)>([\s\S]*?)<\/esi:for>/gm;
    var res = esiReg.exec(body);

    for (; res != null; res = esiReg.exec(body)) {
      // for 循环
      let regStr = res[0]; // 完整的for str
      // 获取开始标签
      var kvReg = /(\w+)="(\w+|\-?\d+)"/gm;
      var kv = {};
      var temKv;
      while ((temKv = kvReg.exec(res[1]))) {
        kv[temKv[1]] = temKv[2];
      }
      const { key, start, end, index_floor } = kv;
      let dom = res[2];
      let data_;
      data_ = data[key].slice(start, end);
      newBody += body.slice(current, res.index);
      for (var i = 0; i < data_.length; i++) {
        let tmpData = data_[i];
        tmpData.index = index_floor ? i + parseInt(index_floor) : i;
        newBody += await setVar(dom, tmpData);
      }
      current = res.index + regStr.length;
    }
    newBody += body.slice(current, body.length);
    return await setVar(newBody, data);
  } catch (error) {
    console.log(error);
  }
}

export async function asyncArrayEach(arr, operationsFun) {
  try {
    const results = await Promise.all(arr.map(operationsFun));
    return results;
  } catch (error) {
    throw error;
  }
}
