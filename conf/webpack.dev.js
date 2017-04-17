const path              = require('path')
const baseConf          = require('./webpack.base')
const merge             = require('webpack-merge')
const webpack           = require('webpack')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const utils             = require('./utils')
const options           = require('./index')
const compression       = require('compression')
const envOptions        = options.env

let browserConf = {
    open          : envOptions.autoOpen,
    host          : '0.0.0.0',
    notify        : false,
    logFileChanges: false,
    watchOptions  : {ignoreInitial: true},
    files         : [options.appsRoot, options.staticRoot],
    middleware    : [compression()]
}

if (process.env.MODE === 'jsp') {
    browserConf.proxy = envOptions.proxyUrl
} else {
    browserConf.server = {
        baseDir  : envOptions.assetsRoot,
        directory: true
    }
}

module.exports = merge(baseConf, {
    output: {
        path      : envOptions.assetsRoot,
        publicPath: envOptions.assetsPublicPath,
        filename  : utils.assetsPath('js/[name].js'),
    },

    plugins: [
        new BrowserSyncPlugin(browserConf, {reload: false})
    ]
})