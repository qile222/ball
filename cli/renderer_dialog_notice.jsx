import React from 'react'
import lanRes from './res_lan.js'
import DialogRenderer from './renderer_dialog'

export default class SelectDialogRenderer extends DialogRenderer {

    constructor(props) {
        super(props)
        this.state = {
            title: lanRes.notice,
            btns: [
                {
                    title: lanRes.ok,
                    onClick: this.onClickConfirm.bind(this),
                    disable: true,
                    name: 'Ok'
                },
            ],
        }
    }

    renderContent() {
        return this.props.children
    }

    onClickConfirm() {
        this.onClickClose()
    }

}