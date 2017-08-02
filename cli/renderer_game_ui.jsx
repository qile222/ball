import Renderer from './renderer'
import React from 'react'
import mainStyle from './style_main'
import GameRankboardRenderer from './renderer_game_rankboard'
import GameTimerRenderer from './renderer_game_timer'
import GameDialogSettlementRenderer from './renderer_game_dialog_settlement'
import GameDialogEndRenderer from './renderer_game_dialog_end'
import NoticeDialogRenderer from './renderer_dialog_notice'
import KeyboardRenderer from './renderer_keyboard'
import lanRes from './res_lan'
import { util, eventDispatcher, gameManager, device } from './global'

export default class GameUIRenderer extends Renderer {

    constructor(props) {
        super(props)
        eventDispatcher.addListener(
            gameManager,
            'GameManager_settlement',
            this,
            this.onGameSettlement
        )
        eventDispatcher.addListener(
            gameManager,
            'GameManager_end',
            this,
            this.onGameEnd
        )
        eventDispatcher.addListener(
            gameManager,
            'GameManager_disconnect',
            this,
            this.onGameDisonnected
        )
        eventDispatcher.addListener(
            gameManager,
            'GameManager_abnormal',
            this,
            this.onGameAbnormal
        )
        this.state = {}
        this.keyEventHandler = gameManager.onKeyEvent.bind(gameManager)
        document.addEventListener('keydown', this.keyEventHandler)
        document.addEventListener('keyup', this.keyEventHandler)
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        document.removeEventListener('keydown', this.keyEventHandler)
        document.removeEventListener('keyup', this.keyEventHandler)
    }

    render() {
        let stateComponents
        if (this.state.endData) {
            stateComponents = <GameDialogEndRenderer
                {...this.props}
                endData={this.state.endData} />
        } else if (this.state.settlementData) {
            stateComponents = <GameDialogSettlementRenderer
                {...this.props}
                onClickContinue={this.onClickGameContinue.bind(this)}
                settlementData={this.state.settlementData} />
        } else {
            stateComponents = <div>
                {device.platform == 'mobile' && <KeyboardRenderer />}
                <GameTimerRenderer {...this.props} />
                <GameRankboardRenderer {...this.props} />
            </div>
        }

        return <div className={mainStyle.gameUI}>
            {stateComponents}
            {this.state.abnormalHint && <NoticeDialogRenderer
                onClickClose={this.clickExitGame.bind(this)}>
                {this.state.abnormalHint}
            </NoticeDialogRenderer>}

            {this.state.exitHint && <NoticeDialogRenderer
                onClickClose={this.clickExitGame.bind(this)}>
                {this.state.exitHint}
            </NoticeDialogRenderer>}

        </div>
    }

    onClickGameContinue() {
        this.setState({ settlementData: undefined })
        gameManager.joinPlayer()
    }

    onGameSettlement(gameManager, settlementData) {
        this.setState({ settlementData: settlementData })
    }

    onGameEnd(gameManager, endData) {
        this.setState({ endData: endData })
    }

    onGameNotice(gameManager, str) {
        this.setState({ noticeStr: str })
    }

    onGameDisonnected() {
        this.setState({
            exitHint: util.format(lanRes.serverDisconnect, lanRes.game)
        })
    }

    onGameAbnormal() {
        this.setState({ abnormalHint: util.format(lanRes.gameAbnormal) })
    }

    clickExitGame() {
        gameManager.backToHall()
    }

}