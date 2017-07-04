import commonRes from './res_svr_common'
module.exports = Object.assign({
    fps: Math.floor(1000/60),
    gridPixel: 30,
    runningStates: {
        stop: 0,
        running: 1,
        pause: 2
    },
    lifeCycle: {
        init: 1,
        live: 2,
        die: 3,
    },
    gameState: {
        pendding: 0,
        playing: 1,
        ended: 2
    },
    fastForwardTimeScale: 4,
    eatAniTime: 500,
    eatAniRadians: Math.PI,
    gameGridBorderColor:'#2a2a2a',
    gameGridBackgroundColor: '#252525',
    agent: 'http://127.0.0.1:12310/getServer',
}, commonRes)