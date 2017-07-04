import React from 'react'
import Manager from './manager'
import commonRes from './res_common'
import {util, cache, display, worldManager, eventDispatcher} from './global'
import LoginRenderer from './renderer_login'

export default class LoginManager extends Manager {

    constructor() {
        super()
        this.serverList = []
    }

    enter() {
        util.request(
            commonRes.agent,
            'POST',
            null,
            null,
            this.onGetWorldServer.bind(this)
        )
        display.replaceRenderer(
            <LoginRenderer
                manager={this}
                playerName={cache.get('player_name')}/>
        )
    }

    onGetWorldServer(isSucceed, message) {
        if (isSucceed) {
            this.serverList = message.data.serverList
            eventDispatcher.emit(this, 'LoginManager_getWorldServerList')
        }
    }

    getWorldServerList() {
        return this.serverList
    }

    enterWorld(playerName, serverIdx) {
        cache.set('player_name', playerName)
        let server = this.serverList[serverIdx * 1]
        worldManager.enter(server.addr, server.port, playerName)
    }

}