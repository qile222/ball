const deploy = {
    dev: {
        world: {
            addr: 'http://192.168.3.28',
            name: 'Test001',
            port: 12306
        },
        game: [{
            addr: 'http://192.168.3.28',
            name: 'Server1',
            port: 12307
        }],
        chat: {
            addr: 'http://192.168.3.28',
            name: 'Server1',
            port: 12308
        },
        gameAgent: {
            addr: '192.168.3.28',
            port: 12309
        },
        worldAgent: {
            addr: '192.168.3.28',
            port: 12310
        },
        staticAgent: {
            addr: 'http://192.168.3.28',
            port: 12311
        },
    },
    production: {
        world: {
            addr: 'http://192.168.3.28',
            name: 'Default',
            port: 12306
        },
        game: [{
            addr: 'http://192.168.3.28',
            name: 'Server1',
            port: 12307
        }],
        chat: {
            addr: 'http://192.168.3.28',
            name: 'Server1',
            port: 12308
        },
        gameAgent: {
            addr: '192.168.3.28',
            port: 12309
        },
        worldAgent: {
            addr: '192.168.3.28',
            port: 12310
        },
        staticAgent: {
            addr: '192.168.3.28',
            port: 12311
        },
    }
}
module.exports = process.env.NODE_ENV == 'production' ? deploy.production : deploy.dev