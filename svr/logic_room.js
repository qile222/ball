const logger = require('./logger')
const commonRes = require('./res_common')
const Util = require('./util')

const gameState = commonRes.gameState
const keyFrameInterval = commonRes.keyFrameInterval

class Cmd {

    constructor(playerID, action, data, time) {
        this.playerID = playerID
        this.action = action
        this.time = time
        this.data = data
    }

}

class FrameData {

    constructor(index) {
        this.cmds = []
        this.index = index
    }

}

class RoomLogic {

    constructor(server, id) {
        this.server = server
        this.id = id
        this.frameData = []
        this.keyFrameData = null
        this.startTime = util.time()
        this.seed = util.time()
        this.state = gameState.playing
        this.settlementData = null

        this.pushBackKeyFrame()
    }

    pause() {

    }

    end() {
        this.state = gameState.ended
    }

    settlement() {
        this.state = gameState.settlementing
        this.settlementData = {}
    }

    getSeed() {
        return this.seed
    }

    getStartTime() {
        return this.startTime
    }

    getDuration() {
        return util.time() - this.startTime
    }

    getState() {
        return this.state
    }

    pushBackKeyFrame() {
        if (this.keyFrameData) {
            this.frameData.push(this.keyFrameData)
        }
        this.keyFrameData = new FrameData(this.frameData.length)
    }

    getKeyFrameData() {
        if (this.state != gameState.playing) {
            return null
        }
        let frameIndex = Math.floor((util.time() - this.startTime) / keyFrameInterval)
        if (frameIndex > this.keyFrameData.index) {
            this.keyFrameData.cmds.sort((c1, c2) => {
                return c1.time - c2.time
            })
            let frameData = this.keyFrameData
            this.pushBackKeyFrame()
            return frameData
        } else {
            return null
        }
    }

    getFrameData(lastFrameIndex) {
        let frameData = this.frameData.slice(lastFrameIndex)
        return frameData
    }

    handleCmd(playerID, cmd) {
        if (this.state != gameState.playing) {
            return
        }
        this.keyFrameData.cmds.push(new Cmd(playerID, cmd.action, cmd.data, util.time() - this.startTime))
    }

    handleSettlementData(data) {
        this.settlementData.push(data)
    }

    getSettlementResult() {
        let result = {}
        this.end()
        return result
    }

}

module.exports = RoomLogic