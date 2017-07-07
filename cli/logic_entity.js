import Logic from './logic'
import commonRes from './res_common'
import {util, Vec2, eventDispatcher} from './global'

const lifeCycle = commonRes.lifeCycle
const entityInitTime = commonRes.entityInitTime
const eatAddRadiusRatio = commonRes.eatAddRadiusRatio

export default class EntityLogic extends Logic {

    constructor(manager, mapLogic, id, res, position, addTime) {
        super()
        this.manager = manager
        this.mapLogic = mapLogic
        this.position = position
        this.fixedPosition = util.shadowCopy(position)
        this.id = id
        this.res = res
        this.lifeCycle = res.initState
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
        eventDispatcher.emit(this, 'entity_eat', entity)
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

    handleCmd(cmd) {
        for (let state of this.states) {
            if (state.handleAction(cmd.action, cmd.data, cmd.time)) {
                return
            }
        }
    }

    update(dt) {
        if (this.lifeCycle != lifeCycle.die) {
            for (let state of this.states) {
                state.update(dt)
            }
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
        } else {
            return
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
            return this.playerLogic.getName()
        } else {
            return this.res.name
        }
    }

}