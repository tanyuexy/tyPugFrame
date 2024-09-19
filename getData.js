import fse from "fs-extra";
import path from "path";
import langData from "./sourceData/langConfig.js";
const __dirname = path.resolve();
export async function get_common_data(language) {
  let categoryList = (await get_index_data()).indexData
    .sort((a, b) => b.list.length - a.list.length)
    .slice(0, 6)
    .map((obj) => obj.category);
  return { lang: langData[0], categoryList };
}

export async function get_search_index_data(language) {
  let data = [{ page_name: "" }] || { page_name: "" } || null;
  return data;
}
export async function get_download_index_data(language) {
  let data = [{ page_name: "" }] || { page_name: "" } || null;
  return data;
}
export async function get_topDownload_index_data(language) {
  let data = await get_app_index_data();
  return data;
}
export async function get_index_data(language) {
  let data = await fse.readJson("./sourceData/index.json");
  return { indexData: data };
}
export async function get_app_index_data(language) {
  let data = [];
  const files = await fse.readdir("./sourceData/detail", {
    recursive: true
  });
  let pro = [];
  files
    .filter((item) => item.endsWith(".json"))
    .forEach(async (fileName) => {
      pro.push(
        new Promise(async (resolve, reject) => {
          let obj = await fse.readJson(`./sourceData/detail/${fileName}`);
          obj.page_name = fileName;
          data.push(obj);
          resolve();
        })
      );
    });
  await Promise.all(pro);
  return data;
}

export async function get_category_index_data(language) {
  let data = [{ page_name: "" }] || { page_name: "" } || null;
  return data;
}
export async function get_cat_index_data(language) {
  let data = [];
  const files = await fse.readdir("./sourceData/category", {
    recursive: true
  });
  let pro = [];

  files
    .filter((item) => item.endsWith(".json"))
    .forEach(async (fileName) => {
      pro.push(
        new Promise(async (resolve, reject) => {
          let obj = await fse.readJson(`./sourceData/category/${fileName}`);
          obj.page_name = fileName;
          data.push(obj);
          resolve();
        })
      );
    });
  await Promise.all(pro);
  return data;
}
export async function get_jp_app_index_data(language) {
  let data = { page_name: "" } || [{ page_name: "" }] || null;
  return data;
}
export async function get_about_cookies_data(language) {
  let data = { page_name: "" } || [{ page_name: "" }] || null;
  return null;
}
export async function get_about_privacy_data(language) {
  let data = { page_name: "" } || [{ page_name: "" }] || null;
  return null;
}
export async function get_about_dmca_data(language) {
  let data = { page_name: "" } || [{ page_name: "" }] || null;
  return null;
}
export async function get_about_terms_data(language) {
  let data = { page_name: "" } || [{ page_name: "" }] || null;
  return null;
}
