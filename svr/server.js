const io = require('socket.io')
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const EventEmitter = require('events').EventEmitter
const Message = require('./message')
const protocolRes = require('./res_protocol')
const commonRes = require('./res_common')
const errorCodeRes = require('./res_error_code')
const logger = require('./logger')
const shortid = require('shortid')

class Server extends EventEmitter {
    constructor(id) {
        super()
        this.app = null
        this.socket = null
        this.id = id
    }

    getID() {
        return this.id
    }

    start(port) {
        this.app = express()
        this.server = http.createServer(this.app)
        this.socket = io(this.server)
        this.socket.on('connection', this.onConnection.bind(this))
        this.socket.on('connect', this.onConnect.bind(this))
        this.server.listen(port, () => {
            logger.info(`${this.constructor.name} listening on port ${port}`)
            this.emit('initFinished')
        })
        this.app.use((req, res, next) => {
            res.send('hello ' + this.constructor.name)
        })
    }

    disconnect() {

    }

    onConnection(cliSocket) {
        logger.info(`${cliSocket.id} connection`)
        cliSocket.on('message', this.onRequest.bind(this, cliSocket))
        cliSocket.on('disconnect', this.onDisconnect.bind(this, cliSocket))
        cliSocket.on('error', this.onError.bind(this, cliSocket))
        cliSocket.on('disconnecting', this.onDisconnecting.bind(this, cliSocket))
    }

    onConnect(cliSocket) {
        logger.info(`connect ${cliSocket.id}`)
    }

    onDisconnect(cliSocket) {
        logger.info(`${cliSocket.id} disconnect`)
    }

    onError(error) {
        logger.error(`socket error ${JSON.stringify(error)}`)
    }

    onDisconnecting(cliSocket) {
        logger.info(`${cliSocket.id} disconnecting`)
    }

    onRequest(cliSocket, message) {
        if (typeof message == 'object') {
            if (typeof message.head == 'number') {
                this.handleRequest(cliSocket, message)
            } else {
                this.handleErrorRequest(cliSocket, message, errorCodeRes.uselessData)
            }
        } else {
            this.handleErrorRequest(cliSocket, message, errorCodeRes.invalidData)
        }
    }

    handleRequest(cliSocket, message) {
        let head = message.head
        switch (head) {
            case protocolRes.heartbeatCS:
                cliSocket.send(new Message(protocolRes.heartbeatSC, null))
                break

            default:
                this.handleErrorRequest(cliSocket, message, errorCodeRes.uselessRequest)
        }
    }

    handleErrorRequest(cliSocket, message, errorCode) {
        logger.error(errorCode, errorCode, message)
        cliSocket.send(new Message(protocolRes.error, errorCode, message))
    }

    handleErrorLogic(cliSocket, message, errorCode) {
        logger.error(errorCode, errorCode, message)
        cliSocket.send(new Message(message.head, errorCode, message))
    }
}

module.exports = Server