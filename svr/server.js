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

// // sending to sender-client only
// socket.emit('message', "this is a test");
// // sending to all clients, include sender
// io.emit('message', "this is a test");
// // sending to all clients except sender
// socket.broadcast.emit('message', "this is a test");
// // sending to all clients in 'game' room(channel) except sender
// socket.broadcast.to('game').emit('message', 'nice game');
// // sending to all clients in 'game' room(channel), include sender
// io.in('game').emit('message', 'cool game');
// // sending to sender client, only if they are in 'game' room(channel)
// socket.to('game').emit('message', 'enjoy the game');
// // sending to all clients in namespace 'myNamespace', include sender
// io.of('myNamespace').emit('message', 'gg');
// // sending to individual socketid
// socket.broadcast.to(socketid).emit('message', 'for your eyes only');

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
            res.send(req.query.cb + '({message:"success"});')
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