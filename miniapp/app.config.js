
let _app = {
  v: '0.0.1',
  appid: "",
  canShare: true,
  shareSettings: {
    title: '分享标题',
    path: '/pages/index/index',
    imageUrl: "/common/images/share.jpg"
  },
  release: {
    api: 'https://test.h5-x.com/wxapi-test/Release.ashx',
    cdn: 'https://cdn.h5-x.com/test/release'
  },
  trial: {
    api: 'https://test.h5-x.com/wxapi-test/trial.ashx',
    cdn: 'https://cdn.h5-x.com/test/develop'
  },
  develop: {
    api: 'https://test.h5-x.com/wxapi-test/develop.ashx',
    cdn: 'https://cdn.h5-x.com/test/develop'
  },
  fonts: [
    {
      name: 'ft1',
      url: 'https://cdn.h5-x.com/0Miniapp_Templete/fonts/happyzcool.ttf',
      global: true,
      scopes: ['webview', 'native']
    }
  ]
}

/** 统计代码配置 */
let _monitor = {
  wx: {
    enable: true
  },
  pitaya: {
    appKey: "",
    getLocation: true,
    getUserInfo: true
  },
  ald: {
    enable: false,
    appKey: "asd",
    getLocation: false,
    plugin: false,
    useOpen: false
  },
  smwt: {
    enable: false,
    appKey: "",
    trackid: "dc-4145",
    getLocation: false,
    getUserinfo: false
  },
  baidu: {
    enable: false,
    appKey: '',
    hasPlugin: false,
    getLocation: false
  },
  ga: {
    enable: false,
    name: "dh-wxapp-fntmplete",
    gaid: "UA-154969209-2",
    proxyPath: "https://ga-proxy.h5-x.com",
    version: '0.0.1a'
  },
}

/** 音频文件配置 */
let _audio = {
  bgm:
  {
    enable: false,
    src: "https://cdn.h5-x.com/alp/bgm.mp3",
    icon: false
  },
  files: [
    { "enable": false, "src": "" }
  ]
}

module.exports = {
  monitor: _monitor,
  audio: _audio,
  app: _app
}