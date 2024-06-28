let conf = require('../../../app.config').monitor
// 请在此行填写从PITAYA后台获取的appkey
exports.pitayaKey = conf.pitaya.appKey;
// 自动上传用户坐标位置 如果有
exports.getLocation = conf.pitaya.getLocation;
// 自动上传用户头像昵称 如果有
exports.getUserInfo = conf.pitaya.getUserInfo;