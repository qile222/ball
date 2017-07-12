import commonRes from './res_svr_common'

window.DEBUG = true

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
    fastForwardTimeScale: 10,
    initFastForwardTimeScale: 100000000,
    agent: 'http://127.0.0.1:12310/getServer',
}, commonRes)