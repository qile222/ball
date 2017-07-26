const cache = require('memory-cache')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const EventEmittter = require('events').EventEmitter
const Server = require('./server')
const commonRes = require('./res_common')
const protocolRes = require('./res_protocol')
const Message = require('./message')
const logger = require('./logger')
const Agent = require('./agent')

const tokenExpireTime = 5 * 60
const tokenInspectRule = '60 * * * *'

class WorldAgent extends Agent {

    constructor(port) {
        super(port)
    }

    handleRequest(req, res, next) {
        res.status(404).send(`${this.constructor.name} unknown url`)
    }

}

module.exports = WorldAgent
