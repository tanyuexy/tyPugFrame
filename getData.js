import fse from "fs-extra";
import path from "path";
import _ from "lodash";
import axios from "axios";
import languageData from "./langConfig/languageData.js";
const __dirname = path.resolve();

export async function get_common_data(language) {
  let data = languageData[language];
  return data;
}

export async function get_index_data(language) {
  let data = { page_name: "", a: "index" } || [{ page_name: "" }];
  return data;
}

export async function get_lp_index_data(language) {
  let data = [];
  for (let index = 1; index < 1000; index++) {
    let obj = { page_name: index, a: "lp_" + index };
    data.push(obj);
  }
  return data;
}

export async function get_lp_common_data(language) {
  return { a: 1 };
}

export async function get_group_data(language) {
  let data = [
    { page_name: "group1", a: 1 },
    { page_name: "group2", a: 2 }
  ];
  return data;
}
