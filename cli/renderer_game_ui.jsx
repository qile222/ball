import Renderer from './renderer'
import React from 'react'
import mainStyle from './style_main'
import GameRankboardRenderer from './renderer_game_rankboard'
import GameTimerRenderer from './renderer_game_timer'
import GameDialogSettlementRenderer from './renderer_game_dialog_settlement'
import GameDialogEndRenderer from './renderer_game_dialog_end'
import DialogNoticeRenderer from './renderer_dialog_notice'
import NoticeDialogRenderer from './renderer_dialog_notice'
import {util, eventDispatcher, gameManager} from './global'

export default class GameUIRenderer extends Renderer {

    constructor(props) {
        super(props)
        eventDispatcher.addListener(
            null,
            'GameDialogSettlementRenderer_continue_game',
            this,
            this.onGameSettlementDialogContinueGame)
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
            'GameManager_notice',
            this,
            this.onGameNotice
        )
        eventDispatcher.addListener(
            gameManager,
            'GameManager_disconnected',
            this,
            this.onGameDisonnect
        )
        this.state = {}
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true
    }

    componentWillUpdate(nextProps, nextState) {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    render() {
        let components
        if (this.state.endData) {
            components = [
                <GameDialogEndRenderer {...this.props}
                    endData={this.state.endData} />
            ]
        } else {
            components = [
                <GameTimerRenderer {...this.props} />,
                <GameRankboardRenderer {...this.props} />,
                this.state.settlementData && <GameDialogSettlementRenderer
                    {...this.props}
                    settlementData={this.state.settlementData} />
            ]
        }
        if (this.state.noticeStr) {
            components.push(
                <DialogNoticeRenderer
                    onClickClose={this.clickClose.bind(this)}>
                    {this.state.noticeStr}
                </DialogNoticeRenderer>
            )
        }

            // {this.state.exitHint && <NoticeDialogRenderer
            //     onConfirmClick={this.onClickExitGame.bind(this)}
            //     hint={this.state.exitHint}/>}
        return <div className={mainStyle.gameUI}>{components}</div>
    }

    onGameSettlementDialogContinueGame() {
        this.setState({ settlementData: undefined })
    }

    onGameSettlement(gameManager, settlementData) {
        this.setState({ settlementData: settlementData })
    }

    onGameEnd(gameManager, endData) {
        this.setState({ endData: endData })
    }

    onGameNotice(gameManager, str) {
        this.setState( {noticeStr: str} )
    }

}