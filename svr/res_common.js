module.exports = {
    playerState: {
        online: 0,
        gaming: 1,
    },
    keyFrameInterval: 100,
    gameState: {
        playing: 0,
        ending: 1,
        ended: 2
    },
    roomEntityLimit: 20,
    roomCreateExpireTime: 5000,
    mapDefaultSize: {
        width: 2400,
        height: 2400
    },
    mapRandomEntityLimit: 200,
    gameOverTime: 1500000,
    gameEndTime: 1000000,
    epsilon: 0.000001,
    eatAddRadiusRatio: 0.1,
    entityInitTime: 3000,
    nameMaxLength: 8,
}