import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import mainStyle from './style_main'
import { worldManager, eventDispatcher, cache,
    memCache, util, scheduler } from './global'

const messageClass = {
    [false]: mainStyle.playerMessage,
    [true]: mainStyle.localPlayerMessage
}

export default class WorldChatDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            hideClose: false,
            title: lanRes.chat,
            btns: [
                {
                    title: lanRes.clearMessages,
                    onClick: this.onClickClearMessages.bind(this),
                    disable: false,
                    name: 'ClearMessage'
                },
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

    renderContent() {
        let playerInfo = memCache.get('player_info')
        let localPlayerID = playerInfo ? playerInfo.id : ''
        let messages = cache.get('chat_messages') || []
        let messageComponents = []
        for (let message of messages) {
            let playerID = message.playerID
            messageComponents.push(
                <div className={messageClass[playerID == localPlayerID]}>
                    <span>{message.playerName}</span>
                    <span>{util.timeFormat(message.time)}</span>
                    <div>{message.content}</div>
                </div>
            )
        }
        return <div>
            {/* TODO using message async load to improve performance */}
            <div className={mainStyle.messageBoxContainer}>
                <div className={mainStyle.messageBox}>
                    <div
                        ref={(ref) => { this.messagesContainer = ref }}
                        className={mainStyle.messages}>
                        {messageComponents}
                    </div>
                </div>
            </div>
            <textarea
                maxLength={500}
                className={mainStyle.inputBox}
                ref={(ref) => this.inputBox = ref}
                onKeyPress={this.onKeyPress.bind(this)}
                onInput={this.onInputText.bind(this)}>
            </textarea>
        </div>
    }

    componentDidMount() {
        super.componentDidMount()
        this.inputBox.focus()
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
    }

    componentWillUpdate(nextProps, nextState) {
        super.componentWillUpdate()
        nextState.btns[1].disable = !this.isValid()
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate()
        scheduler.scheduleOnce(0, ()=>{
            this.messagesContainer.scrollTop =
                this.messagesContainer.scrollHeight
        })
    }

    onInputText() {
        this.setState({})
    }

    onKeyPress(e) {
        if (e.key == 'Enter') {
            this.onClickSend()
            e.preventDefault()
        }
    }

    isValid() {
        return this.inputBox.value.length > 0
    }

    onGetNewMessage(worldManager, message) {
        this.setState({})
    }

    onClickSend() {
        if (this.isValid()) {
            worldManager.sendMessage(this.inputBox.value)
            this.inputBox.value = ''
            this.inputBox.focus()
        }
    }

    onClickClearMessages() {
        worldManager.clearMessagesCache()
        this.setState({})
    }


}