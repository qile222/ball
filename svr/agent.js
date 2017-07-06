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
        this.server = http.createServer(this.app)
        this.app.use(bodyParser.json())
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', req.headers.origin)
            res.header('Access-Control-Allow-Headers', 'Content-Type')
            res.header('Access-Control-Allow-Methods', 'POST')
            if (req.originalUrl == '/getServer') {
                if (req.method == 'OPTIONS') {
                    res.sendStatus(200)
                } else if (req.method == 'POST') {
                    this.handleGetServer(req, res)
                } else {
                    res.status(404).send('world hello')
                }
            } else {
                res.status(404).send('hello world')
            }
        })
        this.app.listen(port, () => {
            logger.info(`${this.constructor.name} listening on port ${port}`)
            this.emit('initFinished')
        })
    }

    handleGetServer(req, res) {
        res.json(new Message(null, null, 'invalid req'))
    }

}

module.exports = Agent