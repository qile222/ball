import {loginManager, scheduler, display} from './global'

display.showStat(DEBUG)

loginManager.enter()

function mainLoop() {
    scheduler.update()
    requestAnimationFrame(mainLoop)
}
requestAnimationFrame(mainLoop)