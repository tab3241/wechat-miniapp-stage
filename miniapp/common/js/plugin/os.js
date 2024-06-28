const OS = function () {
    let info = wx.getSystemInfoSync();
    let os = {};
    os.info = info;
    os.android = info.system.indexOf('Android') != -1;
    os.ios = info.system.indexOf('iOS') != -1;
    os.iphone = info.model.indexOf('iPhone') != -1;
    os.iphoneType = info.model.replace(/^iPhone \w+<$/);
    os.iphoneX = info.model.match(/iPhone X/) ? true : false;
    os.screenHeight = info.screenHeight;
    os.screenWidth = info.screenWidth;
    os.windowHeight = info.windowHeight;
    os.windowWidth = info.windowWidth;
    os.windowScale = info.windowWidth / 750;
    os.statusbarHeight = info.statusbarHeight;
    os.screen159 = info.screenHeight / info.screenWidth <= 600 / 360;
    os.screen169 = info.screenHeight / info.screenWidth == 640 / 360;
    os.screen189 = info.screenHeight / info.screenWidth >= 672 / 360 && info.screenHeight / info.screenWidth < 716 / 360;
    os.screen199 = info.screenHeight / info.screenWidth >= 716 / 360;
    os.xiaomi = info.brand.match(/Xiaomi/) || info.brand.match(/xiaomi/) || info.brand.match(/Redmi/) || info.brand.match(/redmi/) ? true : false;
    os.huawei = info.brand.match(/HUAWEI/) || info.brand.match(/HONOR/) ? true : false;
    os.oppo = info.brand.match(/OPPO/) || info.brand.match(/oppo/) ? true : false;
    os.vivo = info.brand.match(/VIVO/) || info.brand.match(/vivo/) ? true : false;
    os.menuButton = wx.getMenuButtonBoundingClientRect();
    return os;
}
module.exports = OS();