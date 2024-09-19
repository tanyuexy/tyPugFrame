export const config = {
  devServer: {
    port: 3003
  },
  getDataFnTemplate:
    "(language) {\n let data = {page_name:''} || [{page_name:''}] || null \n return data \n}",
  languageList: ["us", "jp"],
  commonData: {},
  fnOutput: "topziz_newFn",
  staticOutput: "topziz_new",
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
