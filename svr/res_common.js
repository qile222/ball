module.exports = {
    playerState: {
        online: 0,
        gaming: 1,
    },
    keyFrameInterval: 100,
    gameState: {
        pendding: 0,
        playing: 1,
        ended: 2,
        initing: 3,
    },
    roomEntityLimit: 1024768,
    roomCreateExpireTime: 5000,
    mapDefaultSize: {
        width: 2000,
        height: 2000
    },
    mapRandomEntityLimit: 150,
    gameOverTime: 155000,
    gameEndTime: 150000,
    epsilon: 0.000001,
    eatAddRadiusRatio: 0.1,
    entityInitTime: 3000,
    nameMaxLength: 8,
}