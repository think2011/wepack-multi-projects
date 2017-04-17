const path = require('path')
const root = path.resolve(__dirname, '..')


let assetsRoot = path.resolve(root, '../xgift-buyer-mobile/target/xgift-buyer-mobile-1.0.0-SNAPSHOT')
let appsRoot   = `${assetsRoot}/WEB-INF/views/apps`
let staticName = 'static'
let staticRoot = `${assetsRoot}/${staticName}`

let options = {
    root,
    appsRoot,
    staticRoot,

    dev: {
        env               : 'development',
        devtool           : 'cheap-eval-source-map',
        assetsRoot,
        assetsSubDirectory: staticName,
        assetsPublicPath  : '/',
        autoOpen          : false, // 是否自动启动浏览器
        proxyUrl          : 'localhost:8080' // 代理后端地址
    },

    build: {
        env               : 'production',
        devtool           : false,
        assetsRoot,
        assetsSubDirectory: staticName,
        assetsPublicPath  : '//res.cxb123.com/qhd/', // CDN地址
    }
}

options.env    = process.env.NODE_ENV === 'production' ? options.build : options.dev
module.exports = options