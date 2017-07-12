import Renderer from './renderer'
import React from 'react'
import mainStyle from './style_main'
import GameRankboardRenderer from './renderer_game_rankboard'
import GameTimerRenderer from './renderer_game_timer'
import GameDialogSettlementRenderer from './renderer_game_dialog_settlement'
import GameDialogEndRenderer from './renderer_game_dialog_end'
import NoticeDialogRenderer from './renderer_dialog_notice'
import lanRes from './res_lan'
import { util, eventDispatcher, gameManager } from './global'

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
        } else if (this.state.settlementData) {
            components = [
                <GameDialogSettlementRenderer
                    onClickContinue={this.onClickGameContinue.bind(this)}
                    {...this.props}
                    settlementData={this.state.settlementData} />
            ]
        } else {
            components = [
                <GameTimerRenderer {...this.props} />,
                <GameRankboardRenderer {...this.props} />,
            ]
        }
        if (this.state.exitHint) {
            components.push(
                <NoticeDialogRenderer
                    onClickClose={this.clickExitGame.bind(this)}>
                    {this.state.exitHint}
                </NoticeDialogRenderer>
            )
        }
        if (this.state.abnormalHint) {
            components.push(
                <NoticeDialogRenderer
                    onClickClose={this.clickExitGame.bind(this)}>
                    {this.state.abnormalHint}
                </NoticeDialogRenderer>
            )
        }

        return <div className={mainStyle.gameUI}>{components}</div>
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