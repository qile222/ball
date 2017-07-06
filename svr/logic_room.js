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
        this.startTime = Util.time()
        this.seed = Util.time()
        this.state = gameState.playing

        this.pushBackKeyFrame()
    }

    pause() {

    }

    end() {
        this.state = gameState.ended
    }

    willEnd() {
        this.state = gameState.ending
    }

    getSeed() {
        return this.seed
    }

    getStartTime() {
        return this.startTime
    }

    getDuration() {
        return Util.time() - this.startTime
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
        let frameIndex = Math.floor((Util.time() - this.startTime) / keyFrameInterval)
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
        this.keyFrameData.cmds.push(
            new Cmd(playerID, cmd.action, cmd.data, Util.time() - this.startTime)
        )
    }

    handleGameEndData(data) {
        let tmpArr = Object.keys(data).map(key => data[key])
        let dataArr = []
        for (let endData of tmpArr) {
            if (endData) {
                dataArr.push(endData)
            }
        }
        if (dataArr.length < 2) {
            return dataArr[0]
        }
        let abs = Math.abs
        let refEndData = dataArr[0]
        for (let j = 1; j < dataArr.length; ++j) {
            let endData = dataArr[j]
            if (endData.rankList.length != refEndData.rankList.length) {
                logger.info('unexpected data %j', data)
                return
            }
            for (let i = 0; i < endData.rankList.length; ++i) {
                let playerData = endData.rankList[i]
                let refPlayerData = refEndData.rankList[i]
                if (playerData.id != refPlayerData.id) {
                    logger.info('unexpected player id %j', data)
                    return
                }
                if (abs(playerData.weight - refPlayerData.weight) > commonRes.epsilon) {
                    logger.info('unexpected player weight %j', data)
                    return
                }
                if (playerData.liveTime != refPlayerData.liveTime) {
                    logger.info('unexpected player liveTime %j', data)
                    return
                }
                if (playerData.eatenCount != refPlayerData.eatenCount) {
                    logger.info('unexpected player eatenCount %j', data)
                    return
                }
                if (abs(playerData.position.x - refPlayerData.position.x) > commonRes.epsilon) {
                    logger.info('unexpected player px %j', data)
                    return
                }
                if (abs(playerData.position.y - refPlayerData.position.y) > commonRes.epsilon) {
                    logger.info('unexpected player py %j', data)
                    return
                }
            }
        }
        return refEndData
    }
}

module.exports = RoomLogic