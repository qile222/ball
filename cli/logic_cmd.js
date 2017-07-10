import Logic from './logic'
import {console, gameManager} from './global'

export default class CmdLogic extends Logic {

    constructor(keyFrameDataQueue, keyFrameInterval) {
        super()
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
        let runningTime = gameManager.getRunningTime()
        let keyFrameData = this.frameDataQueue[this.keyFrameIndex]
        let cmds = keyFrameData.cmds
        let cmdLength = cmds.length
        while (this.keyFrameCmdIndex < cmdLength) {
            let cmd = cmds[this.keyFrameCmdIndex]
            if (runningTime >= cmd.time) {
                ++this.keyFrameCmdIndex
                gameManager.handleCmd(cmd)
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