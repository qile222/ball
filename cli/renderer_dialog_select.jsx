import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'

export default class SelectDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            title: lanRes.confirm,
            btns: [
                {
                    title: lanRes.cancel,
                    onClick: this.onClickCancel.bind(this),
                    name: 'Cancel',
                },
                {
                    title: lanRes.confirm,
                    onClick: this.onClickConfirm.bind(this),
                    name: 'Confirm',
                },
            ]
        }
    }

    renderContent() {
        return this.props.children
    }

    onClickConfirm() {
        this.props.confirmCb(this)
    }

    onClickCancel() {
        this.props.cancelCb(this)
    }

    onClickClose() {
        this.onClickCancel()
    }

}