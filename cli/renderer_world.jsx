import Renderer from './renderer'
import React from 'react'
import WorldStartDialogRenderer from './renderer_world_dialog_start'
import NoticeDialogRenderer from './renderer_dialog_notice'
import mainStyle from './style_main'
import {worldManager, util, eventDispatcher} from './global'
import lanRes from './res_lan'

export default class WolrdRenderer extends Renderer {

    constructor(props) {
        super(props)
        eventDispatcher.addListener(
            worldManager,
            'WorldManager_disconnect',
            this,
            this.onWorldDisconnected
        )
        this.state ={}
    }

    render() {
        return <div className={mainStyle.scene}>
            <WorldStartDialogRenderer {...this.props}/>
            {this.state.exitHint &&
            <NoticeDialogRenderer
                onClickClose={this.onExitWorld.bind(this)}>
                {this.state.exitHint}
            </NoticeDialogRenderer>}
        </div>
    }

    onWorldDisconnected(worldManager) {
        this.setState({
            exitHint: util.format(lanRes.serverDisconnect, lanRes.game)
        })
    }

    onExitWorld() {
        worldManager.backToLogin()
    }

}