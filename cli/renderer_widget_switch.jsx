import React from 'react'
import Renderer from './renderer'
import mainStyle from './style_main'

export default class SwitchWidgetRenderer extends Renderer {

    constructor(props) {
        super(props)
        this.state = {
            selectedIdx: props.selectedIdx || 0
        }
    }

    componentWillMount() {

    }

    render() {
        let titles = this.props.titles
        let titleRenderers = []
        for (let i in titles) {
            titleRenderers.push(
                <span {...{
                    onClick: this.onClickTitle.bind(this),
                    'data-selected': i == this.state.selectedIdx ? '' : null
                }}>
                    {titles[i]}
                </span> 
            )
        }
        return <div className={mainStyle.switchPanel}>
            <div>{titleRenderers}</div>
            {this.props.contentAtIdx(this.state.selectedIdx)}
        </div>
    }

    onClickTitle(e) {
        let child = e.target
        if (typeof child.dataset.selected == 'undefined') {
            let idx = 0
            while ((child = child.previousSibling) && ++idx);
            this.setState({
                selectedIdx: idx
            })
        }
    }

}