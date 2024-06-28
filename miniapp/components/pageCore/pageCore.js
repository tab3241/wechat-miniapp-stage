// common/components/pageCore.js

const app = getApp()
const conf = require('../../app.config');

Component({
    /**
     * 组件的初始数据
     */
    data: {
        bgmBtn: conf.audio.bgm.enable ? conf.audio.bgm.icon : false,
        bgmPlay: true,
        noneColor: 'rgba(0,0,0,0)',
        mainPageHeight: ''
    },

    options: {
        multipleSlots: true,
        addGlobalClass: true
    },

    properties: {
        isShare: { type: Boolean, value: conf.app.canShare },
        extClass: { type: String, value: '' },
        fullview: { type: Boolean, value: false },
        needfoot: { type: Boolean, value: false },
        background: { type: String, value: '#fff', observer: '_showChange' },
        backgroundColorTop: { type: String, value: '#fff', observer: '_showChangeBackgroundColorTop' },
        color: { type: String, value: 'rgba(0, 0, 0, 1)' },
        title: { type: String, value: '' },
        searchText: { type: String, value: '点我搜索' },
        searchBar: { type: Boolean, value: false },
        back: { type: Boolean, value: false },
        backEvent: { type: Boolean, value: false },
        home: { type: Boolean, value: false },
        iconTheme: { type: String, value: 'black' },
        delta: { type: Number, value: 1 },
        parent: { type: String, value: '/pages/index/index' }
    },

    created: function () {
        this.getSystemInfo();
    },

    attached: function () {
        this.setStyle();
    },

    pageLifetimes: {
        show: function () {
            if (getApp().globalSystemInfo.ios) {
                this.getSystemInfo();
                this.setStyle(); //设置样式1
            }
        },
        hide: function () { }
    },

    methods: {
        pageReady: function () {
            if (this.data.isShare) wx.showShareMenu();
            else wx.hideShareMenu();
        },

        _bgmClick: function () {
            if (app.bgmpaused) {
                app.bgm.play()
                app.bgmpaused = false
                this.setData({ bgmPlay: true })
            }
            else {
                app.bgm.pause()
                app.bgmpaused = true
                this.setData({ bgmPlay: false })
            }
        },

        // ---------- 自定义导航事件 ---------- //
        setStyle: function (life) {
            const {
                statusBarHeight,
                navBarHeight,
                capsulePosition,
                navBarExtendHeight,
                ios,
                windowWidth
            } = getApp().globalSystemInfo;
            const { back, home, title } = this.data;
            let rightDistance = windowWidth - capsulePosition.right;
            let leftWidth = windowWidth - capsulePosition.left;
            let navigationbarinnerStyle = [
                `color: ${this.data.color}`,
                `background: ${this.data.fullview ? this.data.noneColor : this.data.background}`,
                `height:${navBarHeight + navBarExtendHeight}px`,
                `padding-top:${statusBarHeight}px`,
                `padding-right:${leftWidth}px`,
                `padding-bottom:${navBarExtendHeight}px`
            ].join(';');

            if (this.data.fullview)
                this.setData({ mainPageHeight: '100%' })
            else
                this.setData({ mainPageHeight: 'calc(100% - ' + (navBarHeight + navBarExtendHeight) + 'px)' })

            let navBarLeft = [];
            if ((back && !home) || (!back && home)) {
                navBarLeft = [`width:${capsulePosition.width}px`, `height:${capsulePosition.height}px`].join(';');
            } else if ((back && home) || title) {
                navBarLeft = [
                    `width:${capsulePosition.width}px`,
                    `height:${capsulePosition.height}px`,
                    `margin-left:${rightDistance}px`
                ].join(';');
            } else {
                navBarLeft = [`width:auto`, `margin-left:0px`].join(';');
            }
            if (life === 'created') {
                this.data = {
                    navigationbarinnerStyle,
                    navBarLeft,
                    navBarHeight,
                    capsulePosition,
                    navBarExtendHeight,
                    ios
                };
            } else {
                this.setData({
                    navigationbarinnerStyle,
                    navBarLeft,
                    navBarHeight,
                    capsulePosition,
                    navBarExtendHeight,
                    ios
                });
            }
        },
        _showChange: function (value) {
            this.setStyle();
        },
        // 返回事件
        back: function () {
            if (this.data.backEvent)
                this.triggerEvent('back', { delta: this.data.delta })
            else {
                if (getCurrentPages().length > 1)
                    wx.navigateBack()
                else
                    wx.redirectTo({ url: this.data.parent })
            }
        },
        home: function () {
            wx.redirectTo({ url: '/pages/index/index' })
        },
        search: function () {
            this.triggerEvent('search', {});
        },
        getSystemInfo() {
            var app = getApp();
            if (app.globalSystemInfo && !app.globalSystemInfo.ios)
                return app.globalSystemInfo;
            else {
                let systemInfo = wx.getSystemInfoSync();
                let ios = !!(systemInfo.system.toLowerCase().search('ios') + 1);
                let rect;
                try {
                    rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
                    if (rect === null)
                        throw 'getMenuButtonBoundingClientRect error';
                    if (!rect.width || !rect.top || !rect.left || !rect.height)
                        throw 'getMenuButtonBoundingClientRect error';
                } catch (error) {
                    let gap = '';
                    let width = 96;
                    if (systemInfo.platform === 'android') {
                        gap = 8;
                        width = 96;
                    } else if (systemInfo.platform === 'devtools') {
                        if (ios)
                            gap = 5.5;
                        else
                            gap = 7.5;
                    } else {
                        gap = 4;
                        width = 88;
                    }
                    if (!systemInfo.statusBarHeight)
                        systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
                    rect = {
                        bottom: systemInfo.statusBarHeight + gap + 32,
                        height: 32,
                        left: systemInfo.windowWidth - width - 10,
                        right: systemInfo.windowWidth - 10,
                        top: systemInfo.statusBarHeight + gap,
                        width: width
                    };
                }

                let navBarHeight = '';
                if (!systemInfo.statusBarHeight) {
                    systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
                    navBarHeight = (function () {
                        let gap = rect.top - systemInfo.statusBarHeight;
                        return 2 * gap + rect.height;
                    })();
                    systemInfo.statusBarHeight = 0;
                    systemInfo.navBarExtendHeight = 0;
                } else {
                    navBarHeight = (function () {
                        let gap = rect.top - systemInfo.statusBarHeight;
                        return systemInfo.statusBarHeight + 2 * gap + rect.height;
                    })();
                    if (ios)
                        systemInfo.navBarExtendHeight = 4;
                    else
                        systemInfo.navBarExtendHeight = 0;
                }
                systemInfo.navBarHeight = navBarHeight;
                systemInfo.capsulePosition = rect;
                systemInfo.ios = ios;
                app.globalSystemInfo = systemInfo;
                return systemInfo;
            }
        },
    }
})
