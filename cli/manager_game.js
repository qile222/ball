import Manager from './manager'
import actionRes from './res_action'
import commonRes from './res_common'
import CmdLogic from './logic_cmd'
import MapLogic from './logic_map'
import PlayerLogic from './logic_player'
import ControllLogic from './logic_controll'
import protocolRes from './res_protocol'
import React from 'react'
import GameRenderer from './renderer_game'
import {util, memCache, netManager, console,
    scheduler, display, eventDispatcher, worldManager} from './global'
const fastForwardTimeScale = commonRes.fastForwardTimeScale
const initFastForwardTimeScale = commonRes.initFastForwardTimeScale
const gameState = commonRes.gameState
const min = Math.min

export default class GameManager extends Manager {

    constructor() {
        super()
        eventDispatcher.addListener(
            netManager,
            'netManager_message',
            this,
            this.onServerMessage
        )
        eventDispatcher.addListener(
            netManager,
            'netManager_error',
            this,
            this.onServerError
        )
        eventDispatcher.addListener(
            netManager,
            'netManager_disconnect',
            this,
            this.onServerDisconnect
        )
    }

    enter(addr, port, token, resID) {
        display.showLoading(true)
        this.offlineMode = false
        this.selectedResID = resID
        this.state = gameState.pendding
        netManager.connect('game', addr + ':' + port, 'token=' + token)
    }

    update(dt) {
        if (this.leftTime < 1) {
            return
        }
        while (dt > 0) {
            let frameDelta = this.cmdLogic.getKeyFrameDelta()
            if (frameDelta < 1) {
                if (this.state == gameState.initing) {
                    this.joinPlayer()
                    display.showLoading(false)
                } else if (this.state != gameState.pendding) {
                    return
                }
                if (this.scaleStartTime) {
                    let peddingTime = util.time() - this.scaleStartTime
                    console.log('end pendding', peddingTime, 'ms')
                    scheduler.setTimeScale(1)
                    this.scaleStartTime = null
                }
                this.state = gameState.playing
                return
            // } else if (frameDelta > 10000) {
            //     console.log('delta too much, will exit', frameDelta)
            //     this.onAbnormal()
            //     return
            } else if (frameDelta > 2) {
                do {
                    if (this.scaleStartTime) {
                        break
                    }
                    let timeScale
                    if (this.state == gameState.playing) {
                        this.state = gameState.pendding
                        timeScale = fastForwardTimeScale
                    } else if (this.state == gameState.initing) {
                        timeScale = initFastForwardTimeScale
                    } else {
                        break
                    }
                    scheduler.setTimeScale(timeScale)
                    console.log('start fast forwarding,delta count', frameDelta)
                    this.scaleStartTime = util.time()
                } while (!this) // for eslint no-constant-condition
            }
            let fixedInterval = this.keyFrameInterval
            let minDt = min(dt, fixedInterval)
            this.runningTime += minDt
            this.leftTime = this.gameEndTime - this.runningTime
            if (this.leftTime < 0) {
                minDt += this.leftTime
                this.leftTime = 0
                this.runningTime = this.gameEndTime
            }
            let fixDt = this.runningTime - this.fixedUpdateLastTime
            if (fixDt >= fixedInterval) {
                this.fixedUpdateLastTime += fixedInterval
                this.mapLogic.fixedUpdate(fixedInterval)
            }
            if (this.leftTime < 1) {
                this.onSendGameData()
            }
            this.mapLogic.update(minDt)
            this.cmdLogic.update(minDt)
            dt -= minDt
        }
    }

    getRunningTime(dt) {
        return this.runningTime
    }

    getFixedUpdateLastTime() {
        return this.fixedUpdateLastTime
    }

    getMapLogic() {
        return this.mapLogic
    }

    onKeyEvent(event) {
        if (!this.controllLogic ||
            this.state != gameState.playing ||
            this.leftTime < 1) {
            console.log('game pendding,drop user action')
            return
        }
        if (!this.controllLogic.onKeyEvent(event)) {
            event.preventDefault()
        }
    }

    getPlayerLogics() {
        return this.playerLogics
    }

    getPlayerLogic(playerID) {
        for (let i in this.playerLogics) {
            if (this.playerLogics[i].getID() == playerID) {
                return this.playerLogics[i]
            }
        }
    }

    getLocalPlayerLogic() {
        return this.localPlayerLogic
    }

    getGameEndTime() {
        return this.gameEndTime
    }

    getLeftTime() {
        return this.leftTime
    }

    onServerMessage(netManager, name, message) {
        switch (message.head) {
        case protocolRes.createMapGC:
            this.onCreateMap(message)
            break

        case protocolRes.frameDataGC:
            this.onGetFrameData(message)
            break

        case protocolRes.abnormalGC:
            this.onAbnormal(message)
            break

        case protocolRes.gameEndGC:
            this.onGameEnd(message)
            break

        default:
            break
        }
    }

    onServerDisconnect(netManager, name) {
        if (name == 'game') {
            if (this.state != gameState.ended) {
                this.state = gameState.ended
                eventDispatcher.emit(this, 'GameManager_disconnect')
            }
        }
    }

    onServerError(netManager, name) {

    }

