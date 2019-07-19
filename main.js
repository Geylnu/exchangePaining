/**
 * canvas API 参考文档 www.canvasapi.cn
 * */


let canvasEl = document.querySelector('#myCanvas')
let clearButton = document.querySelector('.clear')
let playButton = document.querySelector('.play')
let backButton = document.querySelector('.back')

/** 阻止默认滚动事件，防止下拉等情况 */
document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, { passive: false })

clearButton.addEventListener('click',(e)=>[
    e.currentTarget.classList.add('play')
])

clearButton.addEventListener('animationend',(e)=>{
    e.currentTarget.classList.remove('play')
})

let context = canvasEl.getContext('2d')
let myCanvas = {
    el: canvasEl,
    context,
    data: [],
    step: -1,
    tinyStep: -1,
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

/**对于 */
function listenerToMouse() {
    let handleMousedown = (e) => {
        let newPonit = { x: e.offsetX, y: e.offsetY }
        console.log(e)
        this.handleDrawing(newPonit, 'start')
    }

    let handleMouseMove = (e) => {
        let newPonit = { x: e.offsetX, y: e.offsetY }
        this.handleDrawing(newPonit)
        e.s
    }

    let handleMouseUp = (e) => {
        let newPonit = { x: e.offsetX, y: e.offsetY }
        this.handleDrawing(newPonit, 'end')
    }
    this.el.addEventListener('mousedown', handleMousedown)
    this.el.addEventListener('mousemove', handleMouseMove)
    this.el.addEventListener('mouseup', handleMouseUp)
}

function listenerToTouch() {
    let currentTarget = this.el
        let top = this.el.offsetTop
        let left = this.el.offsetLeft
        
        while (currentTarget.offsetParent !==null){
            currentTarget = currentTarget.offsetParent
            top+=currentTarget.offsetTop
            left+=currentTarget.offsetLeft
        }


    let handleTouchStart = (e) => {
        let newPonit = { x: e.touches[0].clientX-left, y: e.touches[0].clientY-top }
        this.handleDrawing(newPonit, 'start')
    }

    let handleTouchMove = (e) => {
        let newPonit = { x: e.touches[0].clientX-left, y: e.touches[0].clientY-top }
        this.handleDrawing(newPonit, 'move')
    }

    let handleTouchEnd = (e) => {
        let newPonit = { x: e.changedTouches[0].clientX-left, y: e.changedTouches[0].clientY-top }
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
    // this.context.lineTo(point2.x, point2.y)
    let midPointX = point1.x + (point2.x - point1.x) / 2
    let midPointY = point1.y + (point2.y - point1.y) / 2
    this.context.quadraticCurveTo(midPointX, midPointY, point2.x, point2.y);
    this.context.shadowBlur = 3
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
    this.el.width = 320
    this.el.height = 480
}
myCanvas.setSize()
myCanvas.bindEvent()

clearButton.addEventListener('click', (e) => {
    myCanvas.clear()
})

backButton.addEventListener('click', (e) => {
    myCanvas.back()
})

// playButton.addEventListener('click', (e) => {
//     myCanvas.playBack()
// })


