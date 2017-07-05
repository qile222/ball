import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import SwitchWidgetRenderer from './renderer_widget_switch'
import mainStyle from './style_main'
import {util} from './global'

export default class GameEndDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            hideClose: true,
            title: lanRes.gameEnd,
            btns: [
                {
                    title: lanRes.backToHall,
                    onClick: this.onClickBackToHall.bind(this),
                    name: 'BackToHall'
                },
            ],
        }
    }

    renderContent() {
        return <div>
            <SwitchWidgetRenderer
                cacheContent={true}
                contentAtIdx={this.contentAtIdx.bind(this)}
                titles={[lanRes.weightRank, lanRes.eatenRank]} />
        </div>
    }

    contentAtIdx(idx) {
        let endData = this.props.manager.getGameEndData()
        let rankList = endData.rankList
        let sortFunc
        if (idx == 0) {
            sortFunc = (p1, p2) => {
                return p1.weight > p2.weight
            }
        } else if (idx == 1) {
            sortFunc = (p1, p2) => {
                return p1.eatenCount > p2.eatenCount
            }
        }
        util.mergeSort(rankList, sortFunc)
        let content = []
        for (let i in rankList) {
            content.push(
                <div>
                    <span>{i * 1 + 1}</span>
                    <span>{rankList[i].playerName}</span>
                    <span>{rankList[i].weight}</span>
                    <span>{rankList[i].eatenCount}</span>
                </div>
            )
        }
        return <div className={mainStyle.gameEndDialog}>
            <div>
                <span>{lanRes.rank}</span>
                <span>{lanRes.playerName}</span>
                <span>{lanRes.finalWeight}</span>
                <span>{lanRes.eatenCount}</span>
            </div>
            {content}
        </div>
    }

    onClickBackToHall() {
        this.props.manager.backToHall()
    }

}