import Renderer from './renderer'
import React from 'react'
import WorldStartDialogRenderer from './renderer_world_dialog_start'
import mainStyle from './style_main'

export default class WolrdRenderer extends Renderer {

    constructor(props) {
        super(props)
    }

    render() {
        return <div className={mainStyle.scene}>
            <WorldStartDialogRenderer {...this.props}/>
        </div>
    }
}