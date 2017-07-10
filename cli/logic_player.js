import Logic from './logic'

export default class PlayerLogic extends Logic {

    constructor(id, name, enterTime) {
        super()
        this.id = id
        this.name = name
        this.entity = null
        this.enterTime = enterTime
    }

    getEnterTime() {
        return this.enterTime
    }

    getID() {
        return this.id
    }

    getName() {
        return this.name
    }

    setEntityLogic(entity) {
        this.entity = entity
    }

    getEntityLogic() {
        return this.entity
    }

}