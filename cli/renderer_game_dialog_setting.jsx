import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import {eventDispatcher} from './global'

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
                    title: lanRes.exitGame,
                    onClick: this.onClickExitGame.bind(this),
                    name: 'Exit'
                }
            ],
            isShowSelectDialog: false
        }
    }

    renderContent() {
        return <span>nothing to set</span>
    }

    onClickSave() {
        eventDispatcher.emit(this, 'GameDialogSettingRenderer_save')
    }

    onClickExitGame() {
        eventDispatcher.emit(this, 'GameDialogSettingRenderer_exit_game')
    }

}