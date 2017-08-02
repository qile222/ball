import commonRes from './res_svr_common'

module.exports = Object.assign({
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
    fastForwardTimeScale: 6,
    initFastForwardTimeScale: 100000000,
    keyCodes : {
        arrowLeft: 37,
        arrowUp: 38,
        arrowRight: 39,
        arrowDown: 40,
    },
    keyboardMoveCaptureInterval: 100
}, commonRes)
