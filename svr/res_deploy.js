const deploy = {
    dev: {
        world: {
            addr: 'http://127.0.0.1',
            name: 'Test001',
            port: 12306
        },
        game: [{
            addr: 'http://127.0.0.1',
            name: 'Server1',
            port: 12307
        }],
        chat: {
            addr: 'http://127.0.0.1',
            name: 'Server1',
            port: 12308
        },
        gameAgent: {
            addr: '127.0.0.1',
            port: 12309
        },
        worldAgent: {
            addr: '127.0.0.1',
            port: 12310
        },
        static: {
            addr: 'http://127.0.0.1',
            port: 12311
        },
        chat: {
            addr: 'http://127.0.0.1',
            port: 12312
        }
    },
    production: {
        world: {
            addr: 'http://127.0.0.1',
            name: 'Default',
            port: 12306
        },
        game: [{
            addr: 'http://127.0.0.1',
            name: 'Server1',
            port: 12307
        }],
        chat: {
            addr: 'http://127.0.0.1',
            name: 'Server1',
            port: 12308
        },
        gameAgent: {
            addr: '127.0.0.1',
            port: 12309
        },
        worldAgent: {
            addr: '127.0.0.1',
            port: 12310
        },
        static: {
            addr: '127.0.0.1',
            port: 12311
        },
        chat: {
            addr: 'http://127.0.0.1',
            port: 12312
        }
    }
}
module.exports = process.env.mode == 'production' ? deploy.production : deploy.dev