import commonRes from './res_common'
import {util, eventDispatcher, Vec2} from './global'

const pi = Math.PI
const twoPI = 2 * pi
const cos = Math.cos
const sin = Math.sin
const abs = Math.abs
const entityInitTime = commonRes.entityInitTime
const entityFadeTime = entityInitTime / 3
const eatAniRadians = Math.PI
const eatAniTime = 500
const eatAniHalfTime = eatAniTime / 2
const eatAniRatio = eatAniRadians / eatAniTime / 2

class Renderer {

    constructor() {
        this.scale = 1
        this.rotation = 0
        this.opacity = 1
        this.position = new Vec2(0, 0)
    }

    draw(ctx) {

    }

}

class EntityRenderer extends Renderer {

    constructor(logic, mapRenderer) {
        super()
        this.logic = logic
        this.mapRenderer = mapRenderer
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
        let x = position.x - radius
        let y = position.y - radius
        let width = radius * 2
        let height = radius * 2
        if (!viewPort.isIntersection2(x, y, width, height)) {
            return false
        }
        let radianCos = cos(this.rotation)
        let radisSin = sin(this.rotation)
        ctx.globalAlpha = this.opacity
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
        this.startTime = util.time()
        this.name = this.logic.getName()
        this.opacity = 0
        this.color = util.randomColor()
    }

    draw(ctx) {
        //too expensive
        // if (!super.draw(ctx)) {
        if (!EntityRenderer.prototype.draw.call(this, ctx)) {
            return false
        }
        let now = util.time()
        let runningTime = now - this.startTime
        if (runningTime > entityInitTime) {
            this.opacity = 1
        } else {
            runningTime = runningTime % entityFadeTime
            this.opacity = abs(1 - runningTime / entityFadeTime / 2)
        }
        ctx.beginPath()
        let timeDiff = (now - this.startTime) % eatAniTime
        let eatAniCurRadians = abs(eatAniRatio * (timeDiff - eatAniHalfTime))
        let radius = this.logic.getRadius()
        ctx.arc(0, 0, radius, eatAniCurRadians, -eatAniCurRadians - 0.15, false)
        ctx.lineTo(radius / -3, 0)
        ctx.fillStyle = this.color
        ctx.fill()

        let radianCos = cos(twoPI - this.rotation)
        let radisSin = sin(twoPI - this.rotation)
        ctx.transform(
            radianCos * this.scale,
            radisSin * this.scale,
            -radisSin * this.scale,
            radianCos * this.scale,
            0,
            0
        )
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
        this.color = util.randomColor()
    }

    draw(ctx) {
        if (!EntityRenderer.prototype.draw.call(this, ctx)) {
            return false
        }
        ctx.beginPath()
        let radius = this.logic.getRadius()
        let step = twoPI / this.sideCount
        for (let i = 0; i <= this.sideCount; i++) {
            let curStep = i * step
            ctx.lineTo(radius * cos(curStep), radius * sin(curStep))
        }
        ctx.fillStyle = this.color
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
        if (!PolygonEntityRenderer.prototype.draw.call(this, ctx)) {
            return false
        }
        let now = util.time()
        let timeDiff = (now - this.startTime) % this.rotateAniTime
        this.rotation = twoPI * timeDiff / this.rotateAniTime
        return true
    }

}

export class ImageRenderer extends Renderer {

    constructor(texture, mapRenderer) {
        super()
        this.texture = texture
        this.mapRenderer = mapRenderer
    }

    draw(ctx) {
        let viewPort = this.mapRenderer.getViewPort()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalAlpha = 1
        ctx.drawImage(
            this.texture, viewPort.x, viewPort.y, viewPort.width,
            viewPort.height, 0, 0, viewPort.width, viewPort.height
        )
    }

}

export class LabelRenderer extends Renderer{

    constructor(text, color) {
        super()
        this.text = text
        this.color = color
    }

    draw() {

    }

}