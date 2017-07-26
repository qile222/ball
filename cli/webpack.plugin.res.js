const fs = require('fs')
const ncp = require('ncp')
const path = require('path')

function ResWebpackPlugin(args) {
    this.projDir = args.projDir
    this.buildDir = args.buildDir
    this.svrDir = args.svrDir
    this.svrDistDir = args.svrDistDir
}

ResWebpackPlugin.prototype.apply = function (compiler) {
    compiler.plugin('compile', () => {
        let svrFiles = fs.readdirSync(this.svrDir)
        svrFiles.forEach(fileName => {
            let filePath = path.resolve(this.svrDir, fileName)
            let state = fs.lstatSync(filePath)
            if (!state.isDirectory() && /^res[_0-9a-z]+\.js$/.test(fileName)) {
                let data = fs.readFileSync(filePath)
                fs.writeFileSync(fileName.replace(/res_([_0-9a-z]+)\.js/, path.resolve(this.projDir, 'res_svr_$1.js')), data)
            }
        })
    })

    compiler.plugin('after-emit', () => {
        if (this.svrDistDir) {
            ncp(this.buildDir, this.svrDistDir)
        }
    })
}

module.exports = ResWebpackPlugin