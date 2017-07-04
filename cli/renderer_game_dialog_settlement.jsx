import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import mainStyle from './style_main'
import {util, scheduler, eventDispatcher} from './global'

export default class GameDialogSettlementRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            btns: [
                {
                    title: lanRes.continue,
                    onClick: this.onClickContinue.bind(this),
                    name: 'Continue'
                },
                {
                    title: lanRes.exitGame,
                    onClick: this.onClickExitGame.bind(this),
                    name: 'ExitGame'
                }
            ]
        }
        this.gameTimer = scheduler.schedule(1000, this.update.bind(this))
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        scheduler.unschedule(this.gameTimer)
    }

    update() {
        this.forceUpdate()
    }

    renderContent() {
        let settlementData = this.props.manager.getSettlementData()
        return <div className={mainStyle.gameSettlementDialog}>
            <h1
                dangerouslySetInnerHTML={
                    {
                        __html: util.format(
                            lanRes.eatenBy,
                            '<span>' + settlementData.attackerName + '</span>'
                        )
                    }
                }>

            </h1>
            <div>
                <div>
                    <span>{lanRes.finalWeight}</span>
                    <span>
                        {util.toFixed(settlementData.weight, 1) + lanRes.mg}
                    </span>
                </div>
                <div>
                    <span>{lanRes.eatenCount}</span>
                    <span>{settlementData.eatenCount}</span>
                </div>
                <div>
                    <span>{lanRes.liveTime}</span>
                    <span>{util.timeFormatMMSS(settlementData.liveTime)}</span>
                </div>
            </div>
            <div>
                <span>{lanRes.leftTime}</span>
                <span>
                    {util.timeFormatMMSS(this.props.manager.getLeftTime())}
                </span>
            </div>
        </div>
    }

    onClickContinue() {
        this.props.manager.joinPlayer()
        eventDispatcher.emit(this, 'GameDialogSettlementRenderer_continue_game')
    }

    onClickExitGame() {
        this.props.manager.backToHall()
    }

}