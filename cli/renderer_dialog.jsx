import Renderer from './renderer'
import ReactDOM from 'react-dom'
import React from 'react'
import mainStyle from './style_main'
import { scheduler, util } from './global'

const fadeTime = 250

export default class DialogRenderer extends Renderer {

    constructor(props) {
        super(props)
        this.node = null
        this.mouseMoveHandler = this.onMouseMoveTitle.bind(this)
        this.mouseDownHandler = this.onMouseDownTitle.bind(this)
        this.mouseUpHandler = this.onMouseUpTitle.bind(this)
    }

    componentWillMount() {
        super.componentWillMount()
        if (!this.state) {
            this.state = {}
        }
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate()
        this.openDialog()
    }

    componentDidMount() {
        super.componentDidMount()
        this.node = document.createElement('div')
        this.node.className = mainStyle.dialog
        document.body.appendChild(this.node)
        this.openDialog()
        if (this.titleContainer) {
            this.titleContainer.addEventListener(
                'mousedown',
                this.mouseDownHandler,
                false
            )
        }
        this.fadeInStartTime = util.time()
        this.fadeInTimer = scheduler.schedule(0, () => {
            let passedTime = util.time() - this.fadeInStartTime
            if (passedTime > fadeTime) {
                scheduler.unschedule(this.fadeInTimer)
                this.fadeInTimer = null
                passedTime = fadeTime
            }
            this.dialogContainer.style.opacity = passedTime / fadeTime
        })
        this.maskNode.style.visibility = 'hidden'
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        if (this.titleContainer) {
            this.titleContainer.removeEventListener(
                'mousedown',
                this.mouseDownHandler
            )
        }
        this.removeEventListeners()
        this.closeDialog()
        if (this.fadeInTimer) {
            scheduler.unschedule(this.fadeInTimer)
            this.fadeInTimer = null
        }
        if (this.fadeOutTimer) {
            scheduler.unschedule(this.fadeOutTimer)
            this.fadeOutTimer = null
        }
    }

    openDialog() {
        let components = []
        if (this.state.title) {
            components.push(
                <div
                    ref={(ref) => this.titleContainer = ref}
                    className={mainStyle.dialogTitle}>
                    <h4>
                        {this.state.title}
                        {
                            !this.state.hideClose &&
                            <svg
                                onClick={this.onClickClose.bind(this)}
                                aria-hidden="true">
                                <use xlinkHref="#icon-close"></use>
                            </svg>
                        }
                    </h4>
                </div>
            )
        }
        components.push(
            <div className={mainStyle.dialogContent}>
                <div>{this.renderContent()}</div>
            </div>
        )
        if (this.state.btns) {
            let btnComponents = []
            for (let btn of this.state.btns) {
                btnComponents.push(
                    <button
                        disabled={btn.disable}
                        ref={(ref) => this['btn' + btn.name] = ref}
                        onClick={btn.onClick}
                        className={btn.className}>
                        {btn.title}
                    </button>
                )
            }
            components.push(
                <div className={mainStyle.dialogButtons}>
                    <div>{btnComponents}</div>
                </div>
            )
        }
        ReactDOM.unstable_renderSubtreeIntoContainer(
            this,
            <div
                style={this.state.style}
                ref={(ref) => this.dialogContainer = ref}
                className={mainStyle.dialogContainer}>
                {components}
                <div
                    ref={ref => this.maskNode = ref}
                    className={mainStyle.mask}>0000</div>
            </div>,
            this.node
        )
    }

    closeDialog() {
        if (this.node) {
            ReactDOM.unmountComponentAtNode(this.node)
            document.body.removeChild(this.node)
            this.node = null
        }
    }

    prepareForClose(onPrepared) {
        this.maskNode.style.visibility = 'visible'
        this.fadeOutStartTime = util.time()
        this.fadeOutTimer = scheduler.schedule(0, () => {
            let passedTime = util.time() - this.fadeOutStartTime
            if (passedTime > fadeTime) {
                passedTime = fadeTime
                scheduler.unschedule(this.fadeOutTimer)
                this.fadeOutTimer = null
                scheduler.scheduleOnce(0, onPrepared)
            }
            this.dialogContainer.style.opacity = 1 - passedTime / fadeTime
        })
    }

    renderContent() {
        return null
    }

    render() {
        return null
    }

    onMouseDownTitle(e) {
        if (e.button != 0) {
            return
        }
        this.startX = e.screenX
        this.startY = e.screenY
        let style = window.getComputedStyle(this.dialogContainer)
        let transform = style.getPropertyValue('transform').split(',', 6)
        this.translateX = parseInt(transform[4])
        this.translateY = parseInt(transform[5])
        document.addEventListener('mousemove', this.mouseMoveHandler, false)
        document.addEventListener('mouseup', this.mouseUpHandler, false)
        e.stopPropagation()
        let parent = this.dialogContainer.parentElement
        let box = this.dialogContainer.getBoundingClientRect()
        this.translateMinX = -parent.clientWidth / 2
        this.translateMaxX = parent.clientWidth / 2 - box.width
        this.translateMinY = -parent.clientHeight / 2
        this.translateMaxY = parent.clientHeight / 2 - box.height
    }

    onMouseUpTitle(e) {
        this.removeEventListeners()
        e.stopPropagation()
    }

    onMouseMoveTitle(e) {
        let x = e.screenX - this.startX + this.translateX
        let y = e.screenY - this.startY + this.translateY
        if (x < this.translateMinX) {
            x = this.translateMinX
        } else if (x > this.translateMaxX) {
            x = this.translateMaxX
        }
        if (y < this.translateMinY) {
            y = this.translateMinY
        } else if (y > this.translateMaxY) {
            y = this.translateMaxY
        }
        this.dialogContainer.style.transform =
            'translate3d(' + x + 'px, ' + y + 'px, 0)'
        e.preventDefault()
        e.stopPropagation()
    }

    removeEventListeners() {
        if (this.titleContainer) {
            document.removeEventListener('mousemove', this.mouseMoveHandler)
            document.removeEventListener('mouseup', this.mouseUpHandler)
        }
    }

    onClickClose() {
        this.prepareForClose(this.props.onClickClose.bind(this))
    }

}