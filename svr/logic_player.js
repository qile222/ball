let playerState = require('./res_common').playerState
class Player {

    constructor(id, name) {
        this.id = id
        this.name = name
        this.state = playerState.online
        this.gamingRoom = null
        this.delay = 1024
    }

    getName() {
        return this.name
    }

    setName(name) {
        this.name = name
    }

    getState() {
        return this.state
    }

    setState(state) {
        this.state = state
    }

    getGameingRoom() {
        return this.gamingRoom
    }

    setGamingRoom(room) {
        this.gamingRoom = room
    }

    getID() {
        return this.id
    }

    setID(id) {
        this.id = id
    }

    getDelay() {
        return this.delay
    }

    setDelay(delay) {
        this.delay = delay
    }

}

module.exports = Player