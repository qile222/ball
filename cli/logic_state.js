import Logic from './logic'

export default class StateLogic extends Logic {

    constructor(mapLogic, entity) {
        super()
        this.mapLogic = mapLogic
        this.entity = entity
    }

    handleAction(action, data, time) {
        return false
    }

    update(dt) {

    }

    fixedUpdate(dt) {

    }

}