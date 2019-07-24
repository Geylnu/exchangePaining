/**
 * canvas API 参考文档 www.canvasapi.cn
 * */

let canvasEl = document.querySelector('#myCanvas')
let clearButton = document.querySelector('.clear')
let lastStep = document.querySelector('.lastStep')
let nextStep = document.querySelector('.nextStep')
let exchange = document.querySelector('.exchange')

/** 阻止默认滚动事件，防止下拉等情况 */
document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, { passive: false })

let context = canvasEl.getContext('2d')
let myCanvas = {
    init,
    el: canvasEl,
    context,
    data: [],
    step: -1,
    tinyStep: -1,
    time: -1,
    lastPoint: { x: 0, y: 0 },
    drawing: false,
    status: 'normal',
    bindEvent,
    removeEvent: null,
    listenerToMouse,
    listenerToTouch,
    handleDrawing,
    clear,
    back,
    next,
    drawLine,
    setSize,
    playBack,
    render,
}

function bindEvent() {
    if (document.body.ontouchstart !== undefined) {
        this.listenerToTouch()
    } else {
        this.listenerToMouse()
    }
}

/**对于transform的元素，offset的坐标系是相对于元素内的，因此不受影响 */
function listenerToMouse() {
    let handleMousedown = (e) => {
        let newPonit = { x: e.offsetX, y: e.offsetY }
        this.handleDrawing(newPonit, 'start')
    }
    let handleMouseMove = (e) => {
        let newPonit = { x: e.offsetX, y: e.offsetY }
        this.handleDrawing(newPonit)
    }
    let handleMouseUp = (e) => {
        let newPonit = { x: e.offsetX, y: e.offsetY }
        this.handleDrawing(newPonit, 'end')
    }
    let handleMouseLeave = (e) => {
        let newPonit = { x: e.offsetX, y: e.offsetY }
        this.handleDrawing(newPonit, 'end')
    }
    this.el.addEventListener('mousedown', handleMousedown)
    this.el.addEventListener('mousemove', handleMouseMove)
    this.el.addEventListener('mouseup', handleMouseUp)
    this.el.addEventListener('mouseleave', handleMouseLeave)
}

/**
 * 本部分为修正transform带来的坐标畸变参考了以下文档
 * https://www.zhangxinxu.com/wordpress/2012/06/css3-transform-matrix-%e7%9f%a9%e9%98%b5/comment-page-3/#comment-397082
 * https://juejin.im/entry/5b15ffa0e51d4506be266bac
 * W3C给出了没有为touch事件添加offsetX，Y的原因
 * https://github.com/w3c/touch-events/issues/62
 */
function listenerToTouch() {
    function getOffsetPosition(x, y, elOrCache) {
        function getVertexPosition(el) {
            let currentTarget = el
            let top = 0
            let left = 0
            while (currentTarget !== null) {
                top += currentTarget.offsetTop
                left += currentTarget.offsetLeft
                currentTarget = currentTarget.offsetParent
            }
            return { top, left }
        }

        function getTranformData(el) {
            let style = window.getComputedStyle(el)
            let transform = style.transform
            let transformOrigin = style.transformOrigin

            let origin = { x: 0, y: 0 }
            let matrix = math.ones([3, 3])
            if (transform !== 'none') {
                let originArray = transformOrigin.split(' ')
                origin.x = parseInt(originArray[0])
                origin.y = parseInt(originArray[1])

                let matrixString = transform.match(/\(([^)]*)\)/)[1]
                let stringArray = matrixString.split(',')
                let temp = []
                stringArray.forEach((value) => {
                    temp.push(parseFloat(value.trim()))
                })
                temp = [
                    [temp[0], temp[2], temp[4]],
                    [temp[1], temp[3], temp[5]],
                    [0, 0, 1],
                ]

                matrix = math.inv(temp)
            } else {
                matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
            }
            return { matrix, origin }
        }

        function computPosition(data) {
            data.forEach((obj) => {
                let { temp, origin, vertex: { left, top } } = obj
                x = x - left - origin.x
                y = y - top - origin.y
                let result = math.multiply(temp, [x, y, 1])
                x = result[0] + origin.x
                y = result[1] + origin.y
            })
            return { x, y }
        }

        let data = []
        if (elOrCache instanceof Node) {
            el = elOrCache
            while (el !== null && el.nodeType === 1) {
                let { left, top } = getVertexPosition(el)
                let transformData = getTranformData(el)
                temp = transformData.matrix
                origin = transformData.origin

                if (data.length > 0) {
                    data[0].vertex.left -= left
                    data[0].vertex.top -= top
                }
                data.unshift({
                    temp, origin, vertex: {
                        left, top
                    },
                })
                el = el.parentNode
            }
        }else if (elOrCache instanceof Array){
            data = elOrCache
        }
        let pos =  computPosition(data)
        return {x: pos.x,y: pos.y,data}
    }


    let cache = null
    function transformFix({ x, y }) {
        if (cache){
            let position = getOffsetPosition(x, y, cache)
            x = position.x
            y= position.y
        }else{
            let position = getOffsetPosition(x, y, myCanvas.el)
            x = position.x
            y= position.y
        }
        return {x,y}
    }


    let handleTouchStart = (e) => {
        let x = e.touches[0].clientX
        let y = e.touches[0].clientY
        let newPonit = transformFix({ x, y })
        this.handleDrawing(newPonit, 'start')
    }

    let handleTouchMove = (e) => {
        let x = e.touches[0].clientX
        let y = e.touches[0].clientY
        let newPonit = transformFix({ x, y })
        this.handleDrawing(newPonit, 'move')
    }

    let handleTouchEnd = (e) => {
        let x = e.changedTouches[0].clientX
        let y = e.changedTouches[0].clientY
        let newPonit = transformFix({ x, y })
        this.handleDrawing(newPonit, 'end')
    }
    this.el.addEventListener('touchstart', handleTouchStart)
    this.el.addEventListener('touchmove', handleTouchMove)
    this.el.addEventListener('touchend', handleTouchEnd)
}