    onCreateMap(message) {
        let data = message.data
        util.setSeed(data.seed)
        this.gameEndTime = data.gameEndTime
        this.keyFrameInterval = data.keyFrameInterval
        this.startTime = data.startTime
        this.cmdLogic = new CmdLogic(data.frames, data.keyFrameInterval)
        this.mapLogic = new MapLogic(
            data.mapInitSize,
            data.mapInitEntityCount
        )
        this.playerLogics = []
        this.runningTime = 0
        this.leftTime = this.gameEndTime
        this.scaleStartTime = null
        this.keyFrameInterval = data.keyFrameInterval
        this.fixedUpdateLastTime = 0
        this.gameTimer = scheduler.schedule(0, this.update.bind(this))
        this.state = gameState.initing
        // this.joinPlayer()

        // let updateCount = data.frames.length
        // for (let i = 0; i < updateCount; ++i) {
        //     this.update(data.keyFrameInterval)
        //     if (this.state == gameState.ended) {
        //         return
        //     }
        // }
        display.replaceRenderer(<GameRenderer manager={this} />)
    }

    joinPlayer() {
        let playerInfo = memCache.get('player_info')
        let cmd = this.cmdLogic.createCmd(actionRes.joinPlayer, {
            name: playerInfo.name,
            resID: this.selectedResID,
            playerID: playerInfo.id
        })
        this.postCmd(cmd)
    }

    onJoinPlayerCmd(cmd) {
        let data = cmd.data
        let name = data.name
        let resID = data.resID
        let playerID = data.playerID
        let playerLogic = new PlayerLogic(playerID, name, cmd.time)
        if (playerID == memCache.get('player_info').id) {
            this.localPlayerLogic = playerLogic
        }
        this.controllLogic = new ControllLogic()
        this.playerLogics.push(playerLogic)
        this.mapLogic.addEntity(resID, null, playerLogic, cmd.time)
    }

    onRemovePlayerCmd(playerID) {
        for (let i in this.playerLogics) {
            let playerLogic = this.playerLogics[i]
            if (playerLogic.getID() == playerID) {
                if (playerLogic == this.localPlayerLogic &&
                    this.state == gameState.playing) {
                    this.settlementGame()
                }
                let entityLogic = playerLogic.getEntityLogic()
                if (entityLogic) {
                    this.mapLogic.forceDieEntity(entityLogic)
                }
                this.playerLogics.splice(i, 1)
                return
            }
        }
    }

    handleUserAction(action, data) {
        if (this.localPlayerLogic && this.localPlayerLogic.getEntityLogic()) {
            let cmd = this.cmdLogic.createCmd(action, data)
            this.postCmd(cmd)
        }
    }

    postCmd(cmd) {
        if (this.offlineMode) {
            this.handleCmd(cmd)
        } else {
            netManager.send('game', {
                head: protocolRes.frameDataCG,
                cmd: cmd
            })
        }
    }

    onGetFrameData(message) {
        this.cmdLogic.pushBackFrameData(message.data)
    }

    handleCmd(cmd) {
        let action = cmd.action
        if (action == actionRes.joinPlayer) {
            this.onJoinPlayerCmd(cmd)
        } else if (action == actionRes.removePlayer) {
            this.onRemovePlayerCmd(cmd.data.playerID)
        } else {
            this.mapLogic.handleCmd(cmd)
        }
    }

    endGame() {
        console.log('game exit')
        this.state = gameState.ended
        netManager.disconnect('game')
        if (this.controllLogic) {
            this.controllLogic.destructor()
            delete this.controllLogic
        }
        this.cmdLogic.destructor()
        delete this.cmdLogic
        this.mapLogic.destructor()
        delete this.mapLogic
        for (let i in this.playerLogics) {
            this.playerLogics[i].destructor()
        }
        delete this.playerLogics
        if (this.gameTimer) {
            scheduler.unschedule(this.gameTimer)
            delete this.gameTimer
        }
    }

    onGameEnd(message) {
        this.state = gameState.ended
        eventDispatcher.emit(this, 'GameManager_end', message.data)
    }

    onSendGameData() {
        let data = {
            rankList: []
        }
        for (let playerLogic of this.playerLogics) {
            let entityLogic = playerLogic.getEntityLogic()
            data.rankList.push({
                id: playerLogic.getID(),
                playerName: playerLogic.getName(),
                eatenCount: entityLogic.getEatenCount(),
                weight: entityLogic.getRadius(),
                liveTime: entityLogic.getLiveTime(),
                position: entityLogic.getFixedPosition()
            })
        }
        netManager.send('game', {
            head: protocolRes.sendGameDataCG,
            data: data
        })
    }

    settlementGame() {
        let entityLogic = this.localPlayerLogic.getEntityLogic()
        let settlementData = {
            weight: entityLogic.getRadius(),
            liveTime: entityLogic.getLiveTime(),
            eatenCount: entityLogic.getEatenCount(),
            attackerName: entityLogic.getAttacker().getName()
        }
        eventDispatcher.emit(this, 'GameManager_settlement', settlementData)
        this.localPlayerLogic = null
    }

    backToHall() {
        this.endGame()
        worldManager.showWorld()
    }

    onAbnormal(message) {
        eventDispatcher.emit(this, 'GameManager_abnormal')
    }

}