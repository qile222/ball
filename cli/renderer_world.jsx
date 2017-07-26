import Renderer from './renderer'
import React from 'react'
import WorldStartDialogRenderer from './renderer_world_dialog_start'
import NoticeDialogRenderer from './renderer_dialog_notice'
import mainStyle from './style_main'
import { worldManager, util, eventDispatcher } from './global'
import WorldChatDialogRenderer from './renderer_world_chat'
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
        eventDispatcher.addListener(
            worldManager,
            'WorldManager_showGuide',
            this,
            this.onWorldShowGuide
        )
        this.state = {}
    }

    render() {
        return <div className={mainStyle.scene}>
            <WorldStartDialogRenderer
                onClickEnterChat={this.onClickEnterChat.bind(this)} />
            {this.state.isShowChat && <WorldChatDialogRenderer
                onClickClose={this.onClickChatClose.bind(this)} />}
            {this.state.exitHint && <NoticeDialogRenderer
                onClickClose={this.onExitWorld.bind(this)}>
                {this.state.exitHint}
            </NoticeDialogRenderer>}
            {this.state.isShowGuide && <NoticeDialogRenderer
                onClickClose={this.onGuideFinish.bind(this)}>
                <div
                    className={mainStyle.guide}
                    dangerouslySetInnerHTML={{
                        __html: util.format(
                            lanRes.guideContent,
                            `
                            <kbd>
                                <svg
                                    aria-hidden="true">
                                    <use xlink:href="#icon-return"></use>
                                </svg>
                            </kbd>
                            <kbd>
                                <svg
                                    aria-hidden="true">
                                    <use xlink:href="#icon-packup"></use>
                                </svg>
                            </kbd>
                            <kbd>
                                <svg
                                    aria-hidden="true">
                                    <use xlink:href="#icon-enter"></use>
                                </svg>
                            </kbd>
                            <kbd>
                                <svg
                                    aria-hidden="true">
                                    <use xlink:href="#icon-unfold"></use>
                                </svg>
                            </kbd>
                            `
                        )
                    }}>
                    
                </div>
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

    onClickEnterChat() {
        this.setState({ isShowChat: true })
    }

    onClickChatClose() {
        this.setState({ isShowChat: false })
    }

    onWorldShowGuide() {
        this.setState({ isShowGuide: true })
    }

    onGuideFinish() {
        worldManager.startGame()
    }

}