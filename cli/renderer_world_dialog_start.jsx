import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import { worldManager } from './global'

export default class WorldStartDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            hideClose: true,
            title: lanRes.enterChat,
            btns: [
                {
                    title: lanRes.backToLogin,
                    onClick: this.onClickExit.bind(this),
                    disable: false,
                    name: 'BackToLogin'
                },
                {
                    title: lanRes.enterChat,
                    onClick: props.onClickEnterChat,
                    disable: false,
                    name: 'EnterChat'
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
    componentWillReceiveProps(nextProps) {
        console.log(nextProps == this.props)
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