import React from 'react'
import {console, eventDispatcher} from './global'

export default class Renderer extends React.Component {

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        // console.log('will mount component', this.constructor.name)
    }

    componentDidMount() {
        console.log('did mount component', this.constructor.name)
    }

    componentWillReceiveProps(nextProps) {
        console.log('will receive props component', this.constructor.name)
    }

    shouldComponentUpdate(nextProps, nextState) {
        // console.log('should update component', this.constructor.name)
        return true
    }

    componentWillUpdate(nextProps, nextState) {
        // console.log('will update component', this.constructor.name)
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('did update component', this.constructor.name)
    }

    componentWillUnmount() {
        console.log('did uncomponent', this.constructor.name)
        eventDispatcher.removeListener(this)
    }

    render() {
        return null
    }

}