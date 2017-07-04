import Renderer from './renderer'
import React from 'react'
import EnterDialogRenderer from './renderer_dialog_enter'
import {eventDispatcher} from './global'

export default class WolrdRenderer extends Renderer {

    constructor(props) {
        super(props)
        eventDispatcher.addListener(
            this.props.manager,
            'LoginManager_getWorldServerList',
            this,
            this.onGetWorldServerList)
        this.state = {
            isShowEnterDialog: false
        }
    }

    onGetWorldServerList() {
        this.setState({
            isShowEnterDialog: true
        })
    }

    render() {
        return <div>
            {this.state.isShowEnterDialog &&
            <EnterDialogRenderer {...this.props} />}
        </div>
    }
}