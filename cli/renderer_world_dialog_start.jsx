import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import { worldManager } from './global'

export default class WorldStartDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            hideClose: true,
            title: lanRes.world,
            btns: [
                {
                    title: lanRes.backToLogin,
                    onClick: this.onClickExit.bind(this),
                    disable: false,
                    name: 'BackToLogin'
                },
                {
                    title: lanRes.enterChat,
                    onClick: this.onClickChat.bind(this),
                    disable: false,
                    name: 'EnterChat'
                },
                {
                    title: lanRes.startGame,
                    onClick: this.onClickStartGame.bind(this),
                    disable: false,
                    name: 'Enter'
                },
            ],
        }
    }
    componentWillReceiveProps(nextProps) {
        
    }


    renderContent() {

    }

    onClickStartGame() {
        this.prepareForClose(() => {
            worldManager.startGame()
        })
    }

    onClickExit() {
        this.prepareForClose(() => {
            worldManager.backToLogin()
        })
    }

    onClickChat() {
        this.props.onClickEnterChat()
    }

}