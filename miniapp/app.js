// Page 扩展对象（必须加载）

const conf = require('./app.config')
const bgm = wx.createInnerAudioContext()
// const mtj = require('/common/js/monitor/mtj-wx-sdk');
const tj = require('/common/js/monitor/controller')

if (conf.monitor.baidu.enable) {
  require('/common/js/monitor/mtj-wx-sdk');
}

require('/common/js/EnhancedObj');


App({

  bgmpaused: false,
  bgm: bgm,
  math: require('/common/js/plugin/math.js'),
  com: require('/common/js/plugin/com.js'),
  tongji: tj,

  data: {},

  // 初始化
  onLaunch: function () {
    // 检查是否启用百度小程序统计
    if (conf.monitor.baidu.enable)
      this.tongji.baidu = this.mtj

    // 厨师话背景音乐
    this.initBGM();

    // 下载字体
    this.fontDownload(conf.app.fonts);
  },

  onShow: function () {
    if (conf.audio.bgm.enable && this.bgmpaused) {
      this.bgmpaused = false
      this.bgm.play();
    }
  },

  onHide: function () {
    if (conf.audio.bgm.enable && !this.bgmpaused) {
      this.bgmpaused = true
      this.bgm.pause();
    }
  },

  initBGM: function () {
    if (conf.audio.bgm.enable) {
      this.bgm.loop = true
      this.bgm.autoplay = true
      this.obeyMuteSwitch = true
      this.bgm.src = conf.audio.bgm.src
      this.bgmpaused = false
    }
  },


  fontDownload: function (fonts) {
    fonts.forEach(function (item) {
      wx.loadFontFace({
        global: item.isGlobal,
        family: item.name,
        source: 'url("' + item.url + '")',
        scopes: item.scopes
      })
    });
  }
})