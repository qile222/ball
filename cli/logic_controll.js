import actionRes from './res_action'
import Logic from './logic'
import {gameManager} from './global'

export default class ControllLogic extends Logic {

    constructor() {
        super()

        this.actions = []
    }

    onKeyEvent(event) {
        let type = event.type
        let code = event.keyCode
        let action
        let data
        if (code == 37) {
            action = actionRes.moveLeft
        } else if (code == 38) {
            action = actionRes.moveUp
        } else if (code == 39) {
            action = actionRes.moveRight
        } else if (code == 40) {
            action = actionRes.moveDown
        } else {
            return true
        }
        if (type == 'keyup') {
            for (let i in this.actions) {
                if (this.actions[i] == action) {
                    this.actions.splice(i, 1)
                    let length = this.actions.length
                    if (length < 1) {
                        action = actionRes.stand
                    } else if (i == length) {
                        action = this.actions[length - 1]
                    } else {
                        return false
                    }
                    break
                }
            }
            
        } else if (this.actions[this.actions.length - 1] != action) {
            this.actions.push(action)
        } else {
            return false
        }
        gameManager.handleUserAction(action, data)
        return false
    }

}