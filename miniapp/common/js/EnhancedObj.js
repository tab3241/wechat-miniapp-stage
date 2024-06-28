// 加载配置文件
let conf = require('../../app.config')

// 保存原本的 Page 对象
const orgainPage = Page
// 保存原来的 Component
const originComponent = Component

// develop 开发版 | trial 体验版 | release 正式版
const accountInfo = wx.getAccountInfoSync()

// 设置 CDN 地址
const cdn = conf.app[accountInfo.miniProgram.envVersion.toLowerCase()].cdn

/**
 * Page 对象基础类
 * @param {Object} app (当前 Page 对象)
 * @returns
 */
Page = function (_obj) {

  // 拷贝一个新的页面对象
  let orgainData = Object.assign({}, _obj);

  /** [扩展] Data 对象 */
  let _dataList = {
    pageReady: false,
    cdn: cdn
  };
  _obj.data = Object.assign(_obj.data, _dataList, {});

  _obj.app = getApp()
  _obj.api = require('./api')
  _obj.math = require('./plugin/math')
  _obj.com = require('./plugin/com')
  _obj.tongji = _obj.app.tongji
  _obj.system = wx.getSystemInfoSync()
  _obj.config = conf

  _obj.onLoad = function (options) {

    // 是否全局禁用分享
    if (!conf.app.canShare)
      wx.hideShareMenu();

    // 获取并设置页面启动参数
    this.setData({ options: options })

    if (conf.monitor.pitaya.appKey == '')
      _obj.consoleTips('请在小程序根目录下 app.config.js 中填写项目 Pitaya Key！')

    // 公共逻辑写在此处
    if (orgainData.onLoad && typeof orgainData.onLoad === 'function') {
      orgainData.onLoad.call(this, options);
    }
  }

  _obj.onShow = function (options) {
    if (typeof orgainData.onShow === 'function') {
      orgainData.onShow.call(this, options);
    }
  }

  _obj.onReady = function (options) {
    // 公共逻辑写在此处
    this.setData({ pageReady: true })
    if (typeof orgainData.onReady === 'function') {
      orgainData.onReady.call(this, options);
    }
  }

  _obj.onHide = function (options) {
    // 公共逻辑写在此处
    if (typeof orgainData.onHide === 'function') {
      orgainData.onHide.call(this, options);
    }
  }

  _obj.onUnload = function () {
    // 公共逻辑写在此处

    if (orgainData.onUnload !== undefined && typeof orgainData.onUnload === 'function') {
      orgainData.onUnload.call(this);
    }
  }

  _obj.onPullDownRefresh = function () {
    // 公共逻辑写在此处

    if (orgainData.onPullDownRefresh !== undefined && typeof orgainData.onPullDownRefresh === 'function') {
      orgainData.onPullDownRefresh.call(this);
    }
  }

  _obj.onReachBottom = function () {
    // 公共逻辑写在此处

    if (orgainData.onReachBottom !== undefined && typeof orgainData.onReachBottom === 'function') {
      orgainData.onReachBottom.call(this);
    }
  }

  /** 检查页面是否存在 onShareAppMessage 函数，如果存在并且具有返回则使用页面本身 onShareAppMessage 函数 */
  let _share = _obj.onShareAppMessage && _obj.onShareAppMessage.toString().indexOf('return') > -1
  if (!_share) {
    _obj.onShareAppMessage = function (options) {
      // 公共逻辑写在此处
      orgainData.onShareAppMessage && orgainData.onShareAppMessage.call(this, options)
      return conf.app.shareSettings;
    }
  }

  _obj.onResize = function () {
    // 公共逻辑写在此处
    if (orgainData.onResize !== undefined && typeof orgainData.onResize === 'function') {
      orgainData.onResize.call(this);
    }
  }

  /**
   * 设置页面标题
   * @param {String} val 页面标题文案
   */
  _obj.setTitle = function (val) {
    wx.setNavigationBarTitle({ title: val })
  }

  /**
   * 页面重定向跳转，跳转会有刷新页面效果
   * @param {String} url 跳转页面地址
   * @param {Boolean} reLaunch 是否关闭所有页面，打开到应用内的某个页面
   */
  _obj.goto = function (url, reLaunch) {
    if (reLaunch)
      wx.reLaunch({ url: url })
    else
      wx.redirectTo({ url: url })
  }

  /**
   * 保留当前页面，跳转到应用内的某个页面。
   * @param {String} url 跳转页面地址
   */
  _obj.navto = function (url) {
    wx.navigateTo({ url: url })
  }

  /**
   * 关闭当前页面，返回上一页面或多级页面。
   * @param {Number} idx 返回的页面数，如果 delta 大于现有页面数，则返回到首页。
   */
  _obj.navback = function (idx) {
    wx.navigateBack({ delta: idx })
  }

  /**
   * 显示模态对话框
   * @param {String} txt 跳转页面地址
   * @param {Function} callback 确认后的回调函数
   * @param {Boolean} showCancel 是否显示关闭按钮
   */
  _obj.alert = function (txt, callback, showCancel = false) {
    txt = txt + ''
    let opts = {
      content: txt,
      success: callback || function () { },
      showCancel: showCancel || false
    };
    wx.showModal(opts);
  }

  //Loading 封装
  _obj.loading = {
    show: function (txt, needMask = true) {
      wx.showLoading({ title: txt, mask: needMask });
    },
    hide: function () {
      wx.hideLoading();
    }
  }

  // 判断是否是X XR等手机
  _obj.iPX = function () {
    let isX = false
    if (
      (_obj.system.screenHeight == 812 && _obj.system.screenWidth == 375) ||
      (_obj.system.screenHeight == 896 && _obj.system.screenWidth == 414)
    ) {
      isX = true
    }
    return isX
  }

  /** 带样式的 console */
  _obj.consoleTips = (txt, css = '') => {
    let v = `%c${txt}`
    if (css == '')
      css = 'font-size:60px; color:#d42848; ';
    console.log(v, css);
  }

  return orgainPage(_obj);
}



Component = function (data) {
  let app = getApp()
  let orgainData = Object.assign({}, data)

  data.data = Object.assign({ cdn: cdn }, data.data, {})

  data.attached = function () {
    if (orgainData.attached) {
      orgainData.attached.call(this);
    }
  }

  data.methods = Object.assign({}, data.methods, {})

  return originComponent(data);
}
