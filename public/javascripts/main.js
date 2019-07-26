/**
 * canvas API 参考文档 www.canvasapi.cn
 * */

let canvasEl = document.querySelector('#myCanvas')
let clearButton = document.querySelector('.clear')
let lastStep = document.querySelector('.lastStep')
let nextStep = document.querySelector('.nextStep')
let exchange = document.querySelector('.exchange')
let toastEl = document.querySelector('.toast')
let canvasWrapper = document.querySelector('.canvas-wrapper')
let inner = document.querySelector('.buttonList .inner')
let favourEl = document.querySelector('.favour')
let favourWrapper = document.querySelector('.svgWrapper')
let nextPainting = document.querySelector('.nextPainting')
let backIndex = document.querySelector('.back')

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
    drawLine,
    drawCurve,
    configCanvas,
    clear,
    back,
    next,
    setSize,
    playBack,
    render,
    vaildData,
    stopPlay: null,
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

    this.removeEvent = () => {
        this.el.removeEventListener('mousedown', handleMousedown)
        this.el.removeEventListener('mousemove', handleMouseMove)
        this.el.removeEventListener('mouseup', handleMouseUp)
        this.el.removeEventListener('mouseleave', handleMouseLeave)
    }
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
        } else if (elOrCache instanceof Array) {
            data = elOrCache
        }
        let pos = computPosition(data)
        return { x: pos.x, y: pos.y, data }
    }


    let cache = null
    function transformFix({ x, y }) {
        if (cache) {
            let position = getOffsetPosition(x, y, cache)
            x = position.x
            y = position.y
        } else {
            let position = getOffsetPosition(x, y, myCanvas.el)
            x = position.x
            y = position.y
        }
        return { x, y }
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

    this.removeEvent = () => {
        this.el.removeEventListener('touchstart', handleTouchStart)
        this.el.removeEventListener('touchmove', handleTouchMove)
        this.el.removeEventListener('touchend', handleTouchEnd)
    }
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
        let length = this.data.push([])
        this.step = length - 1
    } else {
        let needRecond = true
        if (this.drawing && (needRecond || type !== undefined)) {
            needRecond = false
            let currentTime = Date.now() - this.time
            let { x, y } = newPonit
            let length = this.data[this.step].push({ x, y, time: currentTime })
            this.tinyStep = length - 1
            let lastPoint = this.render()
            this.lastPoint = lastPoint
            window.setTimeout(() => {
                needRecond = true
            }, 1000 / 30)
        }
    }

    if (type === 'end') {
        this.drawing = false
        this.tinyStep = -1
    }
}

function init(data) {
    this.data = data || []
    this.step = -1
    this.tinyStep = -1
    this.time = -1
    this.status = 'normal'
    this.lastPoint = {x:0,y:0}
    this.configCanvas()
    this.clear()
}

function render(obj) {
    function getMiddlePonit(a, b) {
        let x = a.x + (b.x - a.x) / 2
        let y = a.y + (b.y - a.y) / 2
        return { x, y }
    }

    obj = obj || {}
    let data = obj.data
    let lastPoint = obj.lastPoint
    let step = obj.step
    let tinyStep = obj.tinyStep

    data = (data === undefined? this.data : data)
    step = (step === undefined? this.step :step)
    console.log('-------------------------')
    console.log(step, tinyStep)
    tinyStep = (tinyStep === undefined? this.tinyStep:tinyStep)
    lastPoint = (lastPoint === undefined? this.lastPoint:lastPoint)
    console.log(step, tinyStep)
    let stepArray = data[step]
    if (tinyStep > 1) {
        let pointArray = stepArray.slice(tinyStep - 2, tinyStep)
        let endPoint = getMiddlePonit(pointArray[0], pointArray[1])
        let middlePoint = pointArray[0]
        this.drawCurve(lastPoint, middlePoint, endPoint)
        lastPoint = endPoint
    } else if (tinyStep === 1) {
        this.drawLine(stepArray[0], stepArray[1])
    } else {
        lastPoint = stepArray[tinyStep]
        this.drawLine(stepArray[0], stepArray[0])
    }
    return lastPoint
}

function back() {
    let data = this.data
    this.clear()
    if (this.step !== -1) {
        this.step--
        this.tinyStep = 0
        this.lastPoint = { x: 0, y: 0 }
        this.status = 'middle'
        for (let i = 0; i <= this.step; i++) {
            this.data[i].forEach((point, index) => {
                this.lastPoint = this.render({ step: i, tinyStep: index })
            })
        }
    } else {
        this.clear()
        this.init()
    }
}

function next() {
    let data = this.data
    if (this.status = 'middle') {
        if (data[this.step + 1]) {
            this.clear()
            this.step++
            for (let i = 0; i <= this.step; i++) {
                this.data[i].forEach((point, index) => {
                    this.lastPoint = this.render({ step: i, tinyStep: index })
                })  
            }
        } else {
            toast('已经是最后一步了')
        }

    }
}

