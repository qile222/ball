import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import mainStyle from './style_main'
import {worldManager, eventDispatcher, cache, memCache, util} from './global'

const messageClass = {
    [true]: mainStyle.playerMessage,
    [false]: mainStyle.localPlayerMessage
}

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
        let playerInfo = memCache.get('player_info')
        let localPlayerID = playerInfo ? playerInfo.id : ''
        let messages = cache.get('chat_messages')
        let messageComponents = []
        for (let message of messages) {
            let playerID = message.playerID
            messageComponents.push(
                <div className={messageClass[playerID == localPlayerID]}>
                    <div>
                        <span>{message.playerName}</span>
                        <span>{util.timeFormat(message.time)}</span>
                    </div>
                    <div>{message.content}</div>
                </div>
            )
        }
        
        return <div>
            {/* TODO using message async load to improve performance */}
            <div className={mainStyle.messageBoxContainer}>
                <div className={mainStyle.messageBox}>
                    <div className={mainStyle.messages}>
                        {messageComponents}
                    </div>
                </div>
            </div>
            <div className={mainStyle.emotionPanel}></div>
            <div
                contentEditable={true}
                className={mainStyle.inputBox}
                ref={(ref) => this.inputBox = ref}
                onKeyPress={this.onKeyPress.bind(this)}
                onInput={this.onInputText.bind(this)}>
            </div>
        </div>
    }

    componentDidMount() {
        super.componentDidMount()
        this.inputBox.focus()
    }

    componentWillUpdate(nextProps, nextState) {
        nextState.btns[0].disable = !this.isValid()
    }

    onInputText() {
        this.setState({})
    }

    onKeyPress(e) {
        if (e.key == 'Enter') {
            if (this.isValid()) {
                worldManager.sendMessage(this.inputBox.innerText)
                e.preventDefault()
            }
        }
    }

    isValid() {
        return this.inputBox.innerText.length > 0
    }

    onGetNewMessage(worldManager, message) {
        this.setState({})
    }

}