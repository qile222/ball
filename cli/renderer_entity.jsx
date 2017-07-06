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
        this.skew = 0
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
        let radius = this.logic.getRadius()
        let position = this.logic.getPosition()
        if (!viewPort.isIntersection2(
            position.x, position.y, radius, radius)) {
            return false
        }
        let cos = Math.cos(this.rotation)
        let sin = Math.sin(this.rotation)
        ctx.setTransform(
            1,0,0,1,
            position.x - viewPort.x,
            position.y - viewPort.y
        )
        // ctx.rotate(this.rotation)
        // ctx.scale(this.scale, this.scale)
        // this.doDraw(ctx)
        // ctx.fillStyle = 'white'
        // ctx.fillRect(0, 0, 1, 1)
        return true
    }

}

export class CircleEntityRenderer extends EntityRenderer {

    constructor(...params) {
        super(...params)
        let randomInt = util.randomInt
        this.startTime = util.time()
        this.color = new Color4B(randomInt(256), randomInt(256), randomInt(256))
        this.colorStr = null
    }

    draw(ctx) {
        super.draw(ctx)
        ctx.beginPath()
        let now = util.time()
        let timeDiff = (now - this.startTime) % eatAniTime
        let eatAniCurRadians = abs(eatAniRatio * (timeDiff - eatAniHalfTime))
        let radius = this.logic.getRadius()
        ctx.arc(0, 0, radius, eatAniCurRadians, -eatAniCurRadians - 0.15, false)
        ctx.lineTo(radius / -3, 0)
        let initedTime = now - this.startTime
        let colorStr
        if (initedTime <= entityInitTime) {
            initedTime = initedTime % (entityInitTime / 2)
            initedTime = 1 - initedTime / (entityInitTime / 4)
            this.color.a = abs(initedTime)
            colorStr = this.color.toString()
        } else {
            if (!this.colorStr) {
                this.colorStr = this.color.toString()
            }
            colorStr = this.colorStr
        }
        ctx.fillStyle = colorStr
        ctx.fill()
    }

}

export class PolygonEntityRenderer extends EntityRenderer {

    constructor(...params) {
        super(...params)
        let randomInt = util.randomInt
        this.rotation = randomInt(twoPI * 100) / 100
        this.sideCount = this.logic.getRes().ext.sideCount
        this.radius = this.logic.getRadius()
        this.color = new Color4B(randomInt(256), randomInt(256), randomInt(256))
        this.colorStr = this.color.toString()
    }

    draw(ctx) {
        super.draw(ctx)
        ctx.beginPath()
        let step = twoPI / this.sideCount
        for (var i = 0; i <= this.sideCount; i++) {
            var curStep = i * step
            ctx.lineTo(this.radius * cos(curStep), this.radius * sin(curStep))
        }
        ctx.fillStyle = this.colorStr
        ctx.fill()
    }

}

export class SaboteurEntityRenderer extends PolygonEntityRenderer {

    constructor(...params) {
        super(...params)
        this.startTime = util.time()
        this.rotateAniTime = this.logic.getRes().ext.rotateAniTime
    }

    doDraw(ctx) {
        super.draw(ctx)
        let now = util.time()
        let timeDiff = (now - this.startTime) % eatAniTime
        this.rotation = twoPI * timeDiff / this.rotateAniTime
    }

}