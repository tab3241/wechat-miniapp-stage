
let conf = require('../../../app.config').monitor
/**
 * @file 百度移动统计配置文件
 */
module.exports = {
    /**
     * 从百度移动统计获取的AppKey
     * @type {string}
     */
    appKey: conf.baidu.appKey,

    /**
     * 是否使用了插件
     * @type {boolean}
     */
    hasPlugin: conf.baidu.hasPlugin,

    /**
     * 是否获取当前的地理位置和速度信息
     * @type {boolean}
     */
    getLocation: conf.baidu.getLocation,
};