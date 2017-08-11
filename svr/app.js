const fs = require('fs')
const shortid = require('shortid')
const cache = require('memory-cache')
const commonRes = require('./res_common')
const deploy = require('./deploy')
const WorldServer = require('./server_world')
const logger = require('./logger')
const GameAgent = require('./agent_game')
const GameServer = require('./server_game')
const WorldAgent = require('./agent_world')
const ChatServer = require('./server_chat')
const StaticAgent = require('./agent_static')

logger.info('mode => ', process.env.NODE_ENV)

if (process.env.mode == 'production') {
    process.on('uncaughtException', error => {
        logger.error(error)
    })
} else {
    cache.debug(true)
    logger.debug(true)
    process.on('uncaughtException', error => {
        logger.error(error)
        logger.error('exiting....')
        process.exit(1)
    })
}

fs.writeFileSync(__dirname + '/pid', process.pid)

logger.info('using memory cache')
cache.put('players', {})
cache.put('tokens', {})

let initCount = 0

function initListener() {
    ++initCount
    if (initCount >= tasks.length) {
        logger.info(`init finished`)
    }
}

let tasks = [
    function () {
        let worldServer = new WorldServer(shortid.generate())
        worldServer.start(deploy.world.port)
        worldServer.on('initFinished', initListener)
        cache.put('worldServer', {
            id: worldServer.getID(),
            addr: deploy.world.addr,
            port: deploy.world.port,
            name: deploy.world.name
        })
    },
    function() {
        let gameServers = []
        for (let i in deploy.game) {
            let gameServer = new GameServer(shortid.generate())
            gameServer.start(deploy.game[i].port)
            gameServers.push({
                id: gameServer.getID(),
                addr: deploy.game[i].addr,
                port: deploy.game[i].port,
                name: deploy.game[i].name
            })
            gameServer.on('initFinished', initListener)
        }
        cache.put('gameServers', gameServers)
    },
    function() {
        let chatServer = new ChatServer(shortid.generate())
        chatServer.start(deploy.chat.port)
        chatServer.on('initFinished', initListener)
        cache.put('chatServer', {
            id: chatServer.getID(),
            addr: deploy.chat.addr,
            port: deploy.chat.port,
            name: deploy.chat.name
        })
    },
    function() {
        let gameAgent = new GameAgent(deploy.gameAgent.port)
        gameAgent.on('initFinished', initListener)
    },
    function() {
        let worldAgent = new WorldAgent(deploy.worldAgent.port)
        worldAgent.on('initFinished', initListener)
    },
    function() {
        let staticAgent = new StaticAgent(deploy.staticAgent.port)
        staticAgent.on('initFinished', initListener)
    },
]

for (let task of tasks) {
    task()
}