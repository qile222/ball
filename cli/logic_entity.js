import Logic from './logic'
import commonRes from './res_common'
import entityRes from './res_entities'
import {util, Vec2, Rect} from './global'

const lifeCycle = commonRes.lifeCycle
const entityInitTime = commonRes.entityInitTime
const eatAddRadiusRatio = commonRes.eatAddRadiusRatio

export default class EntityLogic extends Logic {

    constructor(manager, mapLogic, id, resID, position, addTime) {
        super()
        this.manager = manager
        this.mapLogic = mapLogic
        this.position = position
        this.fixedPosition = util.shadowCopy(position)
        this.id = id
        this.res = entityRes[resID]
        this.lifeCycle = lifeCycle.init
        this.liveTime = addTime ? manager.getFixedUpdateLastTime() - addTime : 0
        this.attacker = null
        this.rotation = 0
        this.eatenCount = 0
        this.setRadius(this.res.radius)
        this.states = []
        for (let name of this.res.states) {
            let stateConstructor = require('./logic_state_' + name).default
            this.states.push(new (stateConstructor)(manager, mapLogic, this))
        }
    }

    destructor() {
        super.destructor()
    }

    getID() {
        return this.id
    }

    setPlayerLogic(playerLogic) {
        this.playerLogic = playerLogic
    }

    getPlayerLogic() {
        return this.playerLogic
    }

    getRes() {
        return this.res
    }

    getLifeCycle() {
        return this.lifeCycle
    }

    getAttacker() {
        return this.attacker
    }

    eat(entity) {
        ++this.eatenCount
        this.setRadius(this.radius + entity.getRadius() * eatAddRadiusRatio)
        entity.die(this)
    }

    die(attacker, force) {
        this.attacker = attacker
        this.lifeCycle = lifeCycle.die
        this.mapLogic.onEntityDie(this, attacker)
    }

    getRadius() {
        return this.radius
    }

    setRadius(radius) {
        let mapSize = this.mapLogic.getSize()
        this.minPosition = new Vec2(radius, radius)
        this.maxPosition = new Vec2(
            mapSize.width - radius,
            mapSize.height - radius
        )
        this.radius = radius
    }

    getFixedPosition() {
        return this.fixedPosition
    }

    setFixedPosition(position) {
        this.fixedPosition = position
    }

    getMaxPosition() {
        return this.maxPosition
    }

    getMinPosition() {
        return this.minPosition
    }

    getPosition() {
        return this.position
    }

    setPosition(position) {
        this.position = position
    }

    getBoundingBox() {
        return new Rect(this.position.x - this.radius,
            this.position.y - this.radius,
            this.radius * 2,
            this.radius * 2)
    }

    handleCmd(cmd) {
        for (let state of this.states) {
            if (state.handleAction(cmd.action, cmd.data, cmd.time)) {
                return
            }
        }
    }

    update(dt) {
        for (let state of this.states) {
            state.update(dt)
        }
    }

    fixedUpdate(dt) {
        if (this.lifeCycle == lifeCycle.init) {
            this.liveTime += dt
            if (this.liveTime >= entityInitTime) {
                this.lifeCycle = lifeCycle.live
            }
        } else if (this.lifeCycle == lifeCycle.live) {
            this.liveTime += dt
        }
        for (let state of this.states) {
            state.fixedUpdate(dt)
        }
    }

    getEatenCount() {
        return this.eatenCount
    }

    getLiveTime() {
        return this.liveTime
    }

    getName() {
        if (this.playerLogic) {
            this.playerLogic.getName()
        } else {
            return this.res.name
        }
    }

}