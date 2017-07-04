import Manager from './manager'
import protocolRes from './res_protocol'
import {netManager, gameManager, eventDispatcher} from './global'

export default class WorldManager extends Manager {

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
    }

    enter(addr, port, playerName) {
        netManager.connect(
            'world',
            addr + ':' + port,
            'playerName=' + playerName
        )
    }

    onServerMessage(netManager, name, message) {
        switch (message.head) {
        case protocolRes.playerInfoWC:
            this.onEnterWorld(message)
            break

        case protocolRes.getGameServerWC:
            this.onGetGameServer(message)
            break

        default:
            break
        }
    }

    onServerError(netManager, name) {

    }

    onEnterWorld(message) {
        // let data = message.data
        // memCache.set('player_info', {
        //     id: data.playerID,
        //     name: data.playerName
        // })
        // memCache.set('time', data.serverTime)
        // netManager.send('world', {
        //     head: protocolRes.getGameServerCW
        // })
    }

    onGetGameServer(message) {
        let server = message.data.server
        let port = message.data.port
        let token = message.data.token
        let resID = 10000
        gameManager.start(server, port, token, resID)
    }

}