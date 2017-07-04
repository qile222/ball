import Renderer from './renderer'
import React from 'react'
import mainStyle from './style_main'
import {util, eventDispatcher} from './global'
import iconFontRes from './res_icon_font'
import GameDialogSettingRenderer from './renderer_game_dialog_setting'
import SelectDialogRenderer from './renderer_dialog_select'
import lanRes from './res_lan.js'

const rankMaxCount = 10

export default class GameRankBoardRenderer extends Renderer {

    constructor(props) {
        super(props)
        this.state = {
            toggle: true,
            isShowSetting: false,
        }
        eventDispatcher.addListener(
            props.mapLogic,
            'map_rank_update',
            this,
            this.onEatEntity)
        eventDispatcher.addListener(
            null,
            'GameDialogSettingRenderer_close',
            this,
            this.onGameDialogSettingClose)
        eventDispatcher.addListener(
            null,
            'GameDialogSettingRenderer_save',
            this,
            this.onGameDialogSettingSave)
        eventDispatcher.addListener(
            null,
            'GameDialogSettingRenderer_exit_game',
            this,
            this.oneGameDialogSettingExitGame)
    }

    onEatEntity(entity) {
        this.setState({
            toggle: this.state.toggle
        })
    }

    render() {
        let rankList
        let toggleIconStyle
        if (this.state.toggle) {
            let playerLogics = this.props.manager.getPlayerLogics()
            let list = []
            let localPlayerRankList = []
            let toFixed = util.toFixed
            let playerCount = playerLogics.length
            let rankCount = playerCount
            if (rankCount > rankMaxCount) {
                rankCount = rankMaxCount
            }
            let localPlayerLogic = this.props.manager.getLocalPlayerLogic()
            let i = 0
            while (i < playerCount) {
                let playerLogic = playerLogics[i]
                let entityLogic = playerLogic.getEntityLogic()
                if (i < rankCount) {
                    list.push(<li>
                        <span>{i + 1}</span>
                        {playerLogic.getName()}
                        {toFixed(entityLogic.getRadius(), 1)}{lanRes.mg}
                    </li>)
                } else if (!localPlayerLogic || localPlayerRankList) {
                    break
                }
                if (playerLogic == localPlayerLogic) {
                    localPlayerRankList.push(React.cloneElement(list[i]))
                }
                ++i
            }
            rankList = [
                <ol>{list}</ol>,
                <ol>{localPlayerRankList}</ol>
            ]

            toggleIconStyle = {
                transform: 'rotate(0)'
            }

        } else {
            toggleIconStyle = {
                transform: 'rotate(180deg)'
            }
        }
        return <div className={mainStyle.gameRankBoard}>
            <h4 onClick={this.onClickFold.bind(this)}>
                <span>
                    {lanRes.userRank}
                    <svg
                        className={mainStyle.svgSprite}
                        style={toggleIconStyle}
                        aria-hidden="true">
                        <use xlinkHref="#icon-unfold"></use>
                    </svg>
                </span>
                <svg
                    className={mainStyle.svgSprite}
                    aria-hidden="true"
                    onClick={this.onClickSetting.bind(this)}>
                    <use xlinkHref="#icon-setup"></use>
                </svg>
            </h4>
            {rankList}
            {this.state.isShowSetting &&
            <GameDialogSettingRenderer {...this.props} />}
            {this.state.isShowExitDialog && <SelectDialogRenderer
                {...this.props}
                confirmCb={this.onClickExitDialogConfirm.bind(this)}
                cancelCb={this.onClickExitDialogCancel.bind(this)} >
                {lanRes.exitConfirm}
            </SelectDialogRenderer>
            }
        </div>
    }

    onClickFold(e) {
        e.stopPropagation()
        this.setState({
            toggle: !this.state.toggle
        })
    }

    onClickSetting(e) {
        e.stopPropagation()
        this.setState({ isShowSetting: true })
    }

    onGameDialogSettingClose(gameSettingDialog) {
        this.setState({ isShowSetting: false })
    }

    onGameDialogSettingSave(gameSettingDialog, options) {
        //TODO save
        this.setState({ isShowSetting: false })
    }

    oneGameDialogSettingExitGame() {
        this.setState({ isShowExitDialog: true })
    }

    onClickExitDialogConfirm() {
        this.setState({ isShowExitDialog: false })
    }

    onClickExitDialogCancel() {
        this.setState({ isShowExitDialog: false })
    }

}