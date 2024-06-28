const wxrds = {
    redis: "wxredis",
    /**
     * 设置键值及超时时间
     * @param {string} k 键
     * @param {string} v 值
     * @param {int}    t 超时间，单位秒, -1 为不限时间
     */
    set: function (k, v, t) {
        wx.setStorageSync(k, v)
        var seconds = parseInt(t)
        if (seconds > 0) {
            var newtime = Date.parse(new Date())
            newtime = newtime / 1000 + seconds;
            wx.setStorageSync(k + this.redis, newtime + "")
        } else
            wx.removeStorageSync(k + this.redis);
    },

    /**
     * 根据键获取值
     * @param {string} k (键)
     * @returns          (返回值)
     */
    get: function (k) {
        var deadtime = parseInt(wx.getStorageSync(k + this.redis))
        if (deadtime) {
            if (parseInt(deadtime) < Date.parse(new Date()) / 1000) {
                wx.removeStorageSync(k);
                return null
            }
        }
        var res = wx.getStorageSync(k)
        if (res) return res;
        else return null;
    },

    /**
     * 移除键
     * @param {string} k (键)
     */
    remove: function (k) {
        wx.removeStorageSync(k);
        wx.removeStorageSync(k + this.redis);
    },

    clear: function () {
        wx.clearStorageSync();
    },
}
module.exports = wxrds;