const path = require('path')
const root = path.resolve(__dirname, '..')

let options = {
    root,

    dev: {
        env               : 'development',
        assetsRoot        : `${root}/dist/view-apps`,
        assetsSubDirectory: 'static',
        assetsPublicPath  : '/',
        devtool           : 'cheap-eval-source-map',
        autoOpen          : true, // 是否自动启动浏览器
        proxyUrl          : 'localhost:3000' // 代理后端地址
    },

    build: {
        env               : 'production',
        assetsRoot        : `${root}/dist/view-apps`,
        assetsSubDirectory: 'static',
        assetsPublicPath  : '//res.cxb123.com/qhd/', // CDN地址
        devtool           : false,
    }
}

options.env    = process.env.NODE_ENV === 'production' ? options.build : options.dev
module.exports = options