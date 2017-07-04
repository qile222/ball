const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const EventEmittter = require('events').EventEmitter
const Server = require('./server')
const commonRes = require('./res_common')
const protocolRes = require('./res_protocol')
const Message = require('./message')
const logger = require('./logger')

class Agent extends EventEmittter {

    constructor(port) {
        super()
        this.app = express()
        this.app.use(bodyParser.json())
        this.app.use((error, req, res, next) => {
            if (error) {
                res.json(new Message(undefined, null, 'invalid json body'))
            } else {
                next()
            }
        })
        this.server = http.createServer(this.app)
        this.app.post('/getServer', this.getServer.bind(this))
        this.app.listen(port, () => {
            logger.info(`${this.constructor.name} listening on port ${port}`)
            this.emit('initFinished')
        })
    }

    getServer(req, res) {
        res.json(new Message(undefined, null, 'invalid playerID'))
    }

}

module.exports = Agent