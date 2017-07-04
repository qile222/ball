const fs = require('fs')
const shortid = require('shortid')
const cache = require('memory-cache')
const commonRes = require('./res_common')
const deployRes = require('./res_deploy')
const WorldServer = require('./server_world')
const logger = require('./logger')
const GameAgent = require('./agent_game')
const GameServer = require('./server_game')
const WorldAgent = require('./agent_world')

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
    --initCount
    if (initCount < 1) {
        logger.info(`all servers inited, open ${deployRes.world.addr}:${deployRes.world.port} to play`)
    }    
}

let worldServer = new WorldServer(shortid.generate())
worldServer.start(deployRes.world.port)
worldServer.on('initFinished', initListener)
cache.put('worldServer', {
    id: worldServer.getID(),
    addr: deployRes.world.addr,
    port: deployRes.world.port,
    name: deployRes.world.name
})
++initCount

let gameServers = []
for (let i in deployRes.game) {
    let gameServer = new GameServer(shortid.generate())
    gameServer.start(deployRes.game[i].port)
    gameServers.push({
        id: gameServer.getID(),
        addr: deployRes.game[i].addr,
        port: deployRes.game[i].port,
        name: deployRes.game[i].name
    })
    gameServer.on('initFinished', initListener)
    ++initCount
}
cache.put('gameServers', gameServers)

let gameAgent = new GameAgent(deployRes.gameAgent.port)
gameAgent.on('initFinished', initListener)
++initCount

let worldAgent = new WorldAgent(deployRes.worldAgent.port)
worldAgent.on('initFinished', initListener)
++initCount

