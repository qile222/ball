import Renderer from './renderer'
import mainStyle from './style_main'
import MapRenderer from './renderer_map'
import GameUIRenderer from './renderer_game_ui'
import React from 'react'

export default class GameRenderer extends Renderer {

    constructor(props) {
        super(props)
    }

    render() {
        let props = {

        }
        return <div className={mainStyle.scene}>
            <MapRenderer ref='map' {...props}/>
            <GameUIRenderer ref='ui' {...props}/>
        </div>
    }

    componentDidMount() {
        super.componentDidMount()
    }

}