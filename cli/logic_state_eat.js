import StateLogic from './logic_state'
import commonRes from './res_common'
import {util} from './global'

const epsilon = commonRes.epsilon
const abs = Math.abs
const lifeCycle = commonRes.lifeCycle

export default class EatStateLogic extends StateLogic {

    constructor(manager, mapLogic, entity) {
        super(manager, mapLogic, entity)
    }

    fixedUpdate(dt) {
        if (this.entity.getLifeCycle() != lifeCycle.live) {
            return
        }

        let fixedPosition = this.entity.getFixedPosition()
        let radius = this.entity.getRadius()

        let entities = this.mapLogic.getEntities()
        for (let entity of entities) {
            if (!entity || entity == this.entity || !entity.getRes().isFood
                || entity.getLifeCycle() != lifeCycle.live) {
                continue
            }
            let entityRadius = entity.getRadius()
            if (util.isCircleIntersection(
                fixedPosition,
                radius,
                entity.getFixedPosition(),
                entityRadius)) {
                let radiusDiff = radius - entityRadius
                if (abs(radiusDiff) <= epsilon || radiusDiff < 0) {
                    entity.eat(this.entity)
                } else {
                    this.entity.eat(entity)
                }
                return
            }
        }
    }

}