import commonRes from './res_common'
import {util, eventDispatcher, Color4B} from './global'

const pi = Math.PI
const twoPI = 2 * pi
const cos = Math.cos
const sin = Math.sin
const abs = Math.abs
const entityInitTime = commonRes.entityInitTime
const eatAniRadians = commonRes.eatAniRadians
const eatAniTime = commonRes.eatAniTime
const eatAniHalfTime = eatAniTime / 2
const eatAniRatio = eatAniRadians / eatAniTime / 2

class EntityRenderer {

    constructor(logic, manager, mapRenderer) {
        this.logic = logic
        this.manager = manager
        this.mapRenderer = mapRenderer
        this.scale = 1
        this.rotation = 0
        eventDispatcher.addListener(
            this.logic,
            'entity_changeDirection',
            this,
            this.onChangeDirection
        )
    }

    onChangeDirection(entity, moveState) {
        let direction = moveState.getDirection()
        if (direction) {
            let speed = moveState.getSpeed()
            this.rotation = pi * (direction == 'x' ?
                (speed >= 0 ? 0 : 1) :
                (speed >= 0 ? 0.5 : 1.5))
        }
    }

    getLogic() {
        return this.logic
    }

    draw(ctx) {
        let viewPort = this.mapRenderer.getViewPort()
        let boundingBox = this.logic.getBoundingBox()
        if (!viewPort.isIntersection(boundingBox)) {
            return false
        }
        let radius = this.logic.getRadius()
        ctx.translate(
            boundingBox.x + radius - viewPort.x,
            boundingBox.y + radius - viewPort.y
        )
        ctx.rotate(this.rotation)
        ctx.scale(this.scale, this.scale)
        this.doDraw(ctx)
        // ctx.fillStyle = 'white'
        // ctx.fillRect(0, 0, 1, 1)
        return true
    }

    doDraw(ctx) {

    }

}

export class CircleEntityRenderer extends EntityRenderer {

    constructor(...params) {
        super(...params)
        let randomInt = util.randomInt
        this.startTime = util.time()
        this.color = new Color4B(randomInt(256), randomInt(256), randomInt(256))
    }

    doDraw(ctx) {
        ctx.beginPath()
        let now = util.time()
        let timeDiff = (now - this.startTime) % eatAniTime
        let eatAniCurRadians = abs(eatAniRatio * (timeDiff - eatAniHalfTime))
        let radius = this.logic.getRadius()
        ctx.arc(0, 0, radius, eatAniCurRadians, -eatAniCurRadians - 0.15, false)
        ctx.lineTo(radius / -3, 0)
        let initedTime = now - this.startTime
        if (initedTime <= entityInitTime) {
            initedTime = initedTime % (entityInitTime / 2)
            initedTime = 1 - initedTime / (entityInitTime / 4)
            this.color.a = abs(initedTime)
        }
        ctx.fillStyle = this.color.toString()
        ctx.fill()
    }

}

export class PolygonEntityRenderer extends EntityRenderer {

    constructor(...params) {
        super(...params)
        let randomInt = util.randomInt
        this.rotation = randomInt(twoPI * 100) / 100
        this.color = new Color4B(randomInt(256), randomInt(256), randomInt(256))
    }

    doDraw(ctx) {
        ctx.beginPath()
        let radius = this.logic.getRadius()
        let sideCount = this.logic.getRes().ext.sideCount
        let step = twoPI / sideCount
        for (var i = 0; i <= sideCount; i++) {
            var curStep = i * step
            ctx.lineTo(radius * cos(curStep), radius * sin(curStep))
        }
        ctx.fillStyle = this.color.toString()
        ctx.fill()
    }

}

export class SaboteurEntityRenderer extends PolygonEntityRenderer {

    constructor(...params) {
        super(...params)
        this.startTime = util.time()
    }

    doDraw(ctx) {
        super.doDraw(ctx)
        let now = util.time()
        let timeDiff = (now - this.startTime) % eatAniTime
        let res = this.logic.getRes()
        let rotateAniTime = res.ext.rotateAniTime
        this.rotation = twoPI * timeDiff / rotateAniTime
    }

}