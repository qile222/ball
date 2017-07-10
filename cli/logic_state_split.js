import StateLogic from './logic_state'
import commonRes from './res_common'
import {util} from './global'

const lifeCycle = commonRes.lifeCycle
const epsilon = commonRes.epsilon
const sqrt = Math.sqrt

export default class MoveStateLogic extends StateLogic {

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
            if (entity != this.entity &&
                entity.getLifeCycle() == lifeCycle.live) {
                let entityRadius = entity.getRadius()
                let entityFixedPosition = entity.getFixedPosition()
                let x = fixedPosition.x - entityFixedPosition.x
                let y = fixedPosition.y - entityFixedPosition.y
                let centerDis = sqrt(x * x + y * y)
                if(centerDis - radius - entityRadius <= epsilon) {
                    this.entity.eat(entity)
                    return
                }
            }

        }
    }

}