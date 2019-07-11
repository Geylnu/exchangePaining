/**
 * 参考文档 www.canvasapi.cn
 * */

let data = []

let myCanvas = document.getElementById('myCanvas')
let backButton = document.getElementsByClassName('back')[0]
myCanvas.width = document.documentElement.clientWidth
myCanvas.height = document.documentElement.clientHeight
let context = myCanvas.getContext('2d')
let drawing = false
let point = null
let step = -1
let time =  new Date().getTime()
debugger
myCanvas.addEventListener('mousedown', (e) => {
    point = {x: e.clientX,y:e.clientY}
    drawing = true
    step++
    data[step] = []
})

myCanvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        let newPonit = { x: e.clientX, y: e.clientY }
        data[step].push({ start: point, end: newPonit,time:})
        drawLine(point, newPonit)
        point = newPonit
    }
})

myCanvas.addEventListener('mouseup', (e) => {
    if (drawing) {
        let newPonit = { x: e.clientX, y: e.clientY }
        data[step].push({ start: point, end: newPonit })
        drawLine(point, newPonit)
        point = newPonit
    }
    drawing = false
})


function drawLine(point1, point2) {
    context.beginPath()
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.lineWidth = 5
    context.moveTo(point1.x, point1.y)
    context.lineTo(point2.x, point2.y)
    context.stroke()
    context.closePath()
}

let test = (e) => {
    e.stopPropagation()
    requestAnimationFrame(() => {
        context.save()
        context.fillStyle = 'white'
        context.fillRect(0, 0, myCanvas.width, myCanvas.height);
        context.restore();
        data.pop()
        data.forEach((step) => {
            step.forEach((path) => {
                drawLine(path.start, path.end)
            })
        })
    }
    )
}

backButton.addEventListener('click', test, true)

