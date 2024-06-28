// components/btn/btn.js

let conf = require('../../app.config').app
Component({
    options: {
        addGlobalClass: true,
    },
    /**
     * 组件的属性列表
     */
    properties: {
        clasx: { type: String, value: '' },
        text: { type: String, value: '' },
        src: { type: String, value: '' },
        type: { type: String }
    },

    /**
     * 组件的初始数据
     */
    data: {
        cdn: conf.cdnPath
    },

    attached: function () {
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onBindEvent: function (e) {
            this.triggerEvent('callback', e.detail)
        }
    }
})