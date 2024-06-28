/** 统计代码管理器 */
let _ald, _pitaya, _ga, _smwt, _mtj, HitBuilders

// 加载配置文件
let conf = require('../../../app.config').monitor

// 默认必须开启
_pitaya = require('../../../common/js/monitor/pitaya-sdk'); 
if (conf.ald.enable)
  _ald = require('../../../common/js/monitor/ald-stat');
if (conf.ga.enable) {
  _ga = require('../../../common/js/monitor/ga');
  HitBuilders = _ga.HitBuilders
}
if (conf.smwt.enable)
  _smwt = require('../../../common/js/monitor/sm_wx');


const monitor = () => {
  let ga,
    m = {}

  m._ = { ald: _ald, pitaya: _pitaya, ga: _ga, smwt: _smwt, mtj: _mtj }

  if (conf.ga.enable) {
    var GoogleAnalytics = _ga.GoogleAnalytics;
    ga = GoogleAnalytics.getInstance(this)
      .setAppName(conf.ga.name)
      .setAppVersion(conf.ga.version)
      .newTracker(conf.ga.gaid)
    ga.setTrackerServer(conf.ga.proxyPath)
  }

  /** 
   * PV统计
   * _title: 页面标题
   */
  m.setPv = (_title) => {
    if (conf.ga.enable) {
      ga.setScreenName(_title)
      ga.send(new HitBuilders.ScreenViewBuilder().build())
    }
    if (conf.ald.enable)
      wx.aldstat.sendEvent('默认-页面预览-' + _title);
    if (conf.smwt.enable)
      _smwt.track('event', 'pv', _title);

  }

  /*
   * 事件统计
   * obj: {
   *    key:      百度及微信小程序统计的 Key, 
   *    category: 事件类型, 
   *    action:   事件动作, 
   *    label:    事件名, 
   *    value:    事件值 (json) 
   * }
   */
  m.event = (obj) => {
    // GA
    if (conf.ga.enable) {
      // var t = this.initTracker();
      if (obj.value != undefined)
        ga.send(new HitBuilders.EventBuilder().setCategory(obj.category).setAction(obj.action).setLabel(obj.label).setValue(obj.value).build());
      else
        ga.send(new HitBuilders.EventBuilder().setCategory(obj.category).setAction(obj.action).setLabel(obj.label).build());
    }
    // PITAYA
    wx.pitaya.sendEvent(obj.label)
    // 阿拉丁
    if (conf.ald.enable)
      wx.aldstat.sendEvent(obj.label);
    // 秒针
    if (conf.smwt.enable)
      _smwt.track('event', obj.category, obj.action, obj.label, obj.value);
    // 微信统计
    if (conf.wx.enable)
      wx.reportAnalytics(obj.key, obj.value)
    // 百度统计
    if (conf.baidu.enable)
      m.baidu.trackEvent(obj.key, { label: obj.label });
  }
  return m;
}
module.exports = monitor();