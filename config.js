export const config = {
  //开发环境的配置
  devServer: {
    //开发服务器的端口
    port: 80
  },
  //配置getData.js中自动生成的函数模版
  getDataFnTemplate:
    "(language) {\n let data = {page_name:''} || [{page_name:''}] \n return data \n}",
  //配置的国家数组将会遍历参数传递给getData.js中的函数并且影响翻译时默认将会翻译到的语言以及打包时候将会打包哪些国家的数据内容 数组的第一个国家将会是开发环境下默认访问到的国家的数据
  languageList: ["us", "jp"],
  //所有国家模版中都会用到的数据pug文件中可以使用common对象去访问
  commonData: { version: "1.0.0" },
  //pug打包成生成函数的根目录名字
  fnOutput: "sites",
  //pug打包成html的根目录名字
  staticOutput: "sites",
  //自定义打包的数据以及生成的html路径。如果说遇到以下情况:需要用同一个模版但不同数据、不同页面用到相同的数据但是每个页面存一份会太大了、页面可能没办法通过单一的getData.js的函数获取数据、将会用到此配置
  fileMapTable: [
    {
      // /template/pages下的模版路径
      pugPath: "/index.pug",
      //getData.js中的函数
      getDataFn: "get_lp_index_data",
      //输出的目录如果getDataFn返回的数据为对象数组并且输出outPutPath路径格式为[prop]则会以对象中的prop属性循环创建
      outPutPath: "/lp/[page_name].html",
      //输出输入的语言如果有则拼接字符串到路径(可以过滤国家)
      languageList: ["us", "jp"],
      //输出输入的设备路径如果有则拼接字符串到路径(可以过滤设备)
      deviceList: ["pc", "mobile", "ipad"],
      //dev环境下如何访问
      devMatchFn: (reqPath, device) => {
        if (reqPath.includes("lp")) {
          return true;
        }
      }
    },
    //以下会调用getData.js中的get_lp_common_data函数将返回的数据保存到/us/common/lp.json
    {
      getDataFn: "get_lp_common_data",
      outPutPath: "/common/lp.json",
      //过滤国家
      languageList: ["us"]
    },
    //以下将会在/common/group/下根据get_group_data返回的数组创建多个json文件
    {
      getDataFn: "get_group_data",
      outPutPath: "/common/group/[page_name].json"
    }
  ]
};
