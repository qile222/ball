import {loginManager, scheduler, display,
    eventDispatcher, device} from './global'

let end = false
window.onerror = function () {
    end = true
    eventDispatcher.emit(window, 'runtime_error')
    alert(JSON.stringify(arguments))
    return false
}

/*
    卡出翔....
    为啥移动端浏览器就是不给满帧
*/
console.log(device.platform)
let fps = Math.floor(1000 / (device.platform == 'mobile' && 0 ? 30 : 60))
scheduler.setFPS(fps)

display.showStat(DEBUG)

loginManager.enter()

function mainLoop() {
    if (!end) {
        scheduler.update()
        requestAnimationFrame(mainLoop)
    }
}
requestAnimationFrame(mainLoop)