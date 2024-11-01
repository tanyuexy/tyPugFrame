## 目录结构

- src/
  - langConfig  #多语言数据以及翻译模块
    - languageData.js  #多语言化所需数据 将会按国家作为key区分数据
  - public  #存放网站根目录所需文件 如ads.txt
  - template  #pug模版存放的目录
    - common  #放base.pug
    - components  #放组件
    - pages  #放页面级pug，且实际生成的路由跟此文件夹一致(例如/pages/detail/index.pug -> domain/detail/xxx.html)
    - static  #静态文件存放的位置图片、样式、js、字体等资源建议放在这
  - config.js  #配置文件(后面会单独介绍)
  - getData.js  #获取页面数据的文件所有数据的总入口
    **通常情况您只需要关注以上的目录即可，其他文件后续将会作为lib不再暴露出来。如果您遇到了必须修改其他文件才能达到需求的情况请 [联系我](https://www.feishu.cn/invitation/page/add_contact/?token=520h0966-4f6d-4e34-90f6-829ce85a2389)**

## config.js配置

```javascript
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
          fnOutput: "demoFn",
          //pug打包成html的根目录名字
          staticOutput: "demoDist",
          //打包会打包/template/static/的哪些文件夹(有些js、css文件将会嵌入pug中你可以区分不打包进去)
          buildStaticDirArr: ["js", "css", "img"],
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
        }
```

## 开发流程

1. 在/template/pages/目录下编写页面的pug文件
2. 执行npm run getData 生成getData.js,在getData.js中会根据/template/pages/目录自动生成对应的函数，如/template/pages/index.pug将会在getData.js中生成get_index_data函数模版
3. 在getData.js中生成函数的函数体中编写拿数据的代码
4. 再次执行npm run getData这将会自动调用getData.js中页面的函数获取数据并存到/jsonData目录下
5. 执行npm run dev
6. 通常情况下你将会得到开发环境的地址访问即可预览如果你有更新 /template/pages/目录中的pug文件请重复一次这个流程

## 常用指令

**npm run getData：** 执行gatData.js方法获取数据

**npm run dev：** 开启开发环境服务器

**npm run lang：** 默认将/langConfig/languageData.js的us的数据翻译到config.languageList配置的国家 可选参数k=属性1,属性2:本次只翻译k后面带的属性、c=国家1,国家2:本次只翻译到c后面带的国家。
```javascript
//这样会将us的数据对象中的a,b属性翻译到jp,fr的两个国家
npm run lang k=a,b c=jp,fr 
```

**npm run compileFn：** 将pug模版编译为生成函数写入/pagesPugFn/index.js

**npm run buildFn：** 把数据、静态资源以及将pug模版生成函数然后打包

**npm run buildStatic：** 把数据、静态资源将pug模版生成html然后打包

## 补充

1. getData.js中会有一个保留的get_common_data(language)函数参数language为国家 您可以根据这个函数去返回各个国家所需要的不同数据建议是将这部分数据放在/langConfig/languageData.js这将可以结合翻译模块去使用。
   ```javascript
   import languageData from "./langConfig/languageData.js";
   //这样在pug文件中可以使用common.lang 去访问数据
   export async function get_common_data(language) {
     let data = languageData[language];
     return { lang: data };
   }
   ```
2. 通常不需要关注getData.js中的函数在哪里调用
3. 本地访问页面时需要带.html
4. 假如想创建/detail/xxxx.html(具体名字由数据中的属性决定)的这种路由。您需要:1、pug文件为/template/detail/index.pug 2、getData.js中的获取此页面数据的函数返回值为对象数组并且每个对象中都有page_name属性这将做为页面的具体名字
   ```javascript
    //将会生成100个页面路由为/detail/1.html -> /detail/100.html在pug文件中可以通过data.a拿到的数据
    export async function get_detail_index_data(language) {
    let data = [];
    for (let index = 1; index <= 100; index++) {
      let obj = { page_name: index, a: "detail_" + index };
      data.push(obj);
    }
    return data;
   ```

  }
