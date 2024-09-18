export const config = {
  devServer: {
    port: 3003
  },
  getDataFnTemplate:
    "(language) {\n let data = [{page_name:''}] || {page_name:''} || null \n return data \n}",
  languageList: ["us", "br", "jp", "vn"],
  commonData: {},
  fnOutput: "dist",
  staticOutput: "staticDist",
  isMatchLanguage: true,
  isMatchDevice: true
  //   pagesMapTable: [
  //     {
  //       inputPath: "",
  //       outputPath: "",
  //       data: [] || {}
  //     }
  //   ]
};
