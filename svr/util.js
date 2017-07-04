const http = require('http')
const logger = require('./logger')
const expTags = {
    '&': '&amp',
    '<': '&lt',
    '>': '&gt',
}

class Util {

    static time() {
        return Date.now()
    }

    static post(options, data, next) {
        function handleResponse(res) {
            let total = 0
            let chunks = []
            res.on('data', chunk => {
                total += chunk.length
                chunks.push(chunk)
            })
            res.on('end', () => {
                let buf = Buffer.concat(chunks, total).toString('utf8')
                next(null, buf)
            })
        }

        let req = http.request(options, next ? handleResponse : null)
        req.on('error', next)
        req.write(data)
        req.end()
        //todo handle timeout
        if (options.timeout) {

        }
    }

    static postServer(server, path, data, next) {
        let str = JSON.stringify(data)
        let options = {
            hostname: server.addr,
            port: server.port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(str, 'utf8')
            }
        }
        Util.post(options, str, (error, data) => {
            if (!error) {
                try {
                    next(null, JSON.parse(data))
                } catch (e) {
                    next(e)
                }

            } else {
                next(error)
            }
        })
    }

    static escape(str) {
        return str.replace(/[&<>]/g, (tag) => {
            return expTags[tag] ? '' : tag
        })
    }
}

module.exports = Util