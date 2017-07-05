import Manager from './manager'
import io from 'socket.io-client'
import protocolRes from './res_protocol'
import {console, eventDispatcher, util, scheduler} from './global'

export default class NetManager extends Manager {

    constructor() {
        super()
        this.connections = {}
        scheduler.schedule(1000, this.heartBeatTest.bind(this))
    }

    heartBeatTest() {
        for (let i in this.connections) {
            this.connections[i].lastHeartBeatTime = util.time()
            this.connections[i].socket.send({
                head: protocolRes.heartbeatCS
            })
        }
    }

    send(name, message) {
        let connection = this.connections[name]
        for (let key in protocolRes) {
            if (protocolRes[key] == message.head) {
                console.log('send ', name, key, message)
                connection.socket.send(message)
                return
            }
        }
        console.error('unknown protocol head ', name, message)
    }

    getConnectionsLag() {
        let ret = []
        for (let i in this.connections) {
            ret.push({
                name: this.connections[i].name,
                lag: this.connections[i].lag,
            })
        }
        return ret
    }

    disconnectAll() {
        for (let i in this.connections) {
            this.connections[i].socket.disconnect()
        }
        this.connections = {}
    }

    disconnect(name) {
        if (this.connections[name]) {
            this.connections[name].socket.disconnect()
            delete this.connections[name]
        }
    }

    connect(name, addr, handshake) {
        if (this.connections[name]) {
            return
        }
        console.log('trying to connect ' + addr + ' ' + handshake)
        let socket = io(addr, {
            reconnection: false,
            query: handshake,
            forceNew: true
        })
        socket.on('message', this.onMessage.bind(this, name))
        socket.on('connect', this.onConnect.bind(this, name))
        socket.on('connect_timeout', this.onConnectTimeout.bind(this, name))
        socket.on('connect_error', this.onConnectError.bind(this, name))
        socket.on('error', this.onError.bind(this, name))
        socket.on('disconnect', this.onDisconnect.bind(this, name))
        this.connections[name] = {
            name: name,
            addr: addr,
            handshake: handshake,
            socket: socket,
            lag: -1,
            lastHeartBeatTime: util.time()
        }

        return name
    }

    onMessage(name, message) {
        if (typeof (message) == 'object' && typeof (message.head) == 'number') {
            let headStr = this.getHeadStr(message.head)
            if (headStr && !message.error) {
                this.handleMessageData(name, headStr, message)
            } else {
                this.handleMessageError(name, headStr, message)
            }
        } else {
            console.error('error message', message)
        }
    }

    onConnect(name) {
        let connection = this.connections[name]
        connection.lag = util.time() - connection.lastHeartBeatTime
        console.log('net on connect', name)
    }

    onConnectTimeout(name, data) {
        delete this.connections[name]
        console.log('net connect timeout', name, data)
    }

    onConnectError(name, data) {
        delete this.connections[name]
        console.log('net connect error', name, data)
    }

    onError(name, data) {
        console.log('net error', name, data)
    }

    onDisconnect(name, data) {
        console.log('net on disconnect', name)
        eventDispatcher.emit(this, 'net_disconnect', name)
    }

    handleMessageData(name, headStr, message) {
        if (message.head == protocolRes.heartbeatSC) {
            let connection = this.connections[name]
            connection.lag = util.time() - connection.lastHeartBeatTime
            return
        }
        if (message.head != protocolRes.frameDataGC) {
            console.log('message', headStr, message)
        }
        eventDispatcher.emit(this, 'net_message', name, message)
    }

    handleMessageError(name, headStr, message) {
        console.error('error message ', name, headStr, message)
        eventDispatcher.emit(this, 'net_error', name)
    }

    getHeadStr(head) {
        for (let key in protocolRes) {
            if (protocolRes[key] == head) {
                return key
            }
        }
    }

    onRuntimeError() {
        this.disconnectAll()
    }

}