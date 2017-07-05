import Renderer from './renderer'
import React from 'react'
import LoginEnterDialogRenderer from './renderer_login_dialog_enter'
import mainStyle from './style_main'

export default class WolrdRenderer extends Renderer {

    constructor(props) {
        super(props)
        this.state = {
            isShowEnterDialog: true
        }
    }

    render() {
        return <div className={mainStyle.scene}>
            {this.state.isShowEnterDialog &&
            <LoginEnterDialogRenderer {...this.props} />}
        </div>
    }
}