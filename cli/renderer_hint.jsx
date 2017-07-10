import React from 'react'
import mainStyle from './style_main'
import {scheduler} from './global'

export default class Renderer extends React.Component {

    constructor(props) {
        super(props)
        scheduler.scheduleOnce(3000, this.props.willRemoveHint)
    }

    render() {
        return <div className={mainStyle.hint}>{this.props.hint}</div>
    }

}