let moment = require('moment')
let winston = require('winston')

let stackTrace = ''
let updateStackTrace = function () {
    let obj = {}
    Error.captureStackTrace(obj, updateStackTrace)
    stackTrace = obj.stack.split(/\n+/)[2].replace(/(.*)\((.*)\)$/, '$2')
}

winston.configure({
    transports: [
        new (winston.transports.Console)({
            timestamp: function () {
                return Date.now();
            },
            formatter: function (options) {
                return options.level.toUpperCase() +
                    ' ' + moment().format('YYYY-MM-DD HH:mm:ss.SSS') + ' ' + stackTrace + ' ' +
                    (options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            }
        })
    ]
});
let impl = winston

class Logger {

    static setImpl(logger) {
        impl = logger
    }

    static debug(isDebug) {

    }

    static info(...args) {
        updateStackTrace()
        impl.info.apply(impl, args)
    }

    static warn(...args) {
        updateStackTrace()
        impl.warn.apply(impl, args)
    }

    static error(...args) {
        updateStackTrace()
        impl.error.apply(impl, args)
    }

}

module.exports = Logger