import {loginManager, scheduler} from './global'
loginManager.enter()

function mainLoop() {
    scheduler.update()
    requestAnimationFrame(mainLoop)
}
requestAnimationFrame(mainLoop)