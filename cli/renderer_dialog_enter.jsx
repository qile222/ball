import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'
import mainStyle from './style_main'
import commonRes from './res_common'

export default class EnterDialogRenderer extends DialogRenderer {

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
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate()
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
        this.state.btns[0].disable =
            this.nameInput.value == '' || this.serverSelect.value == ''
        this.setState({btns: this.state.btns})
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
        if (this.nameInput.value != '' && this.serverSelect.value != '') {
            this.onClickEnter()
        }
    }

}