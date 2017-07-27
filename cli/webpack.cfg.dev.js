const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const buildDir = path.resolve(__dirname, 'build/')
const node_modules = path.resolve(__dirname, 'node_modules/')
const ResWebpackPlugin = require ('./webpack.plugin.res.js')
const svrDir = path.resolve(__dirname, '../svr/')

const config = {
    entry: {
        main: path.resolve(__dirname, 'main.js'),
        vendors: ['react', 'react-dom', 'seedrandom']
    },
    devtool: 'source-map',
    output: {
        path: buildDir,
        filename: '[name].bundle.js',
    },
    resolve: {
        alias: {
            react: path.resolve(node_modules, 'react/dist/react.min.js'),
            'react-dom': path.resolve(node_modules, 'react-dom/dist/react-dom.min.js'),
            seedrandom: path.resolve(node_modules, 'seedrandom/seedrandom.min.js'),
        },
        extensions: ['.js', '.jsx', '.css', '.less']
    },
    module: {
        rules: [
            {
                test: /^(?!webpack\.|\.).*\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'react'],
                        plugins: ['transform-runtime']
                    }
                },
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
        new ResWebpackPlugin({
            projDir: __dirname,
            buildDir: buildDir,
            svrDir: svrDir,
        }),
        new webpack.SourceMapDevToolPlugin(),
        new CleanWebpackPlugin([buildDir]),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, 'template.html'),
            inject: 'body',
            showErrors: true,
            chunks: ['vendors', 'main'],
            loginAgent: 'http://127.0.0.1:12310/getServer'
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