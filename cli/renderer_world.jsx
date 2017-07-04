import Renderer from './renderer'
import React from 'react'
import WorldStartDialogRenderer from './renderer_world_dialog_start'

export default class WolrdRenderer extends Renderer {

    constructor(props) {
        super(props)
    }

    render() {
        return <div>
            <WorldStartDialogRenderer {...this.props}/>
        </div>
    }
}