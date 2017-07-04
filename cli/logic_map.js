import EntityLogic from './logic_entity'
import entityRes from './res_entities'
import commonRes from './res_common'
import Logic from './logic'
import {util, Vec2, eventDispatcher} from './global'

const lifeCycle = commonRes.lifeCycle
const sortedEntityRes = []
const floor = Math.floor

for (let i in entityRes) {
    let entity = entityRes[i]
    if (entity.probability > 0) {
        sortedEntityRes.push(entity)
    }
}

export default class MapLogic extends Logic {

    constructor(manager, size, initEntityCount) {
        super()
        this.manager = manager
        this.size = size
        this.entities = []
        this.idCursor = 0
        this.createRandomEntities(initEntityCount)
    }

    getEntities() {
        return this.entities
    }

    getSize() {
        return this.size
    }

    createRandomEntities(initEntityCount) {
        let randomInt = util.randomInt
        let width = this.size.width
        let height = this.size.height
        for (let i = 0; i < initEntityCount; ++i) {
            let ranNumber = randomInt(100)
            for (let entity of sortedEntityRes) {
                ranNumber -= entity.probability
                if (ranNumber <= 0) {
                    this.addEntity(
                        entity.id,
                        new Vec2(randomInt(width), randomInt(height))
                    )
                    break
                }
            }
        }
    }

    addEntity(resID, position, player) {
        if (!position) {
            position = new Vec2(
                floor(this.size.width / 2),
                floor(this.size.height / 2)
            )
        }
        let entity = new EntityLogic(
            this.manager,
            this,
            ++this.idCursor,
            resID,
            position
        )
        this.entities.push(entity)
        if (player) {
            entity.setPlayerLogic(player)
            player.setEntityLogic(entity)
            this.updatePlayerRank()
        }
        eventDispatcher.emit(this, 'map_entity_add', entity)
    }

    updatePlayerRank() {
        let players = this.manager.getPlayerLogics()
        util.mergeSort(players, (p1, p2) => {
            let e1 = p1.getEntityLogic()
            let e2 = p2.getEntityLogic()
            if (e1 && !e2) {
                return true
            } else if (!e1 && e2) {
                return false
            } else if (e1 && e2) {
                return e1.getRadius() > e2.getRadius()
            } else {
                return p1.getID() < p2.getID()
            }
        })
        eventDispatcher.emit(this, 'map_rank_update')
    }

    onEntityDie(entity, attacker) {

    }

    forceDieEntity(entity) {
        entity.die(this, true)
    }
    
    update(dt) {
        let length = this.entities.length
        for (let i = 0; i < length; ++i) {
            let entity = this.entities[i]
            if (entity.getLifeCycle() != lifeCycle.die) {
                entity.update(dt)
            }
        }
    }

    fixedUpdate(dt) {
        let isRemovedEntity = false
        let length = this.entities.length
        for (let i = 0; i < length; ++i) {
            let entity = this.entities[i]
            if (entity.getLifeCycle() == lifeCycle.die) {
                isRemovedEntity = true
                let player = entity.getPlayerLogic()
                if (player) {
                    this.manager.onRemovePlayerCmd(player.getID())
                    player.setEntityLogic(null)
                }
                entity.destructor()
                eventDispatcher.emit(this, 'map_entity_die', entity)
                this.entities.splice(i, 1)
                --i
                --length
            } else {
                entity.fixedUpdate(dt)
            }
        }
        if (isRemovedEntity) {
            this.updatePlayerRank()
        }
    }

    handleCmd(cmd) {
        let cmdPlayerID = cmd.playerID
        let players = this.manager.getPlayerLogics()
        for (let player of players) {
            if (player.getID() == cmdPlayerID) {
                let entity = player.getEntityLogic()
                if (entity) {
                    entity.handleCmd(cmd)
                    break
                }
            }
        }
    }

}