function playBack() {
    this.clear()
    let data = this.data
    let timerId = 0
    let step = 0
    let tinyStep = 0
    let lastPoint = {x:0,y:0}
    let point = data[step][tinyStep]
    let time = point.time

    let render = () => {
        lastPoint =this.render({step,tinyStep,lastPoint})
        if (tinyStep < data[step].length - 1) {
            tinyStep++
        } else if (step < data.length - 1) {
            tinyStep = 0
            step++
        } else {
            return
        }
        point = data[step][tinyStep]
        newTime = point.time - time
        time = point.time

        timerId = window.setTimeout(render, newTime)
    }

    window.setTimeout(render, time)
    this.stopPlay = () => {
        window.clearTimeout(timerId)
    }
}

function vaildData() {
    let data = this.data
    let result = false
    if (data && data.length > 0) {
        lastStep = data[data.length - 1]
        let time = lastStep[lastStep.length - 1].time
        if (time > 3000) {
            result = true
        }
    }
    return result
}

function drawLine(point1, point2) {
    this.context.beginPath()
    this.context.moveTo(point1.x, point1.y)
    this.context.lineTo(point2.x, point2.y)
    this.context.stroke()
    this.context.closePath()
}


function configCanvas() {
    this.context.strokeStyle = 'black'
    this.context.lineCap = 'round'
    this.context.lineJoin = 'round'
    this.context.lineWidth = 6
    this.context.shadowBlur = 2
    this.context.shadowColor = 'rgb(0, 0, 0)'
}

function drawCurve(beginPoint, controlPoint, endPoint) {
    this.context.beginPath()
    this.context.moveTo(beginPoint.x, beginPoint.y)
    this.context.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
    this.context.stroke();
    this.context.closePath();
}

function clear() {
    this.context.save()
    this.context.fillStyle = 'white'
    this.context.fillRect(0, 0, this.el.width, this.el.height);
    this.context.restore();
}

function setSize() {
    this.el.width = 320
    this.el.height = 480
}


function toast(text) {
    toastEl.innerText = text
    toastEl.classList.add('active')
    toastEl.addEventListener('animationend', () => {
        toastEl.classList.remove('active')
    })
}

myCanvas.setSize()
myCanvas.bindEvent()
myCanvas.init()

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

let favourObj = {
    el: favourEl,
    wrapper: favourWrapper,
    active() {
        this.el.classList.add('active')
        this.wrapper.classList.add('active')
    },
    remove() {
        this.el.classList.remove('active')
        this.wrapper.classList.remove('active')
    },
    hangle(favour, favourNum) {
        if (favourNum === 0) {
            favourNum = ''
        }
        this.wrapper.setAttribute('data-favour', favourNum)
        favour ? this.active() : this.remove()
    }
}

let paintingId = ''

async function exchangePainting(e) {
    e.preventDefault()
    let path = '/api/painting'
    if (myCanvas.vaildData()) {
        let res = await axios.post(path, {
            data: pako.deflate(JSON.stringify(myCanvas.data), { to: 'string' })
        })
        if (res.status === 200) {
            myCanvas.removeEvent()
            let res = await axios.get(path)
            canvasWrapper.classList.add('active')
            let { data, favourNum, favour } = res.data
            paintingId = res.data.paintingId
            favourObj.hangle(favour, favourNum)
            canvasWrapper.addEventListener('animationend', () => {
                canvasWrapper.classList.remove('active')
                myCanvas.init(data)
                myCanvas.playBack()
            }, { once: true })
            inner.classList.add('active')
        } else if (res.status === 413) {
            toast('画大小超过限制')
        } else {
            toast('未知错误')
        }
    } else {
        toast('画的时间太短啦！')
    }
}

let waiting = false
exchange.addEventListener('click', exchangePainting)
nextPainting.addEventListener('click', async (e) => {
    if (!waiting) {
        e.preventDefault()
        myCanvas.stopPlay()
        waiting = true
        let path = '/api/painting'
        let res = await axios.get(path)
        canvasWrapper.classList.add('active')
        let { data, favourNum, favour } = res.data
        paintingId = res.data.paintingId
        favourObj.hangle(favour, favourNum)
        canvasWrapper.addEventListener('animationend', () => {
            canvasWrapper.classList.remove('active')
            myCanvas.init(data)
            myCanvas.playBack()
            waiting = false
        }, { once: true })
    } else {
        toast('点击的太快了')
    }
})

favourEl.addEventListener('click', async (e) => {
    let isActive = e.currentTarget.classList.toggle('active')
    favourWrapper.classList.toggle('active')
    let res = await axios.post('/api/favour', {
        data: { favour: isActive, paintingId }
    })

    let favourNum = res.data
    if (favourNum === 0) {
        favourNum = ''
    }
    favourWrapper.setAttribute('data-favour', favourNum)
})

backIndex.addEventListener('click', (e) => {
    inner.classList.remove('active')
    canvasWrapper.classList.add('active')
    canvasWrapper.addEventListener('animationend', () => {
        canvasWrapper.classList.remove('active')
        myCanvas.stopPlay()
        myCanvas.init()
        myCanvas.bindEvent()
    }, { once: true })

})