const cache = require('memory-cache')
const Server = require('./server')
const PlayerLogic = require('./logic_player')
const commonRes = require('./res_common')
const protocolRes = require('./res_protocol')
const Message = require('./message')
const logger = require('./logger')
const deploy = require('./deploy')
const Util = require('./util')
const errorCodeRes = require('./res_error_code')
const shortid = require('shortid')

class WorldServer extends Server {

    constructor(id) {
        super(id)
    }

    start(port) {
        super.start(port)
        this.socket.use(this.authorization.bind(this))
    }

    handleRequest(cliSocket, message) {
        switch (message.head) {
            case protocolRes.getGameServerCW:
                this.handleGetGameServer(cliSocket, message)
                break

            default:
                super.handleRequest(cliSocket, message)
        }
    }

    onConnection(cliSocket) {
        super.onConnection(cliSocket)
        let chatServer = cache.get('chatServer')
        let playerName = cliSocket.handshake.query.playerName
        let playerLogic = new PlayerLogic(cliSocket.id, playerName)
        cache.get('players')[cliSocket.id] = playerLogic
        let data = {
            playerID: cliSocket.id,
            playerName: playerLogic.getName(),
            serverTime: Util.time(),
            chatServer: {
                addr: chatServer.addr,
                port: chatServer.port,
            }
        }
        cliSocket.send(new Message(protocolRes.playerInfoWC, null, data))
    }

    onDisconnecting(cliSocket) {
        super.onDisconnecting(cliSocket)
        // delete cache.get('players')[cliSocket.id]
    }

    authorization(cliSocket, next) {
        let query = cliSocket.handshake.query
        if (query.playerName) {
            if (/^[a-zA-Z0-9]{1,8}$/.test(query.playerName)) {
                next(null)
                return
            }
        }
        next({data: new Message(protocolRes.error, errorCodeRes.invalidPlayerName)})
        process.nextTick(()=> { cliSocket.disconnect(true) })
    }

    handleGetGameServer(cliSocket, message) {
        let player = cache.get('players')[cliSocket.id]
        if (player.getState() != commonRes.playerState.online) {
            this.handleErrorLogic(cliSocket, message, errorCodeRes.invalidState)
            return
        }
        let reqData = {
            playerID: cliSocket.id
        }
        Util.postServer(deploy.gameAgent, '/getServer', reqData, (error, gameData) => {
            if (error) {
                logger.error(`req game agent error ${JSON.stringify(error)}`)
                this.handleErrorLogic(cliSocket, message, errorCodeRes.agentError)
            } else {
                if (gameData.code != null) {
                    logger.error(`game server error ${JSON.stringify(gameData)}`)
                    this.handleErrorLogic(cliSocket, message, errorCodeRes.agentError)
                } else {
                    cliSocket.send(new Message(protocolRes.getGameServerWC, null, gameData.data))
                }
            }
        })
    }

}

module.exports = WorldServer