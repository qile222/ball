import Renderer from './renderer'
import ReactDOM from 'react-dom'
import React from 'react'
import mainStyle from './style_main'
import {eventDispatcher} from './global'

export default class DialogRenderer extends Renderer {

    constructor(props) {
        super(props)
        this.node = null
    }

    componentDidUpdate(prevProps, prevState) {
        super.componentDidUpdate()
        this.openDialog()
    }

    componentDidMount() {
        super.componentWillMount()
        this.componentDidUpdate()
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.closeDialog()
    }

    openDialog() {
        if (!this.node) {
            this.node = document.createElement('div')
            this.node.className = mainStyle.dialog
            document.body.appendChild(this.node)
        }
        let components = []
        if (this.state.title) {
            components.push(
                <div className={mainStyle.dialogTitle}>
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
            <div className={mainStyle.gameSettingDialog}>{components}</div>,
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

    renderContent() {
        return null
    }

    onClickClose() {
        eventDispatcher.emit(this, this.constructor.name + '_close')
    }

    render() {
        return null
    }

}