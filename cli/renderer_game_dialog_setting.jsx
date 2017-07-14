import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import {gameManager} from './global'

export default class GameDialogSettingRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            title: lanRes.gameSetting,
            btns: [
                {
                    title: lanRes.save,
                    onClick: this.onClickSave.bind(this),
                    name: 'Save'
                },
                {
                    title: lanRes.close,
                    onClick: this.onClickClose.bind(this),
                    name: 'Close'
                },
                {
                    title: lanRes.backToHall,
                    onClick: this.onClickBackToHall.bind(this),
                    name: 'BackToHall'
                }
            ],
            isShowSelectDialog: false
        }
    }

    renderContent() {
        return <span>nothing to set</span>
    }

    onClickSave() {
        this.onClickClose()
    }

    onClickBackToHall() {
        gameManager.backToHall()
    }

}