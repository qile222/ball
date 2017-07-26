import Renderer from './renderer'
import ReactDOM from 'react-dom'
import React from 'react'
import mainStyle from './style_main'

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
        this.state.dialogContainerClassName = [
            mainStyle.dialogContainer,
            mainStyle.aniScaleToMax
        ]
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
    }

    openDialog() {
        let components = []
        if (this.state.title) {
            components.push(
                <div
                    ref={(ref)=>this.titleContainer=ref}
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
                className={this.state.dialogContainerClassName.join(' ')}>
                {components}
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
        this.setState({
            dialogContainerClassName: [
                mainStyle.dialogContainer,
                mainStyle.aniScaleToMin,
            ]
        })
        this.dialogContainer.addEventListener('animationend', onPrepared, false)
    }

    renderContent() {
        return null
    }

    render() {
        return null
    }

    onMouseDownTitle(e) {
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
            'matrix(1, 0, 0, 1, ' + x + ', ' + y + ')'
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