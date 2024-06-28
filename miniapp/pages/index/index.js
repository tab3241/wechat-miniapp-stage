//获取应用实例

Page({

  data: {},

  async onLoad(option) {
    await this.api.Handler.GetTime()
  },

  // 用户身份授权回调事例
  onAuthConfirm(e) {
    var { encryptedData, iv, errMsg } = e.detail
    if (errMsg != "getUserInfo:ok")
      return
    else {
      // 接口写在这里
    }
  },

  // 手机号码授权回调事例
  onGetPhone(e) {
    var { encryptedData, iv, errMsg } = e.detail
    console.log(encryptedData, iv, errMsg)
    if (errMsg != "getUserInfo:ok")
      return
    else {
      // 接口写在这里
    }
  },

  trackEvent() {
    this.tongji.event({ key: 'test', category: '事件分类-1', action: '事件动作-1', label: '事件标签-1', value: '事件价值-1' })
  },

  onGoto(e) {
    let { key } = e.currentTarget.dataset
    this.navto(key)
  },


  onShareAppMessage() {
    return {}
   },
})