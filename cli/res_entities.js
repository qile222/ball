module.exports = {
    '10000': {
        id: 10000,
        name: 'Circle',
        speed: 0.075,
        states: ['move', 'eat'],
        radius: 15,
        probability: 0,
        isFood: true,
        ext: {

        }
    },
    '10001': {
        id: 10001,
        name: 'Polygon',
        speed: 0,
        states: [],
        radius: 7,
        probability: 20,
        isFood: true,
        ext: {
            sideCount: 3
        }
    },
    '10002': {
        id: 10002,
        name: 'Polygon',
        speed: 0,
        states: [],
        radius: 8,
        probability: 20,
        isFood: true,
        ext: {
            sideCount: 4
        }
    },
    '10003': {
        id: 10003,
        name: 'Polygon',
        speed: 0,
        states: [],
        radius: 9,
        probability: 20,
        isFood: true,
        ext: {
            sideCount: 5
        }
    },
    '10004': {
        id: 10004,
        name: 'Polygon',
        speed: 0,
        states: [],
        radius: 10,
        probability: 20,
        isFood: true,
        ext: {
            sideCount: 6
        }
    },
    '10005': {
        id: 10005,
        name: 'Saboteur',
        speed: 0,
        states: ['split'],
        radius: 20,
        probability: 20,
        isFood: false,
        ext: {
            sideCount: 8,
            sideWidth: 3,
            rotateAniTime: 1000
        }
    }
}