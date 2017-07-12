const protocol = {
    /***************error*****************/
    error: -1,
    heartbeatCS: 0,
    heartbeatSC: 1,

    /***************world server*****************/
    playerInfoCW: 10001,
    playerInfoWC: 10001,
    getGameServerCW: 10002,
    getGameServerWC: 10003,

    /***************game server*****************/
    createMapCG: 20009,
    createMapGC: 20010,
    frameDataCG: 20011,
    frameDataGC: 20012,
    gameEndCG: 20013,
    gameEndGC: 20014,
    sendGameDataCG: 20015,
    sendGameDataGC: 20016,
    abnormalCG: 20018,
    abnormalGC: 20018,

    /***************chat server*****************/
    newMessageCL: 30001,
    newMessageLC: 30002,
    newSysMessageCL: 30003,
    newSysMessageLC: 30004,
}

module.exports = protocol