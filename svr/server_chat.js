const cache = require('memory-cache')
const Server = require('./server')
const PlayerLogic = require('./logic_player')
const commonRes = require('./res_common')
const protocolRes = require('./res_protocol')
const Message = require('./message')
const logger = require('./logger')
const deployRes = require('./res_deploy')
const Util = require('./util')
const errorCodeRes = require('./res_error_code')
const shortid = require('shortid')

class ChatServer extends Server {

    constructor(id) {
        super(id)
    }

    start(port) {
        super.start(port)
    }

    handleRequest(cliSocket, message) {
        switch (message.head) {
            case protocolRes.newMessageCL:
                this.handleNewMessage(cliSocket, message)
                break

            default:
                super.handleRequest(cliSocket, message)
        }
    }

    handleNewMessage(cliSocket, message) {
        this.socket.send(
            new Message(
                protocolRes.newMessageLC,
                null,
                {
                    content: message.content,
                    playerName: message.playerName,
                    playerID: message.playerID
                }
            )
        )
    }

}

module.exports = ChatServer