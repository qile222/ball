const fs = require('fs')
const ncp = require('ncp')
const path = require('path')
const crypto = require('crypto')

function getFileMD5(path) {
    let content
    try {
        content = fs.readFileSync(path)
    } catch (e) {
        return ''
    }
    let fsHash = crypto.createHash('md5')
    fsHash.update(content)
    let md5 = fsHash.digest('hex')
    return md5
}

function ResWebpackPlugin(args) {
    this.projDir = args.projDir
    this.buildDir = args.buildDir
    this.svrDir = args.svrDir
    this.svrDistDir = args.svrDistDir
    this.filesMD5 = []
}

ResWebpackPlugin.prototype.apply = function (compiler) {
    compiler.plugin('compile', () => {
        let svrFiles = fs.readdirSync(this.svrDir)
        svrFiles.forEach(fileName => {
            let filePath = path.resolve(this.svrDir, fileName)
            let state = fs.lstatSync(filePath)
            if (!state.isDirectory() && /^res[_0-9a-z]+\.js$/.test(fileName)) {
                let targetPath = fileName.replace(
                    /res_([_0-9a-z]+)\.js/,
                    path.resolve(this.projDir, 'res_svr_$1.js')
                )
                if (getFileMD5(targetPath) == getFileMD5(filePath)) {
                    return
                }
                let data = fs.readFileSync(filePath)
                fs.writeFileSync(targetPath, data)
            }
        })
    })

    if (this.svrDistDir) {
        compiler.plugin('after-emit', () => {
            ncp(this.buildDir, this.svrDistDir)
        })
    }
}

module.exports = ResWebpackPlugin