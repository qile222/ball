import actionRes from './res_action'
import Logic from './logic'
import { gameManager } from './global'
import device from './device'

class ControllLogic extends Logic {

    constructor() {
        super()
    }

    onKeyEvent(event) {

    }

}

class KeyboardImpl extends ControllLogic {

    constructor() {
        super()
        this.actions = []
    }

    onKeyEvent(event) {
        let type = event.type
        let action = event.keyCode
        if (action != actionRes.moveLeft &&
            action != actionRes.moveUp &&
            action != actionRes.moveRight &&
            action != actionRes.moveDown) {
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
        gameManager.handleUserAction(action)
        return false
    }

}

class AccelerationImpl extends ControllLogic {

    onKeyEvent(event) {
        
    }

}

module.exports = device.platform == 'mobile' ? AccelerationImpl : KeyboardImpl