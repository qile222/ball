const protocol = {
    /***************error*****************/
    error: -1,
    pingCW: 0,
    pingWC: 1,

    /***************world server*****************/
    playerInfoWC: 10000,
    getGameServerCW: 10001,
    getGameServerWC: 10002,

    /***************game server*****************/
    createMapGC: 20009,
    createMapCG: 20010,
    frameDataGC: 20011,
    frameDataCG: 20012,
    gameEndCG: 20013,
    gameEndGC: 20014,
    settlementCG: 20015,
    settlementGC: 20016,
}

module.exports = protocol