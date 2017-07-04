import Logic from './logic'
import {console} from './global'

export default class CmdLogic extends Logic {

    constructor(manager, keyFrameDataQueue, keyFrameInterval) {
        super()
        this.manager = manager
        this.frameDataQueue = keyFrameDataQueue
        this.keyFrameIndex = 0
        this.keyFrameCmdIndex = 0
        this.keyFrameInterval = keyFrameInterval
    }

    destructor() {
        super.destructor()
    }

    getFrameDataQueue() {
        return this.frameDataQueue
    }

    getKeyFrameIndex() {
        return this.keyFrameIndex
    }

    getKeyFrameDelta() {
        return this.frameDataQueue.length - this.keyFrameIndex
    }

    createCmd(action, data) {
        return {
            action: action,
            data: data,
            index: this.frameDataQueue.length
        }
    }

    pushBackFrameData(frameData) {
        this.frameDataQueue.push(frameData)
    }

    update(dt) {
        let frameDataQueueLength = this.frameDataQueue.length
        console.assert(this.keyFrameIndex < frameDataQueueLength)
        let runningTime = this.manager.getRunningTime()
        let keyFrameData = this.frameDataQueue[this.keyFrameIndex]
        let cmds = keyFrameData.cmds
        let cmdLength = cmds.length
        while (this.keyFrameCmdIndex < cmdLength) {
            let cmd = cmds[this.keyFrameCmdIndex]
            if (runningTime >= cmd.time) {
                ++this.keyFrameCmdIndex
                this.manager.handleCmd(cmd)
            } else {
                return
            }
        }
        let frameTimeDelta = runningTime -
            (keyFrameData.index + 1) * this.keyFrameInterval
        if (frameTimeDelta >= 0) {
            ++this.keyFrameIndex
            this.keyFrameCmdIndex = 0
        }
    }

}