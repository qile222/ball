import commonRes from './res_common'
import Util from './util'

const runningStates = commonRes.runningStates
const floor = Math.floor

class ScheduleNode {

    constructor(id, interval, state, cb) {
        this.id = id
        this.cb = cb
        this.state = state
        this.interval = interval
        this.scheduleTime = 0
        this.preTime = 0
        this.loopedCount = 0
    }

}

export default class Scheduler {

    get invalidScheduleID() {
        return null
    }

    constructor() {
        this.nodes = new Map()
        this.state = runningStates.running
        this.startTime = Util.time()
        this.preTime = this.startTime
        this.timeScale = 1
        this.idCursor = 0
    }

    setTimeScale(timeScale) {
        this.timeScale = timeScale
    }

    getTimeScale() {
        return this.timeScale
    }

    update() {
        if (this.state != runningStates.running) {
            return
        }
        let now = Util.time()
        let dt = (now - this.preTime) * this.timeScale
        this.preTime = now
        // let tickCount = 1
        // if (dt < 100) {
        //     return
        // }
        // let dt = (now - this.preTime) * this.timeScale
        // let tickCount = floor(dt / fps)
        // if (tickCount > 1) {
        //     console.log('tick', tickCount, dt)
        // }
        // this.preTime = now - (dt - tickCount * fps) / this.timeScale
        for (let [id, node] of this.nodes) {
            if (node.state == runningStates.running) {
                node.scheduleTime += dt
                let loopedCount = floor(node.scheduleTime / node.interval)
                if (node.interval == 0 || loopedCount > node.loopedCount) {
                    ++node.loopedCount
                    node.cb(node.scheduleTime - node.preTime)
                    node.preTime = node.scheduleTime
                }
            } else if (node.state == runningStates.stop) {
                this.nodes.delete(id)
            }
        }
    }

    pause(id) {
        this.nodes(id).state = runningStates.pause
    }

    pauseAll() {
        this.state = runningStates.pause
        for (let node of this.nodes) {
            if (node.state == runningStates.running) {
                node.state = runningStates.pause
            }
        }
    }

    resume(id) {
        this.nodes.get(id).state = runningStates.running
    }

    resumeAll() {
        this.state = runningStates.running
        for (let node of this.nodes) {
            if (node.state == runningStates.pause) {
                node.state = runningStates.running
            }
        }
    }

    unschedule(id) {
        this.nodes.get(id).state = runningStates.stop
    }

    unscheduleAll() {
        for (let node of this.nodes) {
            node.state = runningStates.stop
        }
    }

    schedule(interval, cb) {
        let node = new ScheduleNode(++this.idCursor, interval, this.state, cb)
        this.nodes.set(this.idCursor, node)
        return this.idCursor
    }

    scheduleOnce(interval, cb) {
        let id = this.schedule(interval, () => {
            cb()
            this.unschedule(id)
        })
    }

}