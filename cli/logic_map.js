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
        this.activityEntities = []
        this.idCursor = 0
        this.updateRank = false
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

    addEntity(resID, position, player, addTime) {
        if (!position) {
            position = new Vec2(
                floor(this.size.width / 2),
                floor(this.size.height / 2)
            )
        }
        let res = entityRes[resID]
        let entity = new EntityLogic(
            this.manager,
            this,
            ++this.idCursor,
            res,
            position,
            addTime
        )
        this.entities.push(entity)
        if (!res.static) {
            this.activityEntities.push(entity)
        }
        if (player) {
            entity.setPlayerLogic(player)
            player.setEntityLogic(entity)
            this.updateRank = true
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
        this.updateRank = false
        eventDispatcher.emit(this, 'map_rank_update')
    }

    onEntityDie(entity, attacker) {
        let player = entity.getPlayerLogic()
        if (player) {
            this.manager.onRemovePlayerCmd(player.getID())
            player.setEntityLogic(null)
        }
        entity.destructor()
        eventDispatcher.emit(this, 'map_entity_die', entity)
        this.updateRank = true
    }

    forceDieEntity(entity) {
        if (entity.getLifeCycle() != lifeCycle.die) {
            entity.die(this, true)
        }
    }
    
    update(dt) {
        for (let entity of this.activityEntities) {
            entity.update(dt)
        }
    }

    fixedUpdate(dt) {
        let length = this.activityEntities.length
        for (let i = 0; i < length; ++i) {
            let entity = this.activityEntities[i]
            if (entity.getLifeCycle() == lifeCycle.die) {
                this.activityEntities.splice(i, 1)
                --i
                --length
            } else {
                entity.fixedUpdate(dt)
            }
        }
        if (this.updateRank) {
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