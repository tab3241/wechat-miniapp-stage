import imath from './math.js'
import icom from './com.js'

const audio = {
    config: { path: '' },

    init: function () {
        if (audio.config.path == '')
            audio.setPageData({ bgmBtn: false, bgmPlay: false });
        else {
            this.bgmPausedByUser = false;
            this.bgm = wx.createInnerAudioContext();
            this.bgm.loop = true;
            this.bgm.autoplay = true;
            this.obeyMuteSwitch = true;
            this.bgm.src = audio.config.path;
            this.bgm.onCanplay(this.bgmShow);
            this.bgm.onPlay(this.bgmPlay);
            this.bgm.onPause(this.bgmPause);
            this.bgm.onStop(this.bgmPause);
        }
    },

    //背景音乐按钮控制
    bgmClick: function () {
        if (this.bgm.paused) {
            this.bgm.play();
            this.bgmPausedByUser = false;
        }
        else {
            this.bgm.pause();
            this.bgmPausedByUser = true;
        }
        return this.bgmPausedByUser
    },

    bgmPlay: function () {
        icom.setPageData({ bgmPlay: true });
    },

    bgmPause: function () {
        icom.setPageData({ bgmPlay: false });
    },

    bgmShow: function (play = true) {
        setTimeout(function () {
            icom.setPageData({ bgmBtn: true, bgmPlay: play });
        }, 100);

    },

    bgmHide: function (play = false) {
        setTimeout(function () {
            icom.setPageData({ bgmBtn: false, bgmPlay: play });
        }, 100);
    },

}
module.exports = audio;