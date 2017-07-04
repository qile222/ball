import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import mainStyle from './style_main'
import commonRes from './res_common'
import {eventDispatcher} from './global'

export default class LoginEnterDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            hideClose: true,
            title: lanRes.enterGame,
            btns: [
                {
                    title: lanRes.enter,
                    onClick: this.onClickEnter.bind(this),
                    disable: true,
                    name: 'Enter'
                },
            ],
            selectServerIdx: '0'
        }
        eventDispatcher.addListener(
            this.props.manager,
            'LoginManager_getWorldServerList',
            this,
            this.onGetWorldServerList)
    }

    isValid() {
        return this.nameInput && this.nameInput.value != '' &&
            this.props.manager.getWorldServerList().length > 0
    }

    componentDidUpdate(prevProps, prevState) {
        this.state.btns[0].disable = !this.isValid()
        super.componentDidUpdate()
    }

    onGetWorldServerList() {
        this.forceUpdate()
    }

    renderContent() {
        let worldServers = this.props.manager.getWorldServerList()
        let serverList = []
        for (let i in worldServers) {
            serverList.push(
                <option value={i}>
                    {worldServers[i].name}{worldServers[i].delay}
                </option>
            )
        }
        return <form
            className={mainStyle.enterDialog}
            onSubmit={this.onSubmitForm.bind(this)}>
            <label htmlFor='name'>{lanRes.enterName}</label>
            <input
                defaultValue={this.props.playerName}
                onChange={this.onInputName.bind(this)}
                ref={(ref) => this.nameInput = ref}
                id='name'
                type='text'
                placeholder={lanRes.nameInputHint}
                maxLength={commonRes.nameMaxLength} />
            <label htmlFor='server'>{lanRes.serverList}</label>
            <select
                id='server'
                value={this.state.selectServerIdx}
                ref={(ref) => this.serverSelect = ref}
                onChange={this.onSelectServer.bind(this)}>
                {serverList}
            </select>
        </form>
    }

    onInputName(e) {
        this.componentDidUpdate(this.props, this.props)
    }

    onSelectServer(e) {
        this.setState({ selectServerIdx: e.target.value })
    }

    onClickEnter() {
        this.props.manager.enterWorld(
            this.nameInput.value,
            this.serverSelect.value
        )
    }

    onSubmitForm(e) {
        e.preventDefault()
        if (this.isValid) {
            this.onClickEnter()
        }
    }

}