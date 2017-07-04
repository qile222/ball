const io = require('socket.io-client')
const deployRes = require('./res_deploy')
const protocolRes = require('./res_protocol')
const logger = require('./logger')
const readline = require('readline')
const EventEmitter = require('events').EventEmitter
const seedrandom = require('seedrandom')

let worldio = null
let gameio = null
/*********************** commands ****************************/
const COMMANDS = {
    close: 0, //exit test
    eg: 1, //get game server and enter
    dn: 2, //disconnect
    rn: 3,//reconnect
    mv: 100, //move direction
    fe: 1000, //fire
}

/*********************** init command line ****************************/
let inputEmitter = new EventEmitter()
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.setPrompt('>')
rl.prompt()
rl.on('line', str => {
    if (str == 'close') {
        rl.emit('close')
        return
    }
    rl.prompt()
    let cmds = str.split(' ')
    inputEmitter.emit(COMMANDS[cmds[0]], cmds.slice(1, cmds.length))
});
rl.on('close', () => {
    logger.info('exiting...')
    process.exit(0)
})

let playerData = null
/*********************** init world client ****************************/
function initWorldClient() {
    worldio = io(deployRes.world.addr + ':' + deployRes.world.port)
    worldio.once('connect', () => {
        worldio.send({
            head: protocolRes.getGameServerCW
        })
    })
    worldio.on('message', data => {
        if (typeof data != 'object') {
            logger.error('invalid data type %s', data)
            return
        }
        logger.info('data from world server %j', data)
        switch (data.head) {
            case protocolRes.playerInfoWC:
                playerData = data
                break
            case protocolRes.getGameServerWC:
                initGameClient(data.data)
                break
            default:
                logger.error('unknown data head')
                break
        }

    })
    worldio.on('disconnect', () => {
        logger.info('disconnected')
    });
    worldio.on('connect_error', error => {
        logger.error('connect error %j', error)
    })
    worldio.on('error', error => {
        logger.error('error %j', error)
    })
    worldio.on('reconnect', error => {
        logger.error('reconnect %j', error)
    })
    worldio.on('reconnecting', attempt => {
        logger.error('reconnecting %d', attempt)
    })
    worldio.on('reconnect_error', error => {
        logger.error('reconnect error %j', error)
    })
    worldio.on('reconnect_failed', error => {
        logger.error('reconnect failed %d', error)
    })
}

/*********************** init game client ****************************/
function initGameClient(data) {
    let addr = data.server + ':' + data.port
    gameio = io(addr)
    gameio.once('connect', () => {

    })
    gameio.on('message', data => {
        if (typeof data != 'object') {
            logger.error('invalid data type %s', data)
            return
        }
        logger.info('data from world server %j', data)
        switch (data.head) {
            case protocolRes.getGameServerCW:
            default:
                logger.error('unknown data head')
                break
        }

    })
    gameio.on('disconnect', () => {
        logger.info('disconnected')
    });
    gameio.on('connect_error', error => {
        logger.error('connect error %j', error)
    })
    gameio.on('error', error => {
        logger.error('error %j', error)
    })
    gameio.on('reconnect', error => {
        logger.error('reconnect %j', error)
    })
    gameio.on('reconnecting', attempt => {
        logger.error('reconnecting %d', attempt)
    })
    gameio.on('reconnect_error', error => {
        logger.error('reconnect error %j', error)
    })
    gameio.on('reconnect_failed', error => {
        logger.error('reconnect failed %d', error)
    })
}

initWorldClient()