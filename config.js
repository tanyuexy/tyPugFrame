export const config = {
  devServer: {
    port: 80
  },
  getDataFnTemplate:
    "(language) {\n let data = {page_name:''} || [{page_name:''}] \n return data \n}",
  languageList: ["us"],
  filterBlock: {
    ads: true
  },
  commonData: { versoin: "1.0.0" },
  fnOutput: "demoFn",
  staticOutput: "demoDist",
  isMatchLanguage: true,
  isMatchDevice: true,
  isMatchEsi: false
};
