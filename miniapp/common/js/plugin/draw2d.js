const wxcanvasplus = {
  canvas: {},
  ctx: {},
  basedata: {},

  draw(id, settings, obj) {
    return new Promise((resolve, reject) => {
      if (settings.data.length < 1)
        resolve({ code: 400, message: 'settings error' })
      else {
        this.basedata = settings.basedata
        obj.createSelectorQuery()
          .select(id)
          .fields({ node: true, size: true })
          .exec(res => {
            this.before(res, settings, () => {
              console.log('draw succes')
              resolve({ code: 200, message: 'build success' })
            })
          })
      }
    })

  },

  /**
   * 在合成之前的逻辑函数
   * @param {JSON} res canvas 对象信息
   * @param {JSON} settings 绘制配置表
   * @param {Function} after 绘制成功后调用的函数
   */
  async before(res, settings, after = function () { }) {
    this.canvas = res[0].node
    this.ctx = this.canvas.getContext('2d')

    // 设置画布 DPR 用于校准 retina 屏下像素失帧
    this.setDPR(settings.basedata)

    // 逐配置绘制
    for (var i = 0; i < settings.data.length; i++) {
      let s = settings.data[i]
      // 计算定位
      if (s['alignX'])
        s.x = this.alignX[s.alignX.type].call(this, s.width, s.alignX.margin)
      if (s['alignY'])
        s.y = this.alignY[s.alignY.type].call(this, s.height, s.alignY.margin)
      // 执行具体绘制函数
      await this['draw' + this.firstUpperCase(settings.data[i].type)].call(this, s)
    }
    after()
  },

  /**
   * 绘制常规图片
   * @param {JSON} s
   */
  drawImage(s) {
    return new Promise((resolve, reject) => {
      let obj = this.canvas.createImage()
      obj.onload = () => {
        console.log('draw Image ======> ', s)
        this.ctx.drawImage(obj, s.x, s.y, s.width, s.height)
        resolve()
      }
      obj.src = s.src
    })
  },

  /**
   * 绘制矩形
   * @param {JSON} s x: 圆心的 x 坐标, y: 圆心的 y 坐标, r: 圆的半径, bgcolor: 背景填充色, bordercolor: 边框颜色
   */
  drawRect(s) {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(s.x, s.y, s.width, s.height);
    this.ctx.fillStyle = s.bgcolor
    this.ctx.strokeStyle = 'rgba(1,1,1,0)'
    this.ctx.fill()
    this.ctx.restore()
    console.log('draw Rect ======> ', s)
  },

  /**
   * 绘制圆形
   * @param {JSON} s x: 圆心的 x 坐标, y: 圆心的 y 坐标, r: 圆的半径, bgcolor: 背景填充色, bordercolor: 边框颜色
   */
  drawCircular(s) {
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
    this.ctx.fillStyle = s.bgcolor
    this.ctx.strokeStyle = 'rgba(1,1,1,0)'
    this.ctx.fill()
    this.ctx.restore()
    console.log('draw Rect ======> ', s)
  },

  /**
   * 绘制圆形图片
   * @param {any} s
   */
  drawCircularimg(s) {
    return new Promise((resolve, reject) => {
      let obj = this.canvas.createImage()
      obj.onload = () => {
        this.ctx.save()
        let radius = s.width / 2;
        this.ctx.beginPath()
        this.ctx.strokeStyle = 'transparent'    // 抗锯齿
        this.ctx.arc(s.x + radius, s.y + radius, radius, 0, 2 * Math.PI)
        this.ctx.clip()
        this.ctx.drawImage(obj, s.x, s.y, s.width, s.height)
        // 设置边框
        if (s['stroke']) {
          this.ctx.strokeStyle = s.stroke.color
          this.ctx.lineWidth = s.stroke.width
          this.ctx.stroke()
        }
        this.ctx.restore()
        resolve()
      }
      obj.src = s.src
      console.log('draw Rectimg ======> ', s)
    })
  },

  /**
   * 绘制文本
   * @param {any} s
   */
  drawText(s) {
    let this_ = this
    return new Promise((resolve, reject) => {
      if (s.val == '')
        return
      this.ctx.restore()

      // 基础文本样式
      let fontarr = []
      if (s.font['weight']) fontarr.push(s.font['weight'])
      fontarr.push(s.font['size'] ? s.font['size'] + 'px' : '20px')
      fontarr.push(s.font['family'] || 'sans-serif')
      this.ctx.font = fontarr.join(' ');

      // 初始化描边
      s.stroke = s.stroke || { line: 0, color: '' }

      let metadata = this.ctx.measureText(s.val),
        maxwidth = s.maxwidth || this.basedata.width

      // 检查文字位置
      if (s.algin == 'center') {
        let u = this.basedata.width / 2 - (s.maxwidth ? s.maxwidth / 2 : metadata.width / 2)
        s.x = u > 0 ? u : 0
      }
      else if (s.align == 'right')
        s.x = this.basedata.width - (s.maxwidth ? s.maxwidth : metadata.width)

      if (s.revise)
        s.x -= metadata.width / 2

      // 检查文本是否溢出
      if (s.overflow && metadata.width > maxwidth) {
        let pot = '...',
          potdata = this.ctx.measureText(pot),
          x_ = s.x
        for (var i = 0; i < s.val.length; i++) {
          let char = s.val[i].charCodeAt(0), size = s.font.size
          if (char < 256) size /= 2
          x_ += i > 0 ? size : 0
          if (x_ < (maxwidth - potdata.width))
            _draw(s.val[i], s.color, s.stroke.line, s.stroke.color, x_, s.y)
          else {
            _draw(pot, s.color, s.stroke.line, s.stroke.color, x_, s.y)
            break
          }
        }
      }
      // 如果文本总长度超出最大限制或画布宽度则进入逐字绘制
      else if (metadata.width > maxwidth) {
        let gain = 10, x_ = s.x, _y = s.y, _i = 0, _val = s.val, _total = s.val.length, charPrev = false
        let buffX = 3, buffY = 1
        while (_total > 0) {
          _total--
          let char = _val[_i].charCodeAt(0), size = s.font.size
          x_ += _i > 0 ? (charPrev ? size / 2 + buffX : char < 256 ? size + buffX : size) : 0
          if (x_ < maxwidth)
            _draw(_val[_i], s.color, s.stroke.line, s.stroke.color, x_, char < 256 ? _y + buffY : _y)
          else {
            _y += s.font.size + gain
            _val = _val.substr(_i)
            metadata = this.ctx.measureText(_val)
            _i = 0
            x_ = s.x
            _draw(_val[_i], s.color, s.stroke.line, s.stroke.color, x_, char < 256 ? _y + buffY : _y)
          }
          charPrev = char < 256
          _i++
        }
      } else
        _draw(s.val, s.color, s.stroke.line, s.stroke.color, s.x, s.y)
      resolve()
      console.log('draw Text ======> ', s)
    })

    /**
     * 
     * @param {string} txt  文本
     * @param {string} fc   颜色
     * @param {number} sl   描边宽度
     * @param {string} sc   描边颜色
     * @param {number} x    x 轴定位
     * @param {number} y    y 轴定位
     */
    function _draw(txt, fc, sl, sc, x, y) {
      // 检查是否绘制描边
      if (s.stroke.line > 0 && s.stroke.color != '')
        _stroke(txt, sl, sc, x, y)
      _fill(txt, fc, x, y)
    }

    /**
     * 描边文字绘制
     * @param {string} txt 文本
     * @param {number} sl  描边宽度
     * @param {string} sc  描边颜色
     * @param {number} x   x 轴定位
     * @param {number} y   y 轴定位
     */
    function _stroke(txt, sl, sc, x, y) {
      this_.ctx.lineWidth = s.stroke.line || sl
      this_.ctx.strokeStyle = sc || '#fff'
      this_.ctx.strokeText(txt, x, y);
    }

    /**
     * 非描边文字绘制
     * @param {string} txt  文本
     * @param {string} fc   颜色
     * @param {number} x    x 轴定位
     * @param {number} y    y 轴定位
     */
    function _fill(txt, fc, x, y) {
      this_.ctx.fillStyle = fc || '#000'
      this_.ctx.fillText(txt, x, y);
    }
  },

  alignX: {
    /**
     * 居左
     * @param {Number} width 元素宽度
     * @param {Number} margin 向左外边距
     */
    left(width, margin = 0) {
      return 0 + margin
    },
    /**
     * 居中
     * @param {Number} width 元素宽度
     * @param {Number} margin 向左向右外边距有正负数区别
     */
    center(width, margin = 0) {
      return (this.basedata.width / 2) - (width / 2) + margin
    },
    /**
     * 居右
     * @param {any} width 元素宽度
     * @param {Number} margin 向右外边距
     */
    right(width, margin = 0) {
      return this.basedata.width - width - margin
    }
  },

  alignY: {
    /**
     * 居顶
     * @param {Number} height 元素高度
     * @param {Number} margin 向上外边距
     */
    top(height, margin = 0) {
      return 0 + margin
    },
    /**
     * 居中
     * @param {Number} height 元素高度
     * @param {Number} margin 向上向下外边距有正负数区别
     */
    center(height, margin = 0) {
      return (this.basedata.height / 2) - (height / 2) + margin
    },
    /**
     * 居底
     * @param {any} height 元素高度
     * @param {Number} margin 向下外边距
     */
    bottom(height, margin = 0) {
      return this.basedata.height - height - margin
    }
  },

  setDPR(setting) {
    const dpr = 2
    this.canvas.width = this.basedata.width * dpr
    this.canvas.height = this.basedata.height * dpr
    this.ctx.scale(dpr, dpr)
  },

  firstUpperCase(str) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
  }
}
module.exports = wxcanvasplus