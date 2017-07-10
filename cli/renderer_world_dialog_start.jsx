import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import mainStyle from './style_main'
import commonRes from './res_common'
import {worldManager} from './global'

export default class WorldStartDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            hideClose: true,
            title: lanRes.enterGame,
            btns: [
                {
                    title: lanRes.backToLogin,
                    onClick: this.onClickExit.bind(this),
                    disable: false,
                    name: 'BackToLogin'
                },
                {
                    title: lanRes.enter,
                    onClick: this.onClickEnter.bind(this),
                    disable: false,
                    name: 'Enter'
                },
            ],
        }
    }

    renderContent() {

    }

    onClickEnter() {
        worldManager.startGame()
    }

    onClickExit() {
        worldManager.backToLogin()
    }

}