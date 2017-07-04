class Token {

    constructor(id, playerID, expireTime, ex) {
        this.id = id
        this.playerID = playerID
        this.expireTime = expireTime
        this.ex = ex
    }

    getID() {
        return this.id
    }

    getPlayerID() {
        return this.playerID
    }

    getEx() {
        return this.ex
    }

    getExpireTime() {
        return this.expireTime
    }

    setExpireTime(expireTime) {
        this.expireTime = expireTime + Date.now()
    }
}

module.exports = Token