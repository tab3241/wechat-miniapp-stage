import rds from './plugin/wxredis.js'
import queue from './plugin/itask.js'

// 会话身份过期时间
const timeout = 6000;
const conf = require('../../app.config')
const tongji = require('./monitor/controller')

// develop 开发版 | trial 体验版 | release 正式版
const accountInfo = wx.getAccountInfoSync()

// API SDK
const API = () => {
  let _api = {}

  // 根据当前微信版本选择 API 地址
  const _domain = conf.app[accountInfo.miniProgram.envVersion.toLowerCase()].api

  let _sessionKey = rds.get('_sessionKey') != null ? rds.get('_sessionKey') : '',
    _isLogin = false;

  // 接口函数部分
  _api.Handler = {
    Header: '/Handler/',
    // 获取服务器时间
    GetTime: function (_data) {
      let _method = 'GetTime'
      _data = _data || {};
      return _api.ajax(this.Header + _method, _data, "POST");
    },
  }

  /** 请求微信 API Login 并获取 Code */
  _api.login = () => {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          let _handler = _domain + '/OAuthProgram/Login'
          _api.request(_handler, {
            code: res.code
          }).then((res) => {
            let data = res.data.data;
            _api.monitor(data.OpenID)
            // 初始化会话状态
            rds.set('_sessionKey', data.SessionKey, timeout);
            _sessionKey = data.SessionKey
            queue.concatWait();
            _isLogin = false;
            resolve(res)
          });
        },
        fail: (err) => {
          reject(err)
        },
        timeout: 10 * 1000
      });
    });
  }

  _api.monitor = (openid) => {
    wx.pitaya.sendOpenId(openid);
    if (conf.monitor.ald.useOpen)
      wx.aldstat.sendOpenid(openid)
    if (conf.monitor.smwt.getUserinfo)
      tongji._.smwt.setOpenId(openid)
  }

  /**
   * 基础请求接口
   * @param {string} url 请求完整地址
   * @param {json} data 请求参数
   * @param {string} method 请求方式 GET/POST
   */
  _api.ajax = (url, data, method) => {
    return new Promise((resolvex, reject) => {
      function fn() {
        return new Promise((resolve) => {
          _api.requestApi(url, data, method).then((res) => {
            if (res.data && res.data.code == 2000) {
              _sessionKey = '';
              if (!_isLogin) {
                _isLogin = true;
                queue.pushActive(_api.login);
              }
              queue.pushWait(fn);
              resolve(res)
            } else {
              resolve(res)
              resolvex(res)
            }
          });
        });
      }
      if (_sessionKey)
        queue.pushActive(fn);
      else {
        if (!_isLogin) {
          _isLogin = true;
          queue.pushActive(_api.login);
        }
        queue.pushWait(fn);
      }
    });
  }


  /**
   * 基础请求接口
   * @param {string} url 请求完整地址
   * @param {json} data 请求参数
   * @param {string} method 请求方式 GET/POST
   */
  _api.requestApi = function (url, data, method) {
    method = method || 'POST';
    url += '?SessionKey=' + rds.get('_sessionKey');
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: data,
        method: method,
        dataType: 'json',
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.log('Url:', url, ' err:', err)
          reject(err)
        }
      });
    });
  }

  _api.request = function (url, data, method) {
    method = method || 'POST';
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: data,
        method: method,
        dataType: 'json',
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          console.log('Url:', url, ' err:', err)
          reject(err)
        }
      });
    });
  }
  return _api;
}
module.exports = API();