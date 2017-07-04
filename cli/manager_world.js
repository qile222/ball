import Manager from './manager'
import protocolRes from './res_protocol'
import {netManager, gameManager, eventDispatcher,
    memCache, scheduler, display} from './global'
import WorldRenderer from './renderer_world'
import React from 'react'

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

    update(dt) {
        let time = memCache.get('time')
        memCache.set('time', time + dt)
    }

    enter(addr, port, playerName) {
        netManager.connect(
            'world', addr + ':' + port, 'playerName=' + playerName
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
        let data = message.data
        memCache.set('player_info', {
            id: data.playerID,
            name: data.playerName
        })
        memCache.set('time', data.serverTime)
        scheduler.schedule(1000, this.update.bind(this))
        this.showWorld()
    }

    showWorld() {
        display.replaceRenderer(<WorldRenderer manager={this} />)
    }

    startGame() {
        netManager.send('world', {
            head: protocolRes.getGameServerCW
        })
    }

    onGetGameServer(message) {
        let addr = message.data.addr
        let port = message.data.port
        let token = message.data.token
        let resID = 10000
        gameManager.enter(addr, port, token, resID)
    }

}