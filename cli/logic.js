import {eventDispatcher} from './global'
export default class Logic {

    constructor() {

    }

    destructor() {
        eventDispatcher.removeListener(this)
    }

    update(dt) {

    }

    fixedUpdate(dt) {
        
    }

    handleCmd(cmd) {

    }

}