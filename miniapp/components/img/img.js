// components/img/img.js

let conf = require('../../app.config').app
import _os from '../../common/js/plugin/os.js'
import _com from '../../common/js/plugin/com.js'

Component({
    options: {
        addGlobalClass: true,
    },

    properties: {
        src: { type: String },
        autoPath: { type: Boolean, value: true },
        modex: { type: String },
        clasx: { type: String },
        stylx: { type: String },
        isApi: { type: Boolean, value: false }
    },

    data: {
        complete: false,
        loaded: false,
        cdn: conf.cdnPath,
        apicdn: conf.apiCdn,
        v: conf.v
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 图片点击事件
         * @param {any} e
         */
        onTap: function (e) {
            this.triggerEvent('click', e.detail)
        },

        /**
         * 图片加载完成事件
         * @param {any} e
         */
        onLoaded(e) {
            this.triggerEvent('loaded', e.detail)
        },
    },

    attached: function (e) { },
})
