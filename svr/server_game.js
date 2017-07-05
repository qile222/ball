const cache = require('memory-cache')
const assert = require('assert')
const shortid = require('shortid')
const Server = require('./server')
const Message = require('./message')
const protocol = require('./res_protocol')
const commonRes = require('./res_common')
const RoomLogic = require('./logic_room')
const logger = require('./logger')
const Util = require('./util')
const actionRes = require('./res_action')

const playerState = commonRes.playerState
const gameState = commonRes.gameState
const gameOverTime = commonRes.gameOverTime
const gameEndTime = commonRes.gameEndTime
const mapDefaultSize = commonRes.mapDefaultSize
const keyFrameInterval = commonRes.keyFrameInterval
const mapInitEntityCount = commonRes.mapRandomEntityLimit

class GameServer extends Server {

    constructor(id) {
        super(id)
    }

    start(port) {
        super.start(port)
        this.socket.use(this.authorization.bind(this))
        this.usingNsp = this.socket.nsps['/']
        this.rooms = this.usingNsp.adapter.rooms
        this.clients = this.usingNsp.sockets
        this.timer = setInterval(this.update.bind(this), 0)
    }

    handleRequest(cliSocket, message) {
        switch (message.head) {

            case protocol.frameDataCG:
                this.handleFrameData(cliSocket, message)
                break

            case protocol.sendGameDataCG:
                this.handleGameEndData(cliSocket, message)
                break

            default:
                super.handleRequest(cliSocket, message)
                break
        }
    }

    onConnection(cliSocket) {
        super.onConnection(cliSocket)
        this.addPlayer(cliSocket)
    }

    onDisconnecting(cliSocket) {
        super.onDisconnecting(cliSocket)
        this.removePlayer(cliSocket)
    }

    authorization(cliSocket, next) {
        let query = cliSocket.handshake.query
        let token = cache.get('tokens')[query.token]
        if (!token) {
            next(new Error(`unexist token ${JSON.stringify(query)}`))
        } else if (token.getEx().gameServerID != this.id) {
            next(new Error(`invalid server token ${JSON.stringify(query)}`))
        } else {
            next(null, true)
        }
    }

    addPlayer(cliSocket) {
        let tokenID = cliSocket.handshake.query.token
        let tokens = cache.get('tokens')
        let players = cache.get('players')
        let player = players[tokens[tokenID].getPlayerID()]
        delete tokens[tokenID]
        //leave default room
        cliSocket.logic = player
        cliSocket.leave(cliSocket.id)
        let rooms = this.rooms
        let roomID
        for (let i in rooms) {
            if (rooms[i].length < commonRes.roomEntityLimit) {
                let logic = rooms[i].logic
                if (logic.getState() == gameState.playing) {
                    roomID = i
                    break
                }
            }
        }
        if (!roomID) {
            roomID = shortid.generate()
            cliSocket.join(roomID)
            rooms[roomID].logic = new RoomLogic(this, roomID)
            rooms[roomID].id = roomID
        } else {
            cliSocket.join(roomID)
        }
        let roomLogic = rooms[roomID].logic

        cliSocket.send(new Message(protocol.createMapGC, null, {
            keyFrameInterval: keyFrameInterval,
            mapInitSize: mapDefaultSize,
            mapInitEntityCount: mapInitEntityCount,
            frames: roomLogic.getFrameData(0),
            seed: roomLogic.getSeed(),
            startTime: roomLogic.getStartTime(),
            gameEndTime: gameEndTime,
            gameOverTime: gameOverTime
        }))
        player.setState(playerState.gaming)
        player.setGamingRoom(roomID)
    }

    removePlayer(cliSocket) {
        logger.info(`remove player ${cliSocket.id}`)
        cliSocket.logic.setState(playerState.online)
        let room = this.getPlayerRoom(cliSocket)
        if (room) {
            if (room.length > 1) {
                let playerID = cliSocket.logic.getID()
                room.logic.handleCmd(playerID, {
                    action: actionRes.removePlayer,
                    data: {
                        playerID: playerID,
                    }
                })
            } else {
                room.logic.end()
                // room.logic = null
                logger.info(`remove room ${room.id}`)
            }
        } else {
            logger.info('player room removed')
        }
    }

    handleFrameData(cliSocket, message) {
        let cmd = message.cmd
        let room = this.getPlayerRoom(cliSocket)
        if (room) {
            room.logic.handleCmd(cliSocket.logic.getID(), cmd)
        } else {
            logger.error(`invalid cmd room id ${JSON.stringify(message)}`)
        }
    }

    update() {
        for (let i in this.rooms) {
            let room = this.rooms[i]
            let state = room.logic.getState()
            if (state == gameState.playing) {
                if (room.logic.getDuration() >= gameEndTime) {
                    this.willEnd(room)
                } else {
                    this.boardcastKeyFrame(room)
                }
            } else if (state == gameState.ending) {
                if (room.logic.getDuration() >= gameOverTime) {
                    this.forceEndGame(room)
                }
            }
        }
    }

    willEnd(room) {
        room.logic.willEnd()
        this.socket.in(room.id).send(new Message(protocol.sendGameDataGC, null))
    }

    forceEndGame(room) {
        let endData = room.logic.getGameEndData()
        room.logic.end()
        if (endData) {
            this.socket.in(room.id).send(new Message(protocol.gameEndGC, null, endData))
        } else {
            this.socket.in(room.id).send(new Message(protocol.abnormalGC, null))
        }
        for (let i in room.sockets) {
            this.clients[i].disconnect(true)
        }
    }

    handleGameEndData(cliSocket, message) {
        let room = this.getPlayerRoom(cliSocket)
        room.logic.handleGameEndData(message.data)
        this.forceEndGame(room)
    }

    boardcastKeyFrame(room) {
        let frameData = room.logic.getKeyFrameData()
        if (frameData) {
            this.socket.in(room.id).send(new Message(protocol.frameDataGC, null, frameData))
        }
    }

    getPlayerRoom(cliSocket) {
        let rooms = cliSocket.adapter.rooms
        return rooms[Object.getOwnPropertyNames(rooms)[0]]
    }
}

module.exports = GameServer