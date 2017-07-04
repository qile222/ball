module.exports = {
    playerState: {
        online: 0,
        gaming: 1,
    },
    keyFrameInterval: 100,
    gameState: {
        playing: 0,
        settlementing: 1,
        ended: 2
    },
    roomEntityLimit: 20,
    roomCreateExpireTime: 5000,
    mapDefaultSize: {
        width: 2400,
        height: 2400
    },
    mapRandomEntityLimit: 300,
    gameOverTime: 605000,
    settlementTime: 600000,
    numberEplison: 0.000001,
    eatAddRadiusRatio: 0.1,
    entityInitTime: 3000,
    nameMaxLength: 8,
}