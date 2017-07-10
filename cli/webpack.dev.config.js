const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const buildDir = path.resolve(__dirname, 'build/')
const node_modules = path.resolve(__dirname, 'node_modules/')
const fs = require('fs')

//copy server config
const svrDir = path.resolve(__dirname, '../svr')
let svrFiles = fs.readdirSync(svrDir)
svrFiles.forEach(function (fileName) {
    let filePath = svrDir + '/' + fileName
    let state = fs.lstatSync(filePath)
    if (!state.isDirectory() && /^res[_0-9a-z]+\.js$/.test(fileName)) {
        let data = fs.readFileSync(filePath)
        fs.writeFileSync(fileName.replace(/res_([_0-9a-z]+)\.js/, __dirname + '/res_svr_$1.js'), data)
    }
})

const config = {
    entry: {
        main: path.resolve(__dirname, 'main.js'),
        vendors: ['react', 'react-dom', 'react-router', 'seedrandom']
    },
    devtool: 'source-map',
    output: {
        path: buildDir,
        filename: '[name].bundle.js',
        publicPath: 'http://127.0.0.1:8080/dist'
    },
    node: {
        // Buffer: false
    },
    resolve: {
        alias: {
            react: path.resolve(node_modules, 'react/dist/react.min.js'),
            'react-dom': path.resolve(node_modules, 'react-dom/dist/react-dom.min.js'),
            'react-router': path.resolve(node_modules, 'react-router/umd/ReactRouter.min.js'),
            seedrandom: path.resolve(node_modules, 'seedrandom/seedrandom.min.js'),
        },
        extensions: ['.js', '.jsx', '.css', '.less']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'react'],
                        plugins: ['transform-runtime']
                    }
                },
                // use: [
                //     'babel-loader',
                // ],
                exclude: [
                    node_modules,
                    buildDir,
                ],
            }, {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader?modules!less-loader'
                }),
            }, {
                test: /\.(png|jpg)$/,
                loader: 'url-loader',
            }
        ],
        noParse: [
            /react\.min\.js$/,
        ]
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin(),
        new CleanWebpackPlugin(['build']),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, 'template.html'),
            inject: 'body',
            showErrors: true,
            chunks: ['vendors', 'main']
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'vendors.js'
        }),
        new ExtractTextPlugin('[name].css'),
        // new webpack.HotModuleReplacementPlugin()
    ]
}

module.exports = config