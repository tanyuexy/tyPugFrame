var viewHeight = document.documentElement.clientHeight;

function lazyLoadImgs() {
  document.querySelectorAll("img[data-load]").forEach(function (ele) {
    let parentElementComputed = ele.parentElement.getBoundingClientRect();
    // 如果该元素display:none || 已经被加载过则跳出不加载
    if (
      (parentElementComputed.top == 0 &&
        parentElementComputed.bottom == 0 &&
        parentElementComputed.left == 0 &&
        parentElementComputed.right == 0 &&
        parentElementComputed.width == 0 &&
        parentElementComputed.height == 0 &&
        parentElementComputed.x == 0 &&
        parentElementComputed.y == 0) ||
      ele.dataset.loaded
    ) {
      return;
    }

    ele.onload = function () {
      this.style.display = "block";
      let that = this.parentElement.getElementsByClassName("loading-img");
      if (that[0]) {
        that[0].style.display = "none";
      }
    };
    // 通过img的父级来判断该img是否处于可视区，因为当前img很可能处于display:none;不好判断
    if (
      parentElementComputed.bottom >= 0 &&
      parentElementComputed.top < viewHeight
    ) {
      ele.setAttribute("src", ele.dataset.load);
      ele.setAttribute("data-loaded", true);
    }
  });
}

function debounce(fn, delay) {
  var timer = null;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, delay);
  };
}

lazyLoadImgs();
window.addEventListener(
  "scroll",
  debounce(() => {
    lazyLoadImgs();
  }, 100)
);

window.addEventListener(
  "touchmove",
  debounce(() => {
    window.dispatchEvent(new Event("scroll"));
  }, 100)
);

window.addEventListener(
  "resize",
  debounce(() => {
    viewHeight = document.documentElement.clientHeight;
    lazyLoadImgs();
  }, 200)
);
