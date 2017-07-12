import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import mainStyle from './style_main'

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
    }

    onClickSend() {

    }

    renderContent() {
        return <div>
            <div className={mainStyle.messageBox}></div>
            <div className={mainStyle.emotionPanel}></div>
            <div
                ref={(ref) => this.inputBox = ref}
                onInput={this.onInputText.bind(this)}
                contentEditable="true"
                className={mainStyle.inputBox}></div>
        </div>
    }

    componentWillUpdate(nextProps, nextState) {
        nextState.btns[0].disable = this.inputBox.innerText.length < 1
    }

    onInputText() {
        this.setState({})
    }

}