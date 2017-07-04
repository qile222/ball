import Renderer from './renderer'
import React from 'react'
import LoginEnterDialogRenderer from './renderer_login_dialog_enter'

export default class WolrdRenderer extends Renderer {

    constructor(props) {
        super(props)
        this.state = {
            isShowEnterDialog: true
        }
    }

    render() {
        return <div>
            {this.state.isShowEnterDialog &&
            <LoginEnterDialogRenderer {...this.props} />}
        </div>
    }
}