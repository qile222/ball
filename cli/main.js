import {loginManager, scheduler, display, eventDispatcher} from './global'

let end = false
window.onerror = function (...params) {
    end = true
    eventDispatcher.emit(window, 'runtime_error')
    return false
}

display.showStat(DEBUG)

loginManager.enter()

function mainLoop() {
    if (!end) {
        scheduler.update()
        requestAnimationFrame(mainLoop)
    }
}
requestAnimationFrame(mainLoop)