import StateLogic from './logic_state'
import commonRes from './res_common'
import {util, gameManager} from './global'

const epsilon = commonRes.epsilon
const abs = Math.abs
const sqrt = Math.sqrt
const lifeCycle = commonRes.lifeCycle

export default class EatStateLogic extends StateLogic {

    constructor(mapLogic, entity) {
        super(mapLogic, entity)
    }

    fixedUpdate(dt) {
        if (this.entity.getLifeCycle() != lifeCycle.live) {
            return
        }

        let fixedPosition = this.entity.getFixedPosition()
        let radius = this.entity.getRadius()

        let entities = this.mapLogic.getEntities()
        for (let entity of entities) {
            if (entity != this.entity && entity.getRes().isFood
                && entity.getLifeCycle() == lifeCycle.live) {
                let entityRadius = entity.getRadius()
                let entityFixedPosition = entity.getFixedPosition()
                let x = fixedPosition.x - entityFixedPosition.x
                let y = fixedPosition.y - entityFixedPosition.y
                let centerDis = sqrt(x * x + y * y)
                if(centerDis - radius - entityRadius <= epsilon) {
                    let radiusDiff = radius - entityRadius
                    if (abs(radiusDiff) <= epsilon || radiusDiff < 0) {
                        entity.eat(this.entity)
                    } else {
                        this.entity.eat(entity)
                    }
                }
            }
        }
    }

}