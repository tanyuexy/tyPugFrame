export const config = {
  devServer: {
    port: 80
  },
  getDataFnTemplate:
    "(language) {\n let data = {page_name:''} || [{page_name:''}] \n return data \n}",
  languageList: ["us", "jp"],
  commonData: { versoin: "1.0.0" },
  fnOutput: "demoFn",
  staticOutput: "demoDist",
  isMatchLanguage: false,
  isMatchDevice: false,
  isMatchEsi: false,
  fileMapTable: [
    {
      //模版路径
      pugPath: "/pages/index.pug",
      //getData中的函数
      getDataFn: "get_lp_index_data",
      //输出的目录如果getDataFn获取的数据为数组并且输出outPutPath路径格式为[property]则会以property循环创建
      outPutPath: "/[page_name].html",
      //需要输出的语言
      languageList: ["us", "jp"],
      //dev环境下如何访问
      devMatchFn: (reqPath, device) => {
        if (reqPath.includes("lp")) {
          return true;
        }
      }
    },
    {
      getDataFn: "get_lp_common_data",
      outPutPath: "/common/lp.json",
      languageList: ["us"]
    },
    {
      getDataFn: "get_group_data",
      outPutPath: "/common/group/[page_name].json"
    }
  ]
};
