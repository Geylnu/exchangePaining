/**
 * canvas API 参考文档 www.canvasapi.cn
 * */

let canvasEl = document.querySelector('#myCanvas')
let clearButton = document.querySelector('.clear')
let playButton = document.querySelector('.play')
let backButton = document.querySelector('.back')

let context = canvasEl.getContext('2d')
let myCanvas = {
    el: canvasEl,
    context,
    data: [],
    step: -1,
    time: -1,
    lastPoint: { x: 0, y: 0 },
    drawing: false,
    bindEvent,
    removeEvent: null,
    listenerToMouse,
    listenerToTouch,
    handleDrawing,
    clear,
    back,
    drawLine,
    setSize, 
    playBack
}

function bindEvent() {
    if (document.body.ontouchstart !== undefined) {
        this.listenerToTouch()
    } else {
        this.listenerToMouse()
    }
}

function listenerToMouse() {
    let handleMousedown = (e) => {
        if (this.time === -1) {
            this.time = Date.now()
        }
        this.lastPoint = { x: e.clientX, y: e.clientY }
        this.drawing = true
        this.step++
        this.data[this.step] = []
    }

    let handleMouseMove = (e) => {
        let newPonit = { x: e.clientX, y: e.clientY }
        this.handleDrawing(newPonit)
        e.s
    }

    let handleMouseUp = (e) => {
        let newPonit = { x: e.clientX, y: e.clientY }
        this.handleDrawing(newPonit)
        this.drawing = false
    }
    this.el.addEventListener('mousedown', handleMousedown)
    this.el.addEventListener('mousemove', handleMouseMove)
    this.el.addEventListener('mouseup', handleMouseUp)
}

function listenerToTouch() {
    let handleTouchStart = (e) => {
        if (this.time === -1) {
            this.time = Date.now()
        }
        this.lastPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        this.drawing = true
        this.step++
        this.data[this.step] = []
    }

    let handleTouchMove = (e) => {
        let newPonit = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        this.handleDrawing(newPonit)
        e.s
    }

    let handleTouchEnd = (e) => {
        let newPonit = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
        this.handleDrawing(newPonit)
        this.drawing = false
    }
    this.el.addEventListener('touchstart', handleTouchStart)
    this.el.addEventListener('touchmove', handleTouchMove)
    this.el.addEventListener('touchend', handleTouchEnd)
}

function handleDrawing(newPonit) {
    if (this.drawing) {
        let currentTime = Date.now() - this.time
        this.data[this.step].push({ start: this.lastPoint, end: newPonit, time: currentTime })
        this.drawLine(this.lastPoint, newPonit)
        this.lastPoint = newPonit
    }
}

function drawLine(point1, point2) {
    this.context.beginPath()
    this.context.strokeStyle = 'black'
    this.context.lineCap = 'round'
    this.context.lineJoin = 'round'
    this.context.lineWidth = 5
    this.context.moveTo(point1.x, point1.y)
    this.context.lineTo(point2.x, point2.y)
    this.context.stroke()
    this.context.closePath()
}

function clear() {
    this.context.save()
    this.context.fillStyle = 'white'
    this.context.fillRect(0, 0, this.el.width, this.el.height);
    this.context.restore();
}

function back() {
    this.clear()
    let data = this.data
    data.pop()
    data.forEach((step) => {
        step.forEach((path) => {
            this.drawLine(path.start, path.end)
        })
    })
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
    this.el.width = document.documentElement.clientWidth
    this.el.height = document.documentElement.clientHeight
}
myCanvas.setSize()
myCanvas.bindEvent()

clearButton.addEventListener('click', (e) => {
    myCanvas.clear()
    console.log('d0')
})

backButton.addEventListener('click', (e) => {
    myCanvas.back()
})

playButton.addEventListener('click',(e)=>{
    myCanvas.playBack()
})

document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
},{passive: false})
