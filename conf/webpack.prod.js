const path               = require('path')
const baseConf           = require('./webpack.base')
const merge              = require('webpack-merge')
const webpack            = require('webpack')
const rimraf             = require('rimraf')
const utils              = require('./utils')
const NyanProgressPlugin = require('nyan-progress-webpack-plugin')
const options            = require('./index')
const envOptions         = options.env

module.exports = merge(baseConf, {
    output: {
        path      : envOptions.assetsRoot,
        publicPath: envOptions.assetsPublicPath,
        filename     : utils.assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
    },

    plugins: [
        new NyanProgressPlugin(),

        new webpack.optimize.CommonsChunkPlugin({
            names    : ['vendor', 'manifest'],
            minChunks: function (module, count) {
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                )
            }
        }),

        new webpack.optimize.CommonsChunkPlugin({async: true}),

        new webpack.optimize.UglifyJsPlugin({})
    ]
})