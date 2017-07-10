import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'

export default class SelectDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            hideClose: true,
            title: lanRes.notice,
            btns: [
                {
                    title: lanRes.confirm,
                    onClick: this.onClickConfirm.bind(this),
                    name: 'Confirm'
                },
            ],
        }
    }

    renderContent() {
        return this.props.children
    }

    onClickConfirm() {
        this.props.onClickClose()
    }

}