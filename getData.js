import fse from "fs-extra";
import path from "path";
import LangConfig from "./sourceData/langConfig.js";

const __dirname = path.resolve();

export async function getCommonData() {
  return {};
}
export async function get_detail_index_data(language) {
 let data = [{page_name:''}] || {page_name:''} || null 
 return data 
}
export async function get_index_data(language) {
 let data = [{page_name:''}] || {page_name:''} || null 
 return data 
}
