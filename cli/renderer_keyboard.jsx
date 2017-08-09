import Renderer from './renderer'
import React from 'react'
import mainStyle from './style_main'
import { keyCodes, keyboardMoveCaptureInterval } from './res_common'
import { util } from './global'

const pi = Math.PI
const defaultMatrix = 'translate3d(0, 0, 0)'
// [...)
const upRadian = [pi * 1 / 4, pi * 3 / 4]
const leftRadian = [pi * 3 / 4, pi * 5 / 4]
const downRadian = [pi * 5 / 4, pi * 7 / 4]

const keyIcons = [
    'return',
    'packup',
    'enter',
    'unfold',
]

export default class KeyboardRenderer extends Renderer {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        super.componentDidMount()
        this.touchStartHandler = this.onTouchStart.bind(this)
        this.touchMoveHandler = this.onTouchMove.bind(this)
        this.touchEndHandler = this.onTouchEnd.bind(this)
        this.touchCancelHandler = this.onTouchCancel.bind(this)
        this.controllContainer.addEventListener(
            'touchstart',
            this.touchStartHandler,
            { passive: false }
        )
        this.controllContainer.addEventListener(
            'touchmove',
            this.touchMoveHandler,
            { passive: true }
        )
        this.controllContainer.addEventListener(
            'touchend',
            this.touchEndHandler
        )
        this.controllContainer.addEventListener(
            'touchcancel',
            this.touchCancelHandler
        )
        this.lastCaptureMoveTime = 0
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.controllContainer.removeEventListener(
            'touchstart',
            this.touchStartHandler
        )
        this.controllContainer.removeEventListener(
            'touchmove',
            this.touchMoveHandler
        )
        this.controllContainer.removeEventListener(
            'touchend',
            this.touchEndHandler
        )
        this.controllContainer.removeEventListener(
            'touchcancel',
            this.touchCancelHandler
        )
    }

    render() {
        let keys = []
        for (let icon of keyIcons) {
            keys.push(
                <kbd>
                    <svg aria-hidden='true'>
                        <use xlinkHref={'#icon-' + icon}></use>
                    </svg>
                </kbd>
            )
        }
        return <div
            ref={ref => this.controllContainer = ref}
            className={mainStyle.keyboard}>
            <div ref={ref => this.controllPanel = ref}>
                {keys}
                <span ref={ref => this.controllNode = ref}></span>
            </div>
        </div>

    }

    onTouchStart(event) {
        event.preventDefault()
        if (this.controllInfo) {
            return
        }
        let boundingBox = this.controllPanel.getBoundingClientRect()
        this.boundingBox = {
            x: boundingBox.left + boundingBox.width / 2,
            y: boundingBox.top + boundingBox.height / 2,
            width: boundingBox.width,
            height: boundingBox.height
        }
        let touch = event.targetTouches[0]
        this.controllInfo = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            identifier: touch.identifier,
            keyDownEvent: null,
            action: null
        }
        let x = touch.clientX - this.boundingBox.x
        let y = touch.clientY - this.boundingBox.y
        this.controllPanel.style.transform =
            'translate3d(' + x + 'px, ' + y + 'px, 0)'
    }

    onTouchMove(event) {
        // event.preventDefault()
        let now = util.time()
        let diff = now - this.lastCaptureMoveTime
        if (diff < keyboardMoveCaptureInterval) {
            return
        }
        let touch = this.getStartTouch(event.changedTouches)
        if (!touch) {
            return
        }
        this.lastCaptureMoveTime = now
        let x1 = touch.clientX
        let y1 = touch.clientY
        let x2 = this.controllInfo.clientX
        let y2 = this.controllInfo.clientY
        let x = (x1 - x2) / 2
        let y = (y1 - y2) / 2
        this.controllNode.style.transform =
            'translate3d(' + x + 'px, ' + y + 'px, 0)'
        let radian = util.getRadian(x1, y1, x2, y2)
        let keyCode = keyCodes.arrowRight
        if (radian >= leftRadian[0] && radian < leftRadian[1]) {
            keyCode = keyCodes.arrowLeft
        } else if (radian >= upRadian[0] && radian < upRadian[1]) {
            keyCode = keyCodes.arrowUp
        } else if (radian >= downRadian[0] && radian < downRadian[1]) {
            keyCode = keyCodes.arrowDown
        }
        let keyDownEvent = this.controllInfo.keyDownEvent
        if (keyDownEvent) {
            if (keyDownEvent.keyCode == keyCode) {
                return
            }
            this.releaseKey()
        }
        keyDownEvent = new KeyboardEvent('keydown', {})
        Object.defineProperty(keyDownEvent, 'keyCode', {
            get: function () {
                return keyCode
            }
        })
        this.controllInfo.keyDownEvent = keyDownEvent
        document.dispatchEvent(keyDownEvent)
    }

    onTouchEnd(event) {
        event.preventDefault()
        let touch = this.getStartTouch(event.changedTouches)
        if (!touch) {
            return
        }
        this.controllPanel.style.transform = defaultMatrix
        this.controllNode.style.transform = defaultMatrix
        this.releaseKey()
        this.controllInfo = null
    }

    onTouchCancel(event) {
        this.onTouchEnd(event)
    }

    releaseKey() {
        if (!this.controllInfo.keyDownEvent) {
            return
        }
        let keyCode = this.controllInfo.keyDownEvent.keyCode
        this.controllInfo.keyDownEvent = null
        let keyUpEvent = new KeyboardEvent('keyup', {})
        Object.defineProperty(keyUpEvent, 'keyCode', {
            get: function () {
                return keyCode
            }
        })
        document.dispatchEvent(keyUpEvent)
    }

    getStartTouch(touches) {
        if (!this.controllInfo) {
            return null
        }
        for (let k in touches) {
            let touch = touches[k]
            if (touch.identifier == this.controllInfo.identifier) {
                return touch
            }
        }
        return null
    }

}