function handleDrawing(newPonit, type) {
    if (type === 'start') {
        if (this.time === -1) {
            this.time = Date.now()
        }
        if (this.status === 'middle') {
            this.data = this.data.slice(0, this.step + 1)
        } else {
            this.status = 'normal'
        }
        this.drawing = true
        this.step++
        this.data[this.step] = []
        this.lastPoint = newPonit
    } else {
        let needRecond = true
        if (this.drawing && needRecond) {
            needRecond = false
            let currentTime = Date.now() - this.time
            this.data[this.step].push({ start: this.lastPoint, end: newPonit, time: currentTime })
            this.tinyStep++
            this.render()
            this.lastPoint = newPonit
            needRecond = true
        }
    }

    if (type === 'end') {
        this.drawing = false
        this.tinyStep = -1
    }
}

function drawLine(point1, point2) {
    this.context.beginPath()
    this.context.strokeStyle = 'black'
    this.context.lineCap = 'round'
    this.context.lineJoin = 'round'
    this.context.lineWidth = 6
    this.context.moveTo(point1.x, point1.y)
    this.context.lineTo(point2.x, point2.y)
    this.context.shadowBlur = 2
    this.context.shadowColor = 'rgb(0, 0, 0)'
    this.context.stroke()
    this.context.closePath()
}

function clear() {
    this.context.save()
    this.context.fillStyle = 'white'
    this.context.fillRect(0, 0, this.el.width, this.el.height);
    this.context.restore();
}

function render() {
    let data = this.data
    let path = data[this.step][this.tinyStep]
    this.drawLine(path.start, path.end)
}

function init(data) {
    this.data = data || []
    this.step = -1
    this.tinyStep = -1
    this.time = -1
    this.status = 'normal'
}

function back() {
    let data = this.data
    this.clear()
    if (this.step !== -1) {
        this.step--
        this.status = 'middle'
        for (i = 0; i <= this.step; i++) {
            let stepArray = data[i]
            stepArray.forEach((path) => {
                this.drawLine(path.start, path.end)
            })
        }
    } else {
        this.clear()
        this.init()
    }
}

function next() {
    let data = this.data
    if (this.status = 'middle' && data[this.step + 1]) {
        this.clear()
        this.step++
        for (i = 0; i <= this.step; i++) {
            let stepArray = data[i]
            stepArray.forEach((path) => {
                this.drawLine(path.start, path.end)
            })
        }
    }
}

function playBack() {
    this.clear()
    this.data.forEach((step) => {
        step.forEach((path) => {
            window.setTimeout(() => {
                this.drawLine(path.start, path.end)
            }, path.time)
        })
    })
}

function setSize() {
    this.el.width = 320
    this.el.height = 480
}
myCanvas.setSize()
myCanvas.bindEvent()

clearButton.addEventListener('click', (e) => {
    e.currentTarget.classList.add('play')
    myCanvas.el.classList.add('play')
})

clearButton.addEventListener('animationend', (e) => {
    e.currentTarget.classList.remove('play')
    myCanvas.el.classList.remove('play')
    myCanvas.clear()
    myCanvas.init()
})

let timer = 0
lastStep.addEventListener('click', () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
        myCanvas.back()
    }, 100)
})

nextStep.addEventListener('click', () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
        myCanvas.next()
    }, 100)
})

exchange.addEventListener('click', async (e) => {
    e.preventDefault
    let test = myCanvas.data
    let path = '/api/painting'
    let res = await axios.post(path, {
        data: pako.deflate(JSON.stringify(myCanvas.data), { to: 'string' })
    })
    if (res.status === 200) {
        let res = await axios.get(path)
        myCanvas.init(res.data.data)
        myCanvas.playBack()
    } else if (res.status === 413) {

    }
})
