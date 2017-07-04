import Renderer from './renderer'
import React from 'react'
import mainStyle from './style_main'
import GameRankboardRenderer from './renderer_game_rankboard'
import GameTimerRenderer from './renderer_game_timer'
import GameDialogSettlementRenderer from './renderer_game_dialog_settlement'
import {eventDispatcher} from './global'

export default class GameUIRenderer extends Renderer {

    constructor(props) {
        super(props)
        eventDispatcher.addListener(
            null,
            'GameDialogSettlementRenderer_continue_game',
            this,
            this.onGameSettlementDialogContinueGame)
        eventDispatcher.addListener(
            props.manager,
            'GameManager_settlement',
            this,
            this.onGameSettlement
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
        return <div className={mainStyle.gameUI}>
            <GameTimerRenderer {...this.props} />
            <GameRankboardRenderer {...this.props} />
            {this.state.isShowGameSettlement &&
            <GameDialogSettlementRenderer {...this.props} />}
        </div>
    }

    onGameSettlementDialogContinueGame() {
        this.setState({ isShowGameSettlement: false })
    }

    onGameSettlement(gameManager, localPlayerlogic) {
        this.setState({ isShowGameSettlement: true })
    }

}