const cache = require('memory-cache')
const shorid = require('shortid')
const scheduler = require('node-schedule')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const EventEmittter = require('events').EventEmitter
const Server = require('./server')
const commonRes = require('./res_common')
const protocolRes = require('./res_protocol')
const Message = require('./message')
const logger = require('./logger')
const Token = require('./token')
const Agent = require('./agent')

const tokenExpireTime = 5 * 60
const tokenInspectRule = '60 * * * *'

class GameAgent extends Agent {

    constructor(port) {
        super(port)
        scheduler.scheduleJob(tokenInspectRule, this.inspectTokens.bind(this))
    }

    getServer(req, res) {
        let playerID = req.body.playerID
        if (!playerID) {
            res.json(new Message(undefined, null, 'invalid playerID'))
            return
        }
        let tokens = cache.get('tokens')
        let token = null
        for (let key in tokens) {
            if (tokens[key].playerId == playerID) {
                token = tokens[key]
                break
            }
        }
        let gameServers = cache.get('gameServers')
        let gameServer = gameServers[Math.floor(Math.random() * gameServers.length)]
        if (token) {
            token.setExpireTime(token_expire_time)
        } else {
            let id = shorid.generate()
            tokens[id] = token = new Token(id, playerID, tokenExpireTime, {gameServerID:gameServer.id})
        }
        let gameServerData = {
            addr: gameServer.addr,
            port: gameServer.port,
            name: gameServer.name,
            token: token.getID(),
        }
        res.json(new Message(undefined, null, gameServerData))
    }

    inspectTokens() {
        let tokens = cache.get('tokens')
        let time = Date.now()
        for (let i in tokens) {
            if (tokens[i].getExpireTime() > time) {
                delete tokens[i]
            }
        }
    }

}

module.exports = GameAgent