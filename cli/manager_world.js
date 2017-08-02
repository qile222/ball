import Manager from './manager'
import protocolRes from './res_protocol'
import {netManager, gameManager, eventDispatcher,
    memCache, scheduler, display, loginManager, cache} from './global'
import WorldRenderer from './renderer_world'
import React from 'react'

export default class WorldManager extends Manager {

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

    update(dt) {
        let time = memCache.get('time')
        memCache.set('time', time + dt)
    }

    enter(addr, port, playerName) {
        display.showLoading(true)
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

        case protocolRes.newMessageLC:
            this.onGetNewMessage(message)
            break

        default:
            break
        }
    }

    onServerDisconnect(netManager, name) {
        if (name == 'world') {
            if (memCache.get('player_info')) {
                eventDispatcher.emit(this, 'WorldManager_disconnect')
            } else {
                this.backToLogin()
            }
        }
    }

    onServerError(netManager, name, message) {

    }

    onEnterWorld(message) {
        display.showLoading(false)
        let data = message.data
        memCache.set('player_info', {
            id: data.playerID,
            name: data.playerName
        })
        memCache.set('time', data.serverTime)
        scheduler.schedule(1000, this.update.bind(this))
        let cachedMessages = cache.get('chat_messages')
        this.chatMessages =
            cachedMessages instanceof Array ? cachedMessages : []
        netManager.connect(
            'chat', data.chatServer.addr + ':' + data.chatServer.port
        )
        this.showWorld()
    }

    showWorld() {
        display.replaceRenderer(<WorldRenderer manager={this} />)
    }

    startGame() {
        if (cache.get('isFinishGuide')) {
            netManager.send('world', {head: protocolRes.getGameServerCW})
        } else {
            cache.set('isFinishGuide', true)
            eventDispatcher.emit(this, 'WorldManager_showGuide')
        }
    }

    onGetGameServer(message) {
        let addr = message.data.addr
        let port = message.data.port
        let token = message.data.token
        let resID = 10000
        gameManager.enter(addr, port, token, resID)
    }

    backToLogin() {
        memCache.clear()
        if (!netManager.disconnect('world')) {
            netManager.disconnect('chat')
            loginManager.enter()
        }
    }

    sendMessage(content) {
        let playerInfo = memCache.get('player_info')
        netManager.send('chat', {
            head: protocolRes.newMessageCL,
            content: content,
            playerName: playerInfo.name,
            playerID: playerInfo.id
        })
    }

    onGetNewMessage(message) {
        this.chatMessages.push(message.data)
        cache.set('chat_messages', this.chatMessages)
        eventDispatcher.emit(this, 'WorldManager_newMessage', message.data)
    }

    clearMessagesCache() {
        this.chatMessages = []
        cache.set('chat_messages', this.chatMessages)
    }

}