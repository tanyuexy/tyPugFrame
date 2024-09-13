function pug_attr(t,e,n,r){if(!1===e||null==e||!e&&("class"===t||"style"===t))return"";if(!0===e)return" "+(r?t:t+'="'+t+'"');var f=typeof e;return"object"!==f&&"function"!==f||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(e,n,r,t){if(!(e instanceof Error))throw e;if(!("undefined"==typeof window&&n||t))throw e.message+=" on line "+r,e;var o,a,i,s;try{t=t||require("fs").readFileSync(n,{encoding:"utf8"}),o=3,a=t.split("\n"),i=Math.max(r-o,0),s=Math.min(a.length,r+o)}catch(t){return e.message+=" - could not read from "+n+" ("+t.message+")",void pug_rethrow(e,null,r)}o=a.slice(i,s).map(function(e,n){var t=n+i+1;return(t==r?"  > ":"    ")+t+"| "+e}).join("\n"),e.path=n;try{e.message=(n||"Pug")+":"+r+"\n"+o+"\n\n"+e.message}catch(e){}throw e}export function compile_detail_index(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"undefined":"extends \u002Fcommon\u002Fbase.pug\r\nblock head \r\n    style\r\n        include:less \u002Fstatic\u002Fless\u002Fpages\u002Findex.less\r\nblock main \r\n    div.index\r\n        \u002F\u002F- each categoryItem,index in data\r\n        \u002F\u002F-     div.index-item=index\r\n        \u002F\u002F-         div.index-item-top\r\n        \u002F\u002F-             div(style=\"display: flex; align-items: center\")\r\n        \u002F\u002F-                 img(src=\"\u002Fimg\u002Ficon.svg\", alt=\"\")\r\n        \u002F\u002F-                 h2 #{categoryItem.category}\r\n        \u002F\u002F-             p.showAllButton Show all Top\r\n                    \u002F\u002F- include \u002Fcomponents\u002FgameCardList.pug\r\n    \u002F\u002F-             div.index-item-imgList\r\n    \u002F\u002F-                 each _,index in 6\r\n    \u002F\u002F-                     a.imgItem(href=`\u002Fapp\u002F${categoryItem.list[idx - 1]?.info.img_name.slice(0,-4)}`)\r\n    \u002F\u002F-                         img(src='https:\u002F\u002Fresource.topziz.com\u002F' + categoryItem.list[idx - 1]?.info.img_name, alt=\"\") \r\n    \u002F\u002F-                         span.rate #{categoryItem.list[idx - 1]?.info.rate}         \r\n    \u002F\u002F- include \u002Fcomponents\u002Ffooter.pug","D:\\Web\\pugFrame\\template\\common\\base.pug":"doctype html\r\nhtml(v=`1.0.6`)\r\n  mixin imgPlus(src)\r\n    - src = \"https:\u002F\u002Fresource.smartreviewstips.com\u002F\" + src\r\n    img.cs-lazy(data-load= src, alt=\"\") \r\n    .loading-img\r\n        .loading-inner\r\n          .dots-container\r\n            .dot\r\n            .dot\r\n            .dot\r\n            .dot\r\n            .dot  \r\n  mixin searchComp()\r\n    .searchComp\r\n        img(src=\"\u002Fstatic\u002Flogo3.svg\", alt=\"\")\r\n        p Explore, rate and share together! \r\n        p We provide reliable reviews to help consumers choose smarter.\r\n        .searchComp-input.box-shadow-20\r\n            input(type=\"search\" placeholder=\"Search for any reviews\").searchInputComp\r\n            div\r\n                img(src=\"\u002Fstatic\u002Fsearch.svg\", alt=\"\")     \r\n  head\r\n    block head\r\n  body\r\n    .content-body\r\n        block main\r\n        h1 #{data.b}\r\n","D:\\Web\\pugFrame\\template\\static\\less\\pages\\index.less":" .searchInputSearch::-webkit-search-cancel-button {\r\n     -webkit-appearance: none;\r\n }\r\n\r\n .searchInputSearch::-webkit-search-clear-button {\r\n     -webkit-appearance: none;\r\n }\r\n\r\n .search {\r\n     min-height: calc(100vh - 60px - 80px);\r\n\r\n     .search-header {\r\n         width: 100%;\r\n         height: 212px;\r\n         padding: 0 20px;\r\n         position: relative;\r\n         border-radius: 6px;\r\n         display: flex;\r\n         justify-content: center;\r\n         background: linear-gradient(99deg, #FFF4D1 1.51%, #BEE8D1 86.76%);\r\n\r\n         .box-shadow-20 {\r\n             width: 100%;\r\n             max-width: 1300px;\r\n             margin: auto;\r\n             height: 68px;\r\n             border-radius: 6px;\r\n             background: #FFF;\r\n             position: relative;\r\n\r\n             input {\r\n                 height: 100%;\r\n                 border: none;\r\n                 width: 100%;\r\n                 border-radius: 6px;\r\n                 padding-left: 20px;\r\n             }\r\n\r\n             input::placeholder {\r\n                 color: #BDBDBD;\r\n                 font-family: Noto Sans;\r\n                 font-size: 14px;\r\n                 font-weight: 400;\r\n                 line-height: 50px;\r\n                 text-align: left;\r\n             }\r\n\r\n             input:focus {\r\n                 outline: none;\r\n             }\r\n\r\n             div {\r\n                 cursor: pointer;\r\n                 position: absolute;\r\n                 right: 5px;\r\n                 top: 50%;\r\n                 transform: translateY(-50%);\r\n                 height: 53px;\r\n                 aspect-ratio: 2 \u002F 1;\r\n                 background-color: #FFD605;\r\n                 border-radius: 6px;\r\n                 display: flex;\r\n\r\n                 img {\r\n                     height: 50%;\r\n                     margin: auto;\r\n                 }\r\n             }\r\n\r\n         }\r\n     }\r\n\r\n     .body {\r\n         max-width: 1300px;\r\n         margin: auto;\r\n         padding: 0 20px;\r\n\r\n         h3 {\r\n             margin: 30px 0;\r\n         }\r\n\r\n         .searchValueList {\r\n             display: flex;\r\n             flex-direction: column;\r\n             width: 100%;\r\n\r\n             .item {\r\n                 width: 100%;\r\n                 border-bottom: 1px solid #E1E1E1;\r\n                 padding: 30px 0;\r\n\r\n                 .desc-text {\r\n                     margin: 14px 0;\r\n                 }\r\n\r\n                 .mini-text {\r\n                     display: flex;\r\n                     align-items: center;\r\n\r\n                     span {\r\n                         margin-right: 20px;\r\n                     }\r\n\r\n                     .fillCircle {\r\n                         background-color: #7E7E88;\r\n                         height: 4px;\r\n                         width: 4px;\r\n                         border-radius: 50%;\r\n                     }\r\n\r\n                     .fillCircle:last-child {\r\n                         display: none;\r\n                     }\r\n                 }\r\n             }\r\n\r\n             .item:hover .title-1 {\r\n                 color: #09B193;\r\n             }\r\n\r\n\r\n             .item:first-child {\r\n                 padding-top: 0px;\r\n             }\r\n         }\r\n\r\n         .pagesContr {\r\n             display: flex;\r\n             width: 100%;\r\n             justify-content: center;\r\n             margin: 60px 0 0;\r\n\r\n             .pagesList {\r\n                 display: flex;\r\n                 margin: 0px 30px;\r\n\r\n                 a {\r\n                     min-width: 32px;\r\n                     padding: 0 2px;\r\n                     width: auto;\r\n                     height: 34px;\r\n                     border-radius: 4px;\r\n                     background: #E3E3E3;\r\n                     flex-shrink: 0;\r\n                     margin: 0 6px;\r\n                     color: #333952;\r\n                     font-family: \"Noto Sans\";\r\n                     font-size: 16px;\r\n                     font-style: normal;\r\n                     font-weight: 400;\r\n                     line-height: 34px;\r\n                     text-align: center;\r\n                     \u002F* 175% *\u002F\r\n                 }\r\n\r\n\r\n\r\n             }\r\n\r\n             .prePage,\r\n             .nextPage {\r\n                 width: 34px;\r\n                 height: 34px;\r\n                 flex-shrink: 0;\r\n                 display: flex;\r\n                 justify-content: center;\r\n                 align-items: center;\r\n                 border-radius: 4px;\r\n                 background: #F3F3F3;\r\n             }\r\n         }\r\n     }\r\n }\r\n\r\n @media (max-width: 648px) {\r\n     .search {\r\n         .search-header {\r\n             height: 163px;\r\n\r\n             .box-shadow-20 {\r\n                 height: 50px;\r\n\r\n                 div {\r\n                     width: 63.982px;\r\n                     height: 38.971px;\r\n                     flex-shrink: 0;\r\n                     aspect-ratio: unset;\r\n                 }\r\n             }\r\n         }\r\n\r\n         .art-title {\r\n             font-size: 18px;\r\n         }\r\n\r\n         .title-1 {\r\n             font-size: 16px;\r\n         }\r\n\r\n         .desc-text {\r\n             font-size: 12px;\r\n         }\r\n\r\n         .mini-text {\r\n             font-size: 12px;\r\n         }\r\n     }\r\n\r\n     .search .body .pagesContr {\r\n         align-items: center;\r\n     }\r\n\r\n     .search .body .pagesContr .pagesList {\r\n         margin: 0 14px;\r\n         flex-wrap: wrap;\r\n     }\r\n\r\n     .search .body .pagesContr .pagesList a {\r\n         margin: 3px;\r\n         height: 27px;\r\n         width: auto;\r\n         min-width: 25px;\r\n         line-height: 27px;\r\n         font-size: 14px;\r\n     }\r\n\r\n     .search .body .pagesContr .nextPage,\r\n     .search .body .pagesContr .prePage {\r\n         height: 27px;\r\n         width: 27px;\r\n     }\r\n\r\n     .search .body .pagesContr .nextPage,\r\n     .search .body .pagesContr .nextPage {\r\n         height: 27px;\r\n         width: 27px;\r\n     }\r\n }"};
;
    var locals_for_with = (locals || {});
    
    (function (data) {
      ;pug_debug_line = 1;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003C!DOCTYPE html\u003E";
;pug_debug_line = 2;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Chtml v=\"1.0.6\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";

























;pug_debug_line = 14;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";























;pug_debug_line = 23;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Chead\u003E";
;pug_debug_line = 24;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
;pug_debug_line = 3;
pug_html = pug_html + "\u003Cstyle\u003E";
;pug_debug_line = 4;
pug_html = pug_html + "\u003C\u002Fstyle\u003E\u003C\u002Fhead\u003E";
;pug_debug_line = 25;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Cbody\u003E";
;pug_debug_line = 26;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Cdiv class=\"content-body\"\u003E";
;pug_debug_line = 27;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
;pug_debug_line = 6;
pug_html = pug_html + "\u003Cdiv class=\"index\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 28;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Ch1\u003E";
;pug_debug_line = 28;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = data.b) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fbody\u003E\u003C\u002Fhtml\u003E";
    }.call(this, "data" in locals_for_with ?
        locals_for_with.data :
        typeof data !== 'undefined' ? data : undefined));
    ;} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;}export function compile_index(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"undefined":"extends \u002Fcommon\u002Fbase.pug\r\nblock head\r\n    include:less \u002Fstatic\u002Fless\u002Fpages\u002Findex.less\r\n    include \u002Fstatic\u002Fjs\u002F1.js\r\nblock main\r\n  div.index\r\n        a #{common.b}\r\n        b 1111111111111111\r\n        h1 #{data.a}.about    \r\n        .about-header\r\n            h1 About Smart Reviews\r\n        .about-body.main-text\r\n            div Smart Reviews is a premier destination for in-depth, unbiased reviews and insights on a wide range of consumer products. Our mission is to empower our readers to make confident and informed purchasing decisions across diverse categories.\r\n            div Our team of experienced reviewers meticulously evaluates the latest innovations in a variety of product segments, including but not limited to Automotive, Home Appliances, Consumer Electronics, Household Goods, Personal Care, Fashion, and Sports & Outdoors. We utilize advanced assessment methodologies, including multidimensional analysis and real-world user experience narratives, to deliver insights that go beyond the surface-level.  \r\n            div What truly sets us apart is our commitment to innovation and a forward-thinking approach. We don't simply regurgitate product specifications; instead, we provide our readers with a comprehensive understanding of each product's performance, features, and value proposition. Our reviews not only highlight the strengths of each product but also critically examine their weaknesses, empowering our audience to make well-rounded decisions.\r\n            div Beyond the traditional product review, Smart Reviews also delves into emerging trends and unique consumer experiences. We provide detailed user guides, comparative analyses, and expert recommendations to ensure our readers have all the necessary tools to navigate the ever-evolving consumer landscape.\r\n            div Whether you're in the market for a game-changing kitchen appliance, the perfect smartphone to suit your lifestyle, or the most stylish and functional home decor, Smart Reviews is your trusted companion. Visit us today and let our cutting-edge insights guide your next purchase.","D:\\Web\\pugFrame\\template\\common\\base.pug":"doctype html\r\nhtml(v=`1.0.6`)\r\n  mixin imgPlus(src)\r\n    - src = \"https:\u002F\u002Fresource.smartreviewstips.com\u002F\" + src\r\n    img.cs-lazy(data-load= src, alt=\"\") \r\n    .loading-img\r\n        .loading-inner\r\n          .dots-container\r\n            .dot\r\n            .dot\r\n            .dot\r\n            .dot\r\n            .dot  \r\n  mixin searchComp()\r\n    .searchComp\r\n        img(src=\"\u002Fstatic\u002Flogo3.svg\", alt=\"\")\r\n        p Explore, rate and share together! \r\n        p We provide reliable reviews to help consumers choose smarter.\r\n        .searchComp-input.box-shadow-20\r\n            input(type=\"search\" placeholder=\"Search for any reviews\").searchInputComp\r\n            div\r\n                img(src=\"\u002Fstatic\u002Fsearch.svg\", alt=\"\")     \r\n  head\r\n    block head\r\n  body\r\n    .content-body\r\n        block main\r\n        h1 #{data.b}\r\n","D:\\Web\\pugFrame\\template\\static\\less\\pages\\index.less":" .searchInputSearch::-webkit-search-cancel-button {\r\n     -webkit-appearance: none;\r\n }\r\n\r\n .searchInputSearch::-webkit-search-clear-button {\r\n     -webkit-appearance: none;\r\n }\r\n\r\n .search {\r\n     min-height: calc(100vh - 60px - 80px);\r\n\r\n     .search-header {\r\n         width: 100%;\r\n         height: 212px;\r\n         padding: 0 20px;\r\n         position: relative;\r\n         border-radius: 6px;\r\n         display: flex;\r\n         justify-content: center;\r\n         background: linear-gradient(99deg, #FFF4D1 1.51%, #BEE8D1 86.76%);\r\n\r\n         .box-shadow-20 {\r\n             width: 100%;\r\n             max-width: 1300px;\r\n             margin: auto;\r\n             height: 68px;\r\n             border-radius: 6px;\r\n             background: #FFF;\r\n             position: relative;\r\n\r\n             input {\r\n                 height: 100%;\r\n                 border: none;\r\n                 width: 100%;\r\n                 border-radius: 6px;\r\n                 padding-left: 20px;\r\n             }\r\n\r\n             input::placeholder {\r\n                 color: #BDBDBD;\r\n                 font-family: Noto Sans;\r\n                 font-size: 14px;\r\n                 font-weight: 400;\r\n                 line-height: 50px;\r\n                 text-align: left;\r\n             }\r\n\r\n             input:focus {\r\n                 outline: none;\r\n             }\r\n\r\n             div {\r\n                 cursor: pointer;\r\n                 position: absolute;\r\n                 right: 5px;\r\n                 top: 50%;\r\n                 transform: translateY(-50%);\r\n                 height: 53px;\r\n                 aspect-ratio: 2 \u002F 1;\r\n                 background-color: #FFD605;\r\n                 border-radius: 6px;\r\n                 display: flex;\r\n\r\n                 img {\r\n                     height: 50%;\r\n                     margin: auto;\r\n                 }\r\n             }\r\n\r\n         }\r\n     }\r\n\r\n     .body {\r\n         max-width: 1300px;\r\n         margin: auto;\r\n         padding: 0 20px;\r\n\r\n         h3 {\r\n             margin: 30px 0;\r\n         }\r\n\r\n         .searchValueList {\r\n             display: flex;\r\n             flex-direction: column;\r\n             width: 100%;\r\n\r\n             .item {\r\n                 width: 100%;\r\n                 border-bottom: 1px solid #E1E1E1;\r\n                 padding: 30px 0;\r\n\r\n                 .desc-text {\r\n                     margin: 14px 0;\r\n                 }\r\n\r\n                 .mini-text {\r\n                     display: flex;\r\n                     align-items: center;\r\n\r\n                     span {\r\n                         margin-right: 20px;\r\n                     }\r\n\r\n                     .fillCircle {\r\n                         background-color: #7E7E88;\r\n                         height: 4px;\r\n                         width: 4px;\r\n                         border-radius: 50%;\r\n                     }\r\n\r\n                     .fillCircle:last-child {\r\n                         display: none;\r\n                     }\r\n                 }\r\n             }\r\n\r\n             .item:hover .title-1 {\r\n                 color: #09B193;\r\n             }\r\n\r\n\r\n             .item:first-child {\r\n                 padding-top: 0px;\r\n             }\r\n         }\r\n\r\n         .pagesContr {\r\n             display: flex;\r\n             width: 100%;\r\n             justify-content: center;\r\n             margin: 60px 0 0;\r\n\r\n             .pagesList {\r\n                 display: flex;\r\n                 margin: 0px 30px;\r\n\r\n                 a {\r\n                     min-width: 32px;\r\n                     padding: 0 2px;\r\n                     width: auto;\r\n                     height: 34px;\r\n                     border-radius: 4px;\r\n                     background: #E3E3E3;\r\n                     flex-shrink: 0;\r\n                     margin: 0 6px;\r\n                     color: #333952;\r\n                     font-family: \"Noto Sans\";\r\n                     font-size: 16px;\r\n                     font-style: normal;\r\n                     font-weight: 400;\r\n                     line-height: 34px;\r\n                     text-align: center;\r\n                     \u002F* 175% *\u002F\r\n                 }\r\n\r\n\r\n\r\n             }\r\n\r\n             .prePage,\r\n             .nextPage {\r\n                 width: 34px;\r\n                 height: 34px;\r\n                 flex-shrink: 0;\r\n                 display: flex;\r\n                 justify-content: center;\r\n                 align-items: center;\r\n                 border-radius: 4px;\r\n                 background: #F3F3F3;\r\n             }\r\n         }\r\n     }\r\n }\r\n\r\n @media (max-width: 648px) {\r\n     .search {\r\n         .search-header {\r\n             height: 163px;\r\n\r\n             .box-shadow-20 {\r\n                 height: 50px;\r\n\r\n                 div {\r\n                     width: 63.982px;\r\n                     height: 38.971px;\r\n                     flex-shrink: 0;\r\n                     aspect-ratio: unset;\r\n                 }\r\n             }\r\n         }\r\n\r\n         .art-title {\r\n             font-size: 18px;\r\n         }\r\n\r\n         .title-1 {\r\n             font-size: 16px;\r\n         }\r\n\r\n         .desc-text {\r\n             font-size: 12px;\r\n         }\r\n\r\n         .mini-text {\r\n             font-size: 12px;\r\n         }\r\n     }\r\n\r\n     .search .body .pagesContr {\r\n         align-items: center;\r\n     }\r\n\r\n     .search .body .pagesContr .pagesList {\r\n         margin: 0 14px;\r\n         flex-wrap: wrap;\r\n     }\r\n\r\n     .search .body .pagesContr .pagesList a {\r\n         margin: 3px;\r\n         height: 27px;\r\n         width: auto;\r\n         min-width: 25px;\r\n         line-height: 27px;\r\n         font-size: 14px;\r\n     }\r\n\r\n     .search .body .pagesContr .nextPage,\r\n     .search .body .pagesContr .prePage {\r\n         height: 27px;\r\n         width: 27px;\r\n     }\r\n\r\n     .search .body .pagesContr .nextPage,\r\n     .search .body .pagesContr .nextPage {\r\n         height: 27px;\r\n         width: 27px;\r\n     }\r\n }","D:\\Web\\pugFrame\\template\\static\\js\\1.js":"(() =\u003E {\r\n  console.log(1111);\r\n})();\r\n"};
