export default class MemCache {

    constructor() {
        this.cache = {}
    }

    get(k) {
        return this.cache[k]
    }

    set(k, v) {
        this.cache[k] = v
    }

    // setPlayerInfo(playerInfo) {
    //     this.playerInfo = playerInfo
    // }

    // getPlayerInfo() {
    //     return this.playerInfo
    // }

    // setTime(time) {

    // }

    // getTime() {
    //     return this.serverTime
    // }

}