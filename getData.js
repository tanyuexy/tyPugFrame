import fse from "fs-extra";
import path from "path";
import axios from "axios";
const __dirname = path.resolve();
export async function get_common_data(language) {
  return {};
}
export async function get_index_data(language) {
  let data = { page_name: "" } || [{ page_name: "" }];
  return data;
}
