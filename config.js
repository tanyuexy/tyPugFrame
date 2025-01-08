export const config = {
  //开发环境的配置
  devServer: {
    //开发服务器的端口
    port: 80
  },
  //配置getData.js中自动生成的函数模版
  getDataFnTemplate: function template(language) {
    let data = { page_name: "" } || [{ page_name: "" }];
    return data;
  },
  //配置的国家数组将会遍历参数传递给getData.js中的函数并且影响翻译时默认将会翻译到的语言以及打包时候将会打包哪些国家的数据内容 数组的第一个国家将会是开发环境下默认访问到的国家的数据
  languageList: ["us"],
  //所有国家模版中都会用到的数据pug文件中可以使用common对象去访问
  commonData: { version: "1.1.0" },
  //pug打包成生成函数的根目录名字
  fnOutput: "sites",
  //pug打包成html的根目录名字
  staticOutput: "sites",
  //打包会打包/template/static/的哪些文件夹参数为空数组或者undefined则全打包(有些js、css文件将会嵌入pug中你可以区分不打包进去)
  buildStaticDirArr: ["js", "css", "img"],
  //自定义打包的数据以及生成的html路径。如果说遇到以下情况:需要用同一个模版但不同数据、不同页面用到相同的数据但是每个页面存一份会太大了、页面可能没办法通过单一的getData.js的函数获取数据、将会用到此配置
  fileMapTable: [],
  //下载数据的时候会并发下载几个国家的数据(如果下载的时候socket断了可以把这个改低点)
  fetchDataLangLimit: 3,
  // 是否监听语言文件变化重新获取_common.json的数据
  languageFileChangeUpdateCommon: true,
  // 是否混淆js文件
  obfuscateJavaScript: true
};
