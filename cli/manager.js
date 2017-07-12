import {eventDispatcher} from './global'

export default class Manager {

    constructor() {
        eventDispatcher.addListener(
            null,
            'runtime_error',
            this,
            this.onRuntimeError
        )
    }

    onRuntimeError() {

    }

    destructor() {
        eventDispatcher.removeListener(this)
    }

}