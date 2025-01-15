//{url, language, device, getR2Data} = this
export default router = [
  {
    matchFn: function () {
      // 匹配以 "/detail/" 开头的路由
      if (this.url.pathname.startsWith("/detail/")) {
        return true; // 如果是，返回 true
      }
    },
    getPagesFnName: function () {
      // 返回页面生成函数名称 "detail_index"
      return "detail_index";
    },
    getData: function () {
      // 获取当前页面的 R2 数据
      return this.getR2Data(`/detail/${this.url.page_name}.json`);
    }
  }
];
