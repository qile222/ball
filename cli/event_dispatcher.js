import commonRes from './res_common'
const runningStates = commonRes.runningStates

export default class EventDispatcher {

    constructor() {
        this.events = {}
    }

    addListener(target, eventName, observer, callback, isOnce) {
        let event = this.events[eventName]
        if (!event) {
            event = {
                name: eventName,
                listeners: [],
                state: runningStates.running
            }
            this.events[eventName] = event
        } else {
            let listeners = event.listeners
            for (let listener of listeners) {
                if (listener.observer == observer &&
                    listener.state != runningStates.stop) {
                    throw new Error('')
                }
            }
        }
        event.listeners.push({
            target: target,
            observer: observer,
            callback: callback.bind(observer),
            isOnce: isOnce
        })
    }

    addListenerOnce(target, eventName, observer, callback) {
        this.addListener(target, eventName, observer, callback, true)
    }

    removeListener(observer, eventName) {
        function doRemove(event) {
            for (let listener of event.listeners) {
                if (listener.observer == observer) {
                    listener.state = runningStates.stop
                    return
                }
            }
        }
        if (eventName) {
            let event = this.events[eventName]
            if (event) {
                doRemove(event)
            }
        } else {
            for (let i in this.events) {
                doRemove(this.events[i])
            }
        }
    }

    emit(target, eventName, ...param) {
        let event = this.events[eventName]
        if (event) {
            let listeners = event.listeners
            let length = listeners.length
            for (let i = 0; i < length; ++i) {
                let listener = listeners[i]
                if (listener.state == runningStates.stop) {
                    listeners.splice(i, 1)
                    --length
                    --i
                } else {
                    if (!listener.target || listener.target == target) {
                        if (listener.isOnce) {
                            listener.state = runningStates.stop
                        }
                        listener.callback(target, ...param)
                    }
                }
            }
        }
    }

}