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

    constructor(logic, mapRenderer) {
        this.logic = logic
        this.mapRenderer = mapRenderer
        this.scale = 1
        this.rotation = 0
        eventDispatcher.addListener(
            this.logic,
            'entity_changeDirection',
            this,
            this.onChangeDirection
        )
        eventDispatcher.addListener(
            this.logic,
            'entity_eat',
            this,
            this.onEat
        )
    }

    onEat(entity, target) {

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
        let x = position.x - radius
        let y = position.y - radius
        let width = radius * 2
        let height = radius * 2
        if (!viewPort.isIntersection2(x, y, width, height)) {
            return false
        }
        let radianCos = cos(this.rotation)
        let radisSin = sin(this.rotation)
        ctx.setTransform(
            radianCos * this.scale,
            radisSin * this.scale,
            -radisSin * this.scale,
            radianCos * this.scale,
            position.x - viewPort.x,
            position.y - viewPort.y
        )

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
        this.name = this.logic.getName()
    }

    draw(ctx) {
        //too expensive
        // if (!super.draw(ctx)) {
        if (!EntityRenderer.prototype.draw.call(this, ctx)) {
            return false
        }
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

        let radianCos = cos(twoPI - this.rotation)
        let radisSin = sin(twoPI - this.rotation)
        ctx.transform(
            radianCos * this.scale,
            radisSin * this.scale,
            -radisSin * this.scale,
            radianCos * this.scale,
            0,
            0)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(this.name, 0, 0)

        return true
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
        // if (!super.draw(ctx)) {
        if (!EntityRenderer.prototype.draw.call(this, ctx)) {
            return false
        }
        ctx.beginPath()
        let radius = this.logic.getRadius()
        let step = twoPI / this.sideCount
        for (var i = 0; i <= this.sideCount; i++) {
            var curStep = i * step
            ctx.lineTo(radius * cos(curStep), radius * sin(curStep))
        }
        ctx.fillStyle = this.colorStr
        ctx.fill()
        return true
    }

}

export class SaboteurEntityRenderer extends PolygonEntityRenderer {

    constructor(...params) {
        super(...params)
        this.startTime = util.time()
        this.rotateAniTime = this.logic.getRes().ext.rotateAniTime
    }

    draw(ctx) {
        // if (!super.draw(ctx)) {
        if (!PolygonEntityRenderer.prototype.draw.call(this, ctx)) {
            return false
        }
        let now = util.time()
        let timeDiff = (now - this.startTime) % eatAniTime
        this.rotation = twoPI * timeDiff / this.rotateAniTime
        return true
    }

}