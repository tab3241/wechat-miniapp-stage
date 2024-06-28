function compare(pro) {
    return function (obj1, obj2) {
        var val1 = obj1[pro];
        var val2 = obj2[pro];
        if (val1 < val2) { //正序
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
}


const idraw = function () {
    let draw = {};
    let canvasId;
    let ctx;

    draw.draw = function (data, callback) {
        return new Promise((resolve, reject) => {
            // let octx = wx.createOffscreenCanvas()
            // ctx = octx.getContext()
            canvasId = data.canvasId
            ctx = wx.createCanvasContext(canvasId, data.that)
            let width = data.width
            let height = data.height
            let list = [];
            if (data.hasOwnProperty('data') && (typeof data.data == 'object') && data.data.length > 0) { // 如果存在draw数据
                list = data.data
                list.map(v => {
                    v.zIndex = v.zIndex ? v.zIndex : 0
                })
                // 通过zIndex 排序
                list.sort(compare("zIndex"));
                for (let i = 0; i < list.length; i++) {
                    let data = list[i]
                    let type = data.type || 'image';
                    switch (type) {
                        case 'image':
                            draw_image(data);
                            break;
                        case 'text':
                            draw_text(data);
                            break;
                        case 'rect':
                            draw_rect(data);
                            break;
                        case 'arc':
                            draw_arc(data);
                            break;
                        case 'path':
                            draw_path(data);
                            break;
                        case 'line':
                            draw_line(data);
                            break;
                    } //edn switch

                } //end for
                // 生成图片
                ctx.draw(true, function () {
                    wx.canvasToTempFilePath({
                        canvasId: canvasId,
                        x: 0,
                        y: 0,
                        width: width,
                        height: height,
                        destWidth: width,
                        destHeight: height,
                        success: function (res) {
                            resolve(res.tempFilePath)
                            if (callback) {
                                callback(res.tempFilePath)
                            }
                        },
                        fail: function () {
                            // 导出图片错误
                            wx.showModal({
                                title: '导出图片时出错',
                                content: '请重新尝试！',
                            })
                        },
                        complete: function () { }
                    }, data.that)
                }) //edn draw
            } //edn if
            else {
                console.error('没有绘制数据存在')
                reject('没有绘制数据存在')
            } //end else    
        })

    }

    function draw_image(data) { //绘制图片
        let c = 'transparent';
        if (data.hasOwnProperty('source') && typeof data.source == 'string' && data.hasOwnProperty('x') && typeof data.x == 'number' && data.hasOwnProperty('y') && typeof data.y == 'number' && data.hasOwnProperty('width') && typeof data.width == 'number' && data.hasOwnProperty('height') && typeof data.height == 'number') {
            ctx.save()
            if (data.shadow) {
                draw_shadow(data.shadow);
            } //edn if
            if (data.status == 1) { //绘制圆形
                var avatarurl_width = data.width; //绘制的头像宽度
                var avatarurl_heigth = data.height; //绘制的头像高度
                var avatarurl_x = data.x; //绘制的头像在画布上的位置
                var avatarurl_y = data.y; //绘制的头像在画布上的位置
                //先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
                ctx.arc(avatarurl_width / 2 + avatarurl_x, avatarurl_heigth / 2 + avatarurl_y, avatarurl_width / 2, 0, Math.PI * 2, false);
                ctx.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
            }
            if (data.status == 2) {
                let x = data.x, y = data.y, w = data.width, h = data.height, r = 15;
                // 开始绘制
                ctx.beginPath()
                // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
                // 这里是使用 fill 还是 stroke都可以，二选一即可
                // ctx.setFillStyle('transparent')
                ctx.setStrokeStyle('transparent')
                // 左上角
                ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
                // border-top
                ctx.moveTo(x + r, y)
                ctx.lineTo(x + w - r, y)
                ctx.lineTo(x + w, y + r)
                // 右上角
                ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
                // border-right
                ctx.lineTo(x + w, y + h - r)
                ctx.lineTo(x + w - r, y + h)
                // 右下角
                ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
                // border-bottom
                ctx.lineTo(x + r, y + h)
                ctx.lineTo(x, y + h - r)
                // 左下角
                ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
                // border-left
                ctx.lineTo(x, y + r)
                ctx.lineTo(x + r, y)
                // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
                // ctx.fill()
                ctx.stroke()
                ctx.closePath()
                // 剪切
                ctx.clip()
            }
            ctx.drawImage(data.source, data.x, data.y, data.width, data.height)
            ctx.restore()
            if (data.hasOwnProperty('borderColor') && (typeof data.borderColor == 'string')) {
                let borderWidth = 1;
                if (data.hasOwnProperty('borderWidth') && (typeof data.borderWidth == 'number')) 
                    borderWidth = data.borderWidth
                ctx.save()
                ctx.setStrokeStyle(data.borderColor)
                ctx.setLineWidth(borderWidth)
                ctx.strokeRect(data.x, data.y, data.width, data.height)
                ctx.restore()
            }
        }
    }

    function draw_text(data) { //绘制文字
        var temp = "";
        var row = [];
        if (data.hasOwnProperty('text') && typeof data.text == 'string') {
            let color = 'black'
            if (data.hasOwnProperty('textColor') && (typeof data.textColor == 'string')) {
                color = data.textColor
            }
            let font = 35
            if (data.hasOwnProperty('font') && (typeof data.font == 'number')) {
                font = data.font
            }
            let textAlign = 'center'
            if (data.hasOwnProperty('textAlign') && (typeof data.textAlign == 'string')) {
                textAlign = data.textAlign
            }
            let textBaseLine = 'middle'
            if (data.hasOwnProperty('textAlign') && (typeof data.textBaseLine == 'string')) {
                textBaseLine = data.textBaseLine
            }
            ctx.save()
            if (data.shadow) {
                draw_shadow(data.shadow);
            } //edn if
            ctx.setFillStyle(color)
            ctx.setFontSize(font)

            for (var a = 0; a < data.text.length; a++) {
                if (ctx.measureText(temp).width < 420) 
                    temp += data.text[a];
                else {
                    a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
                    row.push(temp);
                    temp = "";
                }
            }
            row.push(temp);

            //如果数组长度大于2 则截取前两个
            if (row.length > 2) {
                var rowCut = row.slice(0, 2);
                var rowPart = rowCut[1];
                var test = "";
                var empty = [];
                for (var a = 0; a < rowPart.length; a++) {
                    if (ctx.measureText(test).width < 420)
                        test += rowPart[a];
                    else
                        break;
                }
                empty.push(test);
                var group = empty[0] + "..." //这里只显示两行，超出的用...表示
                rowCut.splice(1, 1, group);
                row = rowCut;
            }
            for (var b = 0; b < row.length; b++) {
                ctx.fillText(row[b], data.x, data.y + (b * 28), 400);
                ctx.setTextAlign(textAlign)
            }
            ctx.setTextBaseline(textBaseLine)
            ctx.restore()
        } //end if
    } //end func

    function draw_rect(data) { //绘制矩形
        if (data.hasOwnProperty('x') && typeof data.x == 'number' && data.hasOwnProperty('y') && typeof data.y == 'number' && data.hasOwnProperty('width') && typeof data.width == 'number' && data.hasOwnProperty('height') && typeof data.height == 'number') {
            let shadowType = data.shadow.type || 'body';
            if (data.hasOwnProperty('color') && (typeof data.color == 'string')) {
                ctx.save()
                if (data.shadow && shadowType == 'body') {
                    draw_shadow(data.shadow);
                } //edn if
                ctx.setFillStyle(data.color)
                ctx.fillRect(data.x, data.y, data.width, data.height)
                ctx.restore()
            }
            if (data.hasOwnProperty('borderColor') && (typeof data.borderColor == 'string')) {
                let borderWidth = 1;
                if (data.hasOwnProperty('borderWidth') && (typeof data.borderWidth == 'number')) {
                    borderWidth = data.borderWidth
                }
                ctx.save()
                if (data.shadow && shadowType == 'border') {
                    draw_shadow(data.shadow);
                } //edn if
                ctx.setStrokeStyle(data.borderColor)
                ctx.setLineWidth(borderWidth)
                ctx.strokeRect(data.x, data.y, data.width, data.height)
                ctx.restore()
            }
        } //end if
    } //end func

    function draw_arc(data) { //绘制圆或弧
        if (data.hasOwnProperty('x') && typeof data.x == 'number' && data.hasOwnProperty('y') && typeof data.y == 'number' && data.hasOwnProperty('radius') && typeof data.radius == 'number') {
            let shadowType = data.shadow.type || 'body';
            let start = 0
            if (data.hasOwnProperty('start') && (typeof data.start == 'number')) {
                start = data.start
            }
            let end = 360
            if (data.hasOwnProperty('end') && (typeof data.end == 'number')) {
                end = data.end
            }

            ctx.arc(data.x, data.y, data.radius, start * Math.PI / 180, end * Math.PI / 180)
            if (data.hasOwnProperty('color') && (typeof data.color == 'string')) {
                ctx.save()
                if (data.shadow && shadowType == 'body') {
                    draw_shadow(data.shadow);
                } //edn if
                ctx.setFillStyle(data.color)
                ctx.fill()
                ctx.restore()
            }
            if (data.hasOwnProperty('borderColor') && (typeof data.borderColor == 'string')) {
                let borderWidth = 1;
                if (data.hasOwnProperty('borderWidth') && (typeof data.borderWidth == 'number')) {
                    borderWidth = data.borderWidth
                }
                ctx.save()
                if (data.shadow && shadowType == 'border') {
                    draw_shadow(data.shadow);
                } //edn if
                ctx.setStrokeStyle(data.borderColor)
                ctx.setLineWidth(borderWidth)
                ctx.stroke()
                ctx.restore()
            }
        } //edn if
    } //end func

    function draw_line(data) { //绘制连续路径形成得不规则形状
        if (data.hasOwnProperty('x1') && typeof data.x1 == 'number' && data.hasOwnProperty('y1') && typeof data.y1 == 'number' && data.hasOwnProperty('x2') && typeof data.x2 == 'number' && data.hasOwnProperty('y2') && typeof data.y2 == 'number') {
            ctx.beginPath()
            ctx.moveTo(data.x1, data.y1)
            ctx.lineTo(data.x2, data.y2)
            if (data.hasOwnProperty('color') && (typeof data.color == 'string')) {
                let width = 1;
                if (data.hasOwnProperty('width') && (typeof data.width == 'number')) {
                    width = data.width
                }
                ctx.save()
                if (data.shadow) {
                    draw_shadow(data.shadow);
                } //edn if
                ctx.setStrokeStyle(data.color)
                ctx.setLineWidth(width)
                ctx.stroke()
                ctx.restore()
            }
        }
    } //end func

    function draw_path(data) { //绘制连续路径形成得不规则形状
        if (data.hasOwnProperty('path') && typeof data.path == 'object' && data.path.length > 1) {
            let shadowType = data.shadow.type || 'body';
            let pathList = data.path
            ctx.beginPath()
            ctx.moveTo(pathList[0].x, pathList[0].y)
            for (let j = 1; j < pathList.length; j++) {
                ctx.lineTo(pathList[j].x, pathList[j].y)
            }
            if (data.closePath) {
                ctx.closePath()
            }
            if (data.hasOwnProperty('color') && (typeof data.color == 'string')) {
                ctx.save()
                if (data.shadow && shadowType == 'body') {
                    draw_shadow(data.shadow);
                } //edn if
                ctx.setFillStyle(data.color)
                ctx.fill()
                ctx.restore()
            }
            if (data.hasOwnProperty('borderColor') && (typeof data.borderColor == 'string')) {
                let borderWidth = 1;
                if (data.hasOwnProperty('borderWidth') && (typeof data.borderWidth == 'number')) {
                    borderWidth = data.borderWidth
                }
                ctx.save()
                if (data.shadow && shadowType == 'border') {
                    draw_shadow(data.shadow);
                } //edn if
                ctx.setStrokeStyle(data.borderColor)
                ctx.setLineWidth(borderWidth)
                ctx.stroke()
                ctx.restore()
            }
        } //edn if
    } //end func

    function draw_shadow(data) {
        console.log('shadow data', data)
        let offsetX = data.offsetX || 0;
        let offsetY = data.offsetY || 0;
        let blur = data.blur || 10;
        let color = data.color || '#000000';
        ctx.setShadow(offsetX, offsetY, blur, color);
    } //edn func

    return draw;
};

module.exports = idraw();