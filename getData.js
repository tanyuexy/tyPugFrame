import fse from "fs-extra";
import path from "path";
const __dirname = path.resolve();
export async function get_common_data(language) {
  return {};
}
export async function get_detail_a_data(language) {
  let data = [{ page_name: "" }] || { page_name: "" } || null;
  return data;
}
export async function get_detail_index_data(language) {
  let data = [{ page_name: "" }] || { page_name: "" } || null;
  return data;
}
export async function get_games_index_data(language) {
  let data = [{ page_name: "" }] || { page_name: "" } || null;
  return data;
}
export async function get_index_data(language) {
  let data = { a: 1 } || null;
  return data;
}
