import style from './style_main'
import ReactDOM from 'react-dom'
import {Rect, Size, scheduler, eventDispatcher, netManager} from './global'

export default class Display {

    constructor() {
        this.stage = document.createElement('div')
        this.stage.id = style.container
        this.runningRenderer = null
        this.frameCount = 0
        this.dtTotal = 0
        this.fpsRenderer = null
        this.viewPort = new Rect()
        this.worldSize = new Size()
        document.body.appendChild(this.stage)
        this.stageSize = new Size(
            this.stage.clientWidth,
            this.stage.clientHeight
        )
        window.addEventListener('resize', this.onStageSizeChanged.bind(this))
    }

    showStat(isShow) {
        if (isShow) {
            if (!this.fpsRenderer) {
                this.fpsRenderer = document.createElement('div')
                this.fpsRenderer.id = style.stat
                document.body.appendChild(this.fpsRenderer)
                this.timerID = scheduler.schedule(0, this.update.bind(this))
            }
        } else if (this.fpsRenderer) {
            this.stage.removeChild(this.fpsRenderer)
            this.fpsRenderer = null
            scheduler.unschedule(this.timerID)
            this.timerID = null
        }
    }

    update(dt) {
        if (this.fpsRenderer) {
            ++this.frameCount
            this.dtTotal += dt
            if (this.dtTotal > 500) {
                let statStr =
                    (1000 / this.dtTotal * this.frameCount).toFixed(2) + 'FPS '
                let connections = netManager.getConnectionsLag()
                for (let connection of connections) {
                    statStr += connection.name + connection.lag + 'MS '
                }
                this.fpsRenderer.innerText = statStr
                this.frameCount = 0
                this.dtTotal = 0
            }
        }
        if (this.runningRenderer && this.runningRenderer.update) {
            this.runningRenderer.update(dt)
        }
    }

    getRunningRenderer() {
        return this.runningRenderer
    }

    replaceRenderer(component) {
        this.runningRenderer = ReactDOM.render(component, this.stage)
    }

    getStageSize() {
        return this.stageSize
    }

    onStageSizeChanged() {
        this.stageSize = new Size(
            this.stage.clientWidth,
            this.stage.clientHeight
        )
        eventDispatcher.emit(this, 'display_stage_size_changed', this.stageSize)
    }

    showLoading(isShow) {
        document.getElementById('loading').style.visibility = 'hidden'
    }

}