import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import mainStyle from './style_main'
import {worldManager, eventDispatcher} from './global'

export default class WorldChatDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            hideClose: false,
            title: lanRes.chat,
            btns: [
                {
                    title: lanRes.send,
                    onClick: this.onClickSend.bind(this),
                    disable: true,
                    name: 'Send'
                },
            ],
        }
        eventDispatcher.addListener(
            worldManager,
            'WorldManager_newMessage',
            this,
            this.onGetNewMessage
        )

    }

    onClickSend() {
        worldManager.sendMessage(this.inputBox.innerText)
    }

    renderContent() {
        return <div>
            <div className={mainStyle.messageBox}></div>
            <div className={mainStyle.emotionPanel}></div>
            <textarea
                className={mainStyle.inputBox}
                ref={(ref) => this.inputBox = ref}
                onInput={this.onInputText.bind(this)}>

            </textarea>
        </div>
    }

    componentWillUpdate(nextProps, nextState) {
        nextState.btns[0].disable = this.inputBox.innerText.length < 1
    }

    onInputText() {
        this.setState({})
    }

    onGetNewMessage(worldManager, message) {
        
    }

}