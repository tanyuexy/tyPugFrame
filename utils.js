import fse from "fs-extra";
import path from "path";
const __dirname = path.resolve();

export async function getPagesPugFnToGlobal() {
  let pugFnMap = new Map();
  global._pugFnMap = pugFnMap;
  let pagesPugFilePathArr = await getPagesPugFilePathArr();
  let pro = [];
  pagesPugFilePathArr.forEach(async (fileName) => {
    pro.push(
      new Promise(async (resolve, reject) => {
        let key = fileName.slice(0, -4);
        let fn = await fse.readFile(
          path.join(__dirname, "/pagesPugFn", key) + ".js"
        );
        pugFnMap.set(
          key.replace("/", "").replace("\\", ""),
          Function(String(fn))()
        );
        resolve();
      })
    );
  });
  await Promise.all(pro);
}

export async function getPagesPugFilePathArr() {
  return (
    await fse.readdir(path.join(__dirname, "/template/pages"), {
      recursive: true
    })
  ).filter((fileName) => fileName.endsWith(".pug"));
}
