import StateLogic from './logic_state'
import actionRes from './res_action'
import commonRes from './res_common'
import {util, eventDispatcher} from './global'

const epsilon = commonRes.epsilon
const abs = Math.abs
const lifeCycle = commonRes.lifeCycle

export default class MoveStateLogic extends StateLogic {

    constructor(manager, mapLogic, entity) {
        super(manager, mapLogic, entity)
        this.action = actionRes.stand
        this.direction = null
        this.speed = this.entity.getRes().speed
        this.startPosition = this.entity.getPosition()
    }

    destructor() {
        super.destructor()
    }
    
    getDirection() {
        return this.direction
    }

    getSpeed() {
        return this.speed
    }

    getAction() {
        return this.action
    }

    handleAction(action, data, time) {
        let runningTime = this.manager.getRunningTime()
        let dt = runningTime - time
        this.update(-dt)
        if (action == actionRes.moveDown) {
            this.direction = 'y'
            this.speed = abs(this.speed)
        } else if (action == actionRes.moveUp) {
            this.direction = 'y'
            this.speed = -abs(this.speed)
        } else if (action == actionRes.moveLeft) {
            this.direction = 'x'
            this.speed = -abs(this.speed)
        } else if (action == actionRes.moveRight) {
            this.direction = 'x'
            this.speed = abs(this.speed)
        } else if (action == actionRes.stand) {
            this.direction = null
        } else {
            return false
        }
        this.startPosition = util.shadowCopy(this.entity.getPosition())
        this.update(dt)
        this.moveAction = action
        this.startTime = time
        eventDispatcher.emit(this.entity, 'entity_changeDirection', this)

        return true
    }

    update(dt) {
        let direction = this.direction
        if (!this.direction || !this.speed) {
            return
        }

        let position = this.entity.getPosition()
        position[this.direction] += this.speed * dt

        let maxValue = this.entity.getMaxPosition()[direction]
        let diff = position[direction] - maxValue
        if (diff > epsilon) {
            position[direction] = maxValue
        } else {
            let minValue = this.entity.getMinPosition()[direction]
            diff = position[direction] - minValue
            if (diff < epsilon) {
                position[direction] = minValue
            } else {
                return
            }
        }
        this.direction = null
    }

    fixedUpdate(dt) {
        if (this.entity.getLifeCycle() != lifeCycle.live) {
            return
        }

        let runningTime = this.manager.getRunningTime()
        let leftDt = runningTime % dt
        let extraDt = runningTime - leftDt - this.startTime
        let fixedPosition = util.shadowCopy(this.startPosition)
        if (this.direction) {
            fixedPosition[this.direction] += this.speed * extraDt
        }
        this.entity.setFixedPosition(fixedPosition)
        console.log(this.entity.getLiveTime())
    }

}