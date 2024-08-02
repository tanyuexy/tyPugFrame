const fsPro = require("node:fs/promises");
const pug = require("pug");
const path = require("path");
const { execSync } = require("child_process");

//在编译前对pug文件做一些处理
function pugFileContentConversion(fileContent) {
  fileContent = fileContent.replace(/include(.*)(?= )/g, (str) => {
    return str.replace(/less/g, "css");
  });
  fileContent = fileContent.replace(/src(.*)(?=\))/g, (str) => {
    return str.replace("/img", "../img");
  });
  fileContent = fileContent.replace(/extends(.*)(?=.pug)/g, (str) => {
    return str.replace(/template/g, "temp");
  });
  return fileContent;
}

//编译less->css
async function compileLessToCss() {
  let lessFilesPath = path.join(__dirname, "/assets/less");
  try {
    const files = await fsPro.readdir(lessFilesPath, {
      recursive: true
    });
    files
      .filter((item) => item.endsWith(".less"))
      .forEach(async (fileName) => {
        let lessPath = path.join(lessFilesPath, fileName);
        let cssPath = lessPath.replace(/less/g, "css");
        if (!(await checkFileExists(cssPath)))
          execSync(`lessc ${lessPath} ${cssPath}`);
      });
  } catch (error) {
    console.log(error);
  }
}

//判断一个文件夹或者文件是否存在
async function checkFileExists(filePath) {
  try {
    await fsPro.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

//写入文件如果遇到不存在的目录则创建
async function writeFileWithCreate(filePath, data) {
  const folderPath = path.dirname(filePath);
  try {
    // 检查文件夹是否存在，如果不存在则先创建文件夹
    try {
      await fsPro.access(folderPath);
    } catch (error) {
      await fsPro.mkdir(folderPath, { recursive: true });
    }

    // 创建文件并写入数据
    await fsPro.writeFile(filePath, data);
    // console.log(`文件 ${filePath} 已成功创建并写入数据`);
  } catch (err) {
    console.error(`写入文件时出错: ${err}`);
  }
}

//根据后缀名读取文件夹里的所有文件内容
async function readAllFilesValueInFolder(folderPath, fileExtArr) {
  let obj = {};
  let proList = [];
  try {
    const files = await fsPro.readdir(folderPath, {
      recursive: true
    });
    files.forEach((fileName) => {
      if (fileExtArr.some((ext) => fileName.endsWith(ext))) {
        proList.push(
          new Promise(async (resolve, reject) => {
            const filePath = path.join(folderPath, fileName);
            const fileContent = await fsPro.readFile(filePath, "utf8");
            obj[filePath] = fileContent;
            resolve();
          })
        );
      }
    });
  } catch (error) {
    console.error(`Error reading files: ${error}`);
  }
  await Promise.all(proList);
  return obj;
}

//复制文件夹里的所有文件到另一个文件夹
async function copyFilesRecursively(sourceDir, targetDir) {
  try {
    // 读取源文件夹中的文件列表
    const files = await fsPro.readdir(sourceDir);

    // 遍历文件列表
    for (const file of files) {
      const sourceFilePath = path.join(sourceDir, file);
      const targetFilePath = path.join(targetDir, file);

      const stats = await fsPro.lstat(sourceFilePath);

      if (stats.isDirectory()) {
        // 如果是子文件夹，递归调用复制函数
        await fsPro.mkdir(targetFilePath, { recursive: true });
        await copyFilesRecursively(sourceFilePath, targetFilePath);
      } else {
        // 如果是文件，直接复制文件
        const data = await fsPro.readFile(sourceFilePath);
        await writeFileWithCreate(targetFilePath, data);
        // console.log(`Copied ${file} to ${targetDir}`);
      }
    }
    // console.log("All files copied successfully.");
  } catch (err) {
    console.error("Error copying files:", err);
  }
}

//将处理完的pug文件拷到temp文件夹然后编译pug文件输出到output文件夹下
async function generateFinalPug() {
  let pugFilePath = path.join(__dirname, "/template/");
  let obj = await readAllFilesValueInFolder(pugFilePath, [".pug"]);
  await compileLessToCss();
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      obj[key] = pugFileContentConversion(obj[key]);
      let newKey = key.replace("template", "temp");
      obj[newKey] = obj[key];
      delete obj[key];
      await writeFileWithCreate(newKey, obj[newKey]);
    }
  }
  let proList = [];
  ["css", "img", "js"].forEach(async (str) => {
    let targetFolderPath = path.join(__dirname, "/temp", str);
    let targetFolderPath2 = path.join(__dirname, "/output", str);
    let sourceFolderPath = path.join(__dirname, "/assets", str);
    if (str !== "img") {
      proList.push(
        new Promise(async (resolve, reject) => {
          await copyFilesRecursively(sourceFolderPath, targetFolderPath);
          resolve();
        })
      );
    }
    await copyFilesRecursively(sourceFolderPath, targetFolderPath2);
  });
  await Promise.all(proList);
  Object.keys(obj).forEach((key) => {
    if (key.includes("pages")) {
      const basedir = path.join(__dirname, "/temp");
      let html = pug.compileFile(key, { basedir })();
      let outputPath = key
        .replace(/temp/g, "output")
        .replace(/\.pug/g, ".html");
      writeFileWithCreate(outputPath, html);
    }
  });
}

generateFinalPug();

// (async () => {
//   for (const key in obj) {
//     if (Object.hasOwnProperty.call(obj, key)) {
//       obj[key] = pugFileContentConversion(obj[key]);
//     }
//   }
//   for (const key in obj) {
//     if (Object.hasOwnProperty.call(obj, key)) {
//       console.log(obj[key]);
//       pug.compile(obj[key], {
//         filename: "base.pug"
//       })();
//     }
//   }
// })();
