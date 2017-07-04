import Renderer from './renderer'
import mainStyle from './style_main'
import MapRenderer from './renderer_map'
import GameUIRenderer from './renderer_game_ui'
import React from 'react'

export default class GameRenderer extends Renderer {

    constructor(props) {
        super(props)
    }

    update(dt) {
        this.refs.map.update(dt)
    }

    render() {
        let props = {
            manager: this.props.manager,
            mapLogic: this.props.manager.getMapLogic()
        }
        return <div ref='renderer' className={mainStyle.game}>
            <MapRenderer ref='map' {...props}/>
            <GameUIRenderer ref='ui' {...props}/>
        </div>
    }

    componentDidMount() {
        this.props.manager.resInited()
    }

    onStageSizeChanged(size) {
        this.refs.map.onStageSizeChanged(size)
        this.refs.ui.onStageSizeChanged(size)
    }

}