;
    var locals_for_with = (locals || {});
    
    (function (common, data) {
      ;pug_debug_line = 1;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003C!DOCTYPE html\u003E";
;pug_debug_line = 2;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Chtml v=\"1.0.6\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";

























;pug_debug_line = 14;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";























;pug_debug_line = 23;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Chead\u003E";
;pug_debug_line = 24;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
;pug_debug_line = 3;
pug_html = pug_html + "(() =\u003E {\n  console.log(1111);\n})();\n\u003C\u002Fhead\u003E";
;pug_debug_line = 25;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Cbody\u003E";
;pug_debug_line = 26;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Cdiv class=\"content-body\"\u003E";
;pug_debug_line = 27;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
;pug_debug_line = 6;
pug_html = pug_html + "\u003Cdiv class=\"index\"\u003E";
;pug_debug_line = 7;
pug_html = pug_html + "\u003Ca\u003E";
;pug_debug_line = 7;
pug_html = pug_html + (pug_escape(null == (pug_interp = common.b) ? "" : pug_interp)) + "\u003C\u002Fa\u003E";
;pug_debug_line = 8;
pug_html = pug_html + "\u003Cb\u003E";
;pug_debug_line = 8;
pug_html = pug_html + "1111111111111111\u003C\u002Fb\u003E";
;pug_debug_line = 9;
pug_html = pug_html + "\u003Ch1\u003E";
;pug_debug_line = 9;
pug_html = pug_html + (pug_escape(null == (pug_interp = data.a) ? "" : pug_interp));
;pug_debug_line = 9;
pug_html = pug_html + ".about    \u003C\u002Fh1\u003E";
;pug_debug_line = 10;
pug_html = pug_html + "\u003Cdiv class=\"about-header\"\u003E";
;pug_debug_line = 11;
pug_html = pug_html + "\u003Ch1\u003E";
;pug_debug_line = 11;
pug_html = pug_html + "About Smart Reviews\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 12;
pug_html = pug_html + "\u003Cdiv class=\"about-body main-text\"\u003E";
;pug_debug_line = 13;
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 13;
pug_html = pug_html + "Smart Reviews is a premier destination for in-depth, unbiased reviews and insights on a wide range of consumer products. Our mission is to empower our readers to make confident and informed purchasing decisions across diverse categories.\u003C\u002Fdiv\u003E";
;pug_debug_line = 14;
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 14;
pug_html = pug_html + "Our team of experienced reviewers meticulously evaluates the latest innovations in a variety of product segments, including but not limited to Automotive, Home Appliances, Consumer Electronics, Household Goods, Personal Care, Fashion, and Sports & Outdoors. We utilize advanced assessment methodologies, including multidimensional analysis and real-world user experience narratives, to deliver insights that go beyond the surface-level.  \u003C\u002Fdiv\u003E";
;pug_debug_line = 15;
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 15;
pug_html = pug_html + "What truly sets us apart is our commitment to innovation and a forward-thinking approach. We don't simply regurgitate product specifications; instead, we provide our readers with a comprehensive understanding of each product's performance, features, and value proposition. Our reviews not only highlight the strengths of each product but also critically examine their weaknesses, empowering our audience to make well-rounded decisions.\u003C\u002Fdiv\u003E";
;pug_debug_line = 16;
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 16;
pug_html = pug_html + "Beyond the traditional product review, Smart Reviews also delves into emerging trends and unique consumer experiences. We provide detailed user guides, comparative analyses, and expert recommendations to ensure our readers have all the necessary tools to navigate the ever-evolving consumer landscape.\u003C\u002Fdiv\u003E";
;pug_debug_line = 17;
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 17;
pug_html = pug_html + "Whether you're in the market for a game-changing kitchen appliance, the perfect smartphone to suit your lifestyle, or the most stylish and functional home decor, Smart Reviews is your trusted companion. Visit us today and let our cutting-edge insights guide your next purchase.\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 28;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + "\u003Ch1\u003E";
;pug_debug_line = 28;pug_debug_filename = "D:\\Web\\pugFrame\\template\\common\\base.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = data.b) ? "" : pug_interp)) + "\u003C\u002Fh1\u003E\u003C\u002Fdiv\u003E\u003C\u002Fbody\u003E\u003C\u002Fhtml\u003E";
    }.call(this, "common" in locals_for_with ?
        locals_for_with.common :
        typeof common !== 'undefined' ? common : undefined, "data" in locals_for_with ?
        locals_for_with.data :
        typeof data !== 'undefined' ? data : undefined));
    ;} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;}