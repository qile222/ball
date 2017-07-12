import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import mainStyle from './style_main'
import commonRes from './res_common'
import {worldManager} from './global'

export default class WorldChatDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            hideClose: false,
            title: lanRes.enterGame,
            btns: [
                {
                    title: lanRes.send,
                    onClick: this.onClickSend.bind(this),
                    disable: true,
                    name: 'Send'
                },
            ],
        }
    }

    renderContent() {

    }

}