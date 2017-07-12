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
                    onClick: props.onClickCancel,
                    name: 'Cancel',
                },
                {
                    title: lanRes.confirm,
                    onClick: props.onClickConfirm,
                    name: 'Confirm',
                },
            ]
        }
    }

    renderContent() {
        return this.props.children
    }

}