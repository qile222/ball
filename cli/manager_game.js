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
const gameState = commonRes.gameState
const min = Math.min

export default class GameManager extends Manager {

    constructor() {
        super()
        eventDispatcher.addListener(
            netManager,
            'net_message',
            this,
            this.onServerMessage
        )
        eventDispatcher.addListener(
            netManager,
            'net_error',
            this,
            this.onServerError
        )
        eventDispatcher.addListener(
            netManager,
            'net_disconnect',
            this,
            this.onServerDisconnect
        )
    }

    enter(addr, port, token, resID) {
        this.offlineMode = false
        this.selectedResID = resID
        this.state = gameState.pendding
        netManager.connect('game', addr + ':' + port, 'token=' + token)
    }

    startInOfflineMode() {
        this.offlineMode = true
        this.state = gameState.playing
        this.onCreateMap({
            mapInitInfo: {
                size: {
                    width: 100,
                    height: 100
                },
                entities: []
            },
            frames: [],
            seed: util.time(),
            startTime: util.time()
        })
    }

    update(dt) {
        if (this.leftTime < 1) {
            return
        }
        while (dt > 0) {
            let frameDelta = this.cmdLogic.getKeyFrameDelta()
            if (frameDelta < 1) {
                if (this.state == gameState.pendding) {
                    console.log(
                        'end pendding',
                        util.time() - this.scaleStartTime,
                        'ms'
                    )
                    this.state = gameState.playing
                    scheduler.setTimeScale(1)
                }
                return
            } else if (frameDelta > 10000) {
                console.log('delta too much, will exit', frameDelta)
                this.endGame()
                return
            } else if (frameDelta > 2) {
                if (this.state == gameState.playing) {
                    this.state = gameState.pendding
                    scheduler.setTimeScale(fastForwardTimeScale)
                    console.log(
                        'start fast forwarding, delta count',
                        frameDelta
                    )
                    this.scaleStartTime = util.time()
                }
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
                console.log(minDt, this.runningTime)
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

    getCmdLogic() {
        return this.cmdLogic
    }

    getControllLogic() {
        return this.controllLogic
    }

    onKeyEvent(event) {
        if (this.state != gameState.playing) {
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
        if (name == 'game') {
            switch (message.head) {
            case protocolRes.createMapGC:
                this.onCreateMap(message)
                break

            case protocolRes.frameDataGC:
                this.onGetFrameData(message)
                break

            // case protocolRes.sendGameDataGC:
            //     this.onSendGameData(message)
            //     break

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
    }

    onServerDisconnect(netManager, name) {
        if (name == 'game') {
            this.endGame()
        }
    }

    onServerError(netManager, name) {
        if (name == 'game') {
            this.endGame()
        }
    }

    onCreateMap(message) {
        let data = message.data
        util.setSeed(data.seed)
        this.controllLogic = new ControllLogic(this)
        this.gameEndTime = data.gameEndTime
        this.keyFrameInterval = data.keyFrameInterval
        this.startTime = data.startTime
        this.cmdLogic = new CmdLogic(this, data.frames, data.keyFrameInterval)
        this.mapLogic = new MapLogic(
            this,
            data.mapInitSize,
            data.mapInitEntityCount
        )
        this.playerLogics = []
        this.runningTime = 0
        this.leftTime = this.gameEndTime
        this.scaleStartTime = util.time()
        this.keyFrameInterval = data.keyFrameInterval
        this.fixedUpdateLastTime = 0
        this.gameTimer = scheduler.schedule(0, this.update.bind(this))

        let updateCount = data.frames.length
        for (let i = 0; i < updateCount; ++i) {
            this.update(data.keyFrameInterval)
            if (this.state == gameState.ended) {
                return
            }
        }
        this.joinPlayer()

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
        let playerLogic = new PlayerLogic(this, playerID, name, cmd.time)
        if (playerID == memCache.get('player_info').id) {
            this.localPlayerLogic = playerLogic
        }
        this.playerLogics.push(playerLogic)
        this.mapLogic.addEntity(resID, null, playerLogic, cmd.time)
    }

    onRemovePlayerCmd(playerID) {
        for (let i in this.playerLogics) {
            let playerLogic = this.playerLogics[i]
            if (playerLogic.getID() == playerID) {
                if (playerLogic == this.localPlayerLogic) {
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
        if (this.state == gameState.ended) {
            return
        }
        console.log('game exit')
        this.state = gameState.ended
        netManager.disconnect('game')
        this.controllLogic.destructor()
        delete this.controllLogic
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
        this.endGame()
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
        eventDispatcher.emit(
            this,
            'GameManager_settlement',
            settlementData
        )
        this.localPlayerLogic = null
    }

    backToHall() {
        this.endGame()
        worldManager.showWorld()
    }

    onAbnormal(message) {
        this.endGame()
    }

}