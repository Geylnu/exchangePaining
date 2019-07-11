/**
 * 参考文档 www.canvasapi.cn
 * */

let data = []

let myCanvas = document.getElementById('myCanvas')
myCanvas.width = document.documentElement.clientWidth
myCanvas.height = document.documentElement.clientHeight
let context = myCanvas.getContext('2d')
let drawing = false
let point = {}
let step = -1
document.addEventListener('mousedown',(e)=>{
    point.x = e.clientX
    point.y = e.clientY
    drawing = true
    console.log('down')
    step++
    data[step] = []
})

document.addEventListener('mousemove',(e)=>{
    if (drawing){
        requestAnimationFrame(test)
        let newPonit = {x:e.clientX,y:e.clientY}
        data[step].push({start: point,end:newPonit})
        point = newPonit
        console.log('drawing')
    }
})

document.addEventListener('mouseup',(e)=>{
    drawing = false
    console.log('up')
})


function test() {
    console.log(step)
    if (step !== -1 ){
        data[step].forEach((path)=>{
            drawLine(path.start,path.end)
            console.log('render')
        })
    }
}

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