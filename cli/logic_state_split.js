import StateLogic from './logic_state'
import commonRes from './res_common'
import {util} from './global'

const lifeCycle = commonRes.lifeCycle

export default class MoveStateLogic extends StateLogic {

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
            if (!entity ||
                entity == this.entity ||
                entity.getLifeCycle() != lifeCycle.live) {
                continue
            }
            if (util.isCircleIntersection(
                fixedPosition,
                radius,
                entity.getFixedPosition(),
                entity.getRadius())) {
                this.entity.eat(entity)
                return
            }
        }
    }

}