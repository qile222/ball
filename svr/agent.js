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
        this.whiteList = []

        this.app = express()
        this.server = http.createServer(this.app)
        this.app.use(bodyParser.json())
        this.app.use(this.handleRequest.bind(this))
        this.app.listen(port, () => {
            logger.info(`${this.constructor.name} listening on port ${port}`)
            this.emit('initFinished')
        })
    }

    handleRequest(req, res, next) {
        if (req.headers.origin) {
            let whiteOrigin = this.getAllowOrigin(req.headers.origin)
            if (!whiteOrigin) {
                return res.sendStatus(403)
            }
            res.header('Access-Control-Allow-Origin', whiteOrigin)
            res.header('Access-Control-Allow-Headers', 'Content-Type')
            res.header('Access-Control-Allow-Methods', 'POST')
        }
        if (req.originalUrl == '/getServer') {
            if (req.method == 'OPTIONS') {
                res.sendStatus(200)
            } else if (req.method == 'POST') {
                this.handleGetServer(req, res)
            } else {
                res.status(404).send(`${this.constructor.name} unknown method`)
            }
        } else {
            res.status(404).send(`${this.constructor.name} unknown url`)
        }
    }

    handleGetServer(req, res) {
        res.json(new Message(null, null, 'invalid req'))
    }

    getAllowOrigin(origin) {
        if (this.whiteList.length > 0) {
            for (let whiteOrigin of this.whiteList) {
                if (whiteOrigin == origin) {
                    return origin
                }
            }
            return null
        } else {
            return origin
        }
    }

}

module.exports = Agent