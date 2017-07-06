import Renderer from './renderer'
import mainStyle from './style_main'
import commonRes from './res_common'
import React from 'react'
import * as EntityRenderers from './renderer_entity'
import {display, eventDispatcher, Rect, scheduler} from './global'

const floor = Math.floor

export default class MapRenderer extends Renderer {

    constructor(props) {
        super(props)
        let keyEventHandler = props.manager.onKeyEvent.bind(props.manager)
        document.addEventListener('keydown', keyEventHandler, false)
        document.addEventListener('keyup', keyEventHandler, false)
        eventDispatcher.addListener(
            props.mapLogic,
            'map_entity_add',
            this,
            this.onEntityAdd
        )
        eventDispatcher.addListener(
            props.mapLogic,
            'map_entity_die',
            this,
            this.onEntityDie
        )
        eventDispatcher.addListener(
            null,
            'display_stage_size_changed',
            this,
            this.onStageSizeChanged.bind(this)
        )
        this.watchingEntityLogic = null
        this.entities = []
        let entities = props.mapLogic.getEntities()
        for (let entityLogic of entities) {
            this.entities.push(
                this.createEntityRenderer(entityLogic, props.manager, this)
            )
        }
        this.timerID = scheduler.schedule(0, this.update.bind(this))
    }

    getViewPort() {
        return this.viewPort
    }

    createEntityRenderer(entityLogic) {
        let res = entityLogic.getRes()
        let constructor = EntityRenderers[res.name + 'EntityRenderer']
        return new constructor(entityLogic, this.props.manager, this)
    }

    update(dt) {
        let map = this.refs.map
        let ctx = map.getContext('2d')
        let viewPort = this.viewPort
        if (this.watchingEntityLogic) {
            let mapSize = this.props.mapLogic.getSize()
            let watchPosition = this.watchingEntityLogic.getPosition()
            viewPort.x = watchPosition.x - viewPort.width / 2
            if (viewPort.x < 0) {
                viewPort.x = 0
            } else {
                let maxX = mapSize.width - viewPort.width
                if (viewPort.x > maxX) {
                    viewPort.x = maxX
                }
            }
            viewPort.y = watchPosition.y - viewPort.height / 2
            if (viewPort.y < 0) {
                viewPort.y = 0
            } else {
                let maxY = mapSize.width - viewPort.height
                if (viewPort.y > maxY) {
                    viewPort.y = maxY
                }
            }
        }
        ctx.clearRect(0, 0, map.width, map.height)
        ctx.drawImage(this.grid, viewPort.x, viewPort.y, viewPort.width,
            viewPort.height, 0, 0, viewPort.width, viewPort.height)
        let entities = this.entities
        // let drawCount = 0
        // let d1 = Date.now()
        for (let entity of entities) {
            ctx.save()
            if (entity.draw(ctx)) {
                // ++drawCount
            }
            ctx.restore()
        }
        // console.log(Date.now() - d1)
        // console.log(drawCount)
    }

    componentDidMount() {
        this.refs.map.getContext('2d').setTransform(1, 0, 0, 1, 0, 0)
    }

    componentWillUnmount() {
        super.componentDidMount()
        scheduler.unschedule(this.timerID)
        this.timerID = null
    }

    render() {
        let mapSize = this.props.manager.getMapLogic().getSize()
        let canvas = document.createElement('canvas')
        var ctx = canvas.getContext('2d')
        canvas.width = mapSize.width
        canvas.height = mapSize.height
        let gridPixel = commonRes.gridPixel
        let xCount = floor(mapSize.width / gridPixel)
        let yCount = floor(mapSize.height / gridPixel)
        ctx.fillStyle = commonRes.gameGridBackgroundColor
        ctx.fillRect(0, 0, mapSize.width, mapSize.height)
        ctx.beginPath()
        for (let i = 0; i <= xCount; ++i) {
            let x = gridPixel * i
            ctx.moveTo(x, 0)
            ctx.lineTo(x, mapSize.height)
        }
        for (let i = 0; i <= yCount; ++i) {
            let y = gridPixel * i
            ctx.moveTo(0, y)
            ctx.lineTo(mapSize.width, y)
        }
        ctx.lineWidth = 1
        ctx.strokeStyle = commonRes.gameGridBorderColor
        ctx.stroke()
        this.grid = new Image()
        this.grid.src = ctx.canvas.toDataURL('img/png')

        let stageSize = display.getStageSize()
        this.viewPort = new Rect(0, 0, stageSize.width, stageSize.height)

        return <canvas
            ref='map'
            className={mainStyle.gameMap}
            width={stageSize.width}
            height={stageSize.height}>
        </canvas>
    }

    onEntityAdd(mapLogic, entity) {
        let player = entity.getPlayerLogic()
        if (player == this.props.manager.getLocalPlayerLogic()) {
            this.watchingEntityLogic = entity
        }

        this.entities.push(
            this.createEntityRenderer(entity, this.props.manager, this)
        )
    }

    onEntityDie(mapLogic, entity, attacker) {
        let player = entity.getPlayerLogic()
        if (player == this.props.manager.getLocalPlayerLogic()) {
            this.watchingEntityLogic = null
        }
        let entities = this.entities
        let entitiesLength = entities.length
        for (let i=0; i < entitiesLength; ++i) {
            if (entities[i].getLogic() == entity) {
                entities.splice(i, 1)
                return
            }
        }
        throw new Error('')
    }

    onStageSizeChanged(display, size) {
        this.refs.map.width = size.width
        this.refs.map.height = size.height
        this.viewPort.width = size.width
        this.viewPort.height = size.height
    }

}