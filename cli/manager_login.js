import React from 'react'
import Manager from './manager'
import commonRes from './res_common'
import {util, cache, display, worldManager,
    eventDispatcher, scheduler} from './global'
import LoginRenderer from './renderer_login'

export default class LoginManager extends Manager {

    constructor() {
        super()
        this.serverList = []
    }

    requestWorldAddr() {
        util.request(
            {
                url: commonRes.agent,
                method: 'POST',
                cb: this.onGetWorldServer.bind(this)
            }
        )
    }

    enter() {
        this.requestWorldAddr()
        display.replaceRenderer(
            <LoginRenderer
                manager={this}
                playerName={cache.get('player_name')}/>
        )
    }

    onGetWorldServer(isSucceed, message) {
        if (isSucceed && message) {
            this.serverList = message.data.serverList
            eventDispatcher.emit(this, 'LoginManager_getWorldServerList')
        } else {
            scheduler.scheduleOnce(3000, this.requestWorldAddr.bind(this))
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