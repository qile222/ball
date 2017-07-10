export default class MemCache {

    constructor() {
        this.clear()
    }

    get(k) {
        return this.cache[k]
    }

    set(k, v) {
        this.cache[k] = v
    }

    clear() {
        this.cache = {}
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