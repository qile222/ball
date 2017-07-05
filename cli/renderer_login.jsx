import Renderer from './renderer'
import React from 'react'
import LoginEnterDialogRenderer from './renderer_login_dialog_enter'
import mainStyle from './style_main'
import GameEndDialogRenderer from './renderer_game_dialog_end'
import {gameManager} from './global'

export default class WolrdRenderer extends Renderer {

    constructor(props) {
        super(props)
        this.state = {
            isShowEnterDialog: false
        }
    }

    render() {
        return <div className={mainStyle.scene}>
            <GameEndDialogRenderer manager={gameManager}/>
            {this.state.isShowEnterDialog &&
            <LoginEnterDialogRenderer {...this.props} />}
        </div>
    }
}