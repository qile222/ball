import Renderer from './renderer'
import React from 'react'

export default class WolrdRenderer extends Renderer {

    constructor(props) {
        super(props)
        this.state = { liked: false }
    }

    render() {
        return <p onClick={this.handleClick.bind(this)}>
            You {this.text} this. Click to toggle.ha
        </p>
    }
}