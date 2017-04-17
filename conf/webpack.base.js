const path                 = require('path')
const glob                 = require('glob')
const webpack              = require('webpack')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ExtractTextPlugin    = require('extract-text-webpack-plugin')
const utils                = require('./utils')
const autoprefixer         = require('autoprefixer')
const options              = require('./index')
const envOptions           = options.env

const srcDir     = `${options.root}/src`
const extractCSS = new ExtractTextPlugin({
    filename: utils.assetsPath('css/[name].[contenthash].css'),
    disable : process.env.NODE_ENV !== "production"
})

module.exports = {
    entry: utils.getEntries(),

    devtool: envOptions.devtool,

    resolve: {
        extensions: [".js", ".vue", ".json"],
        modules   : [`${options.root}/node_modules`],
        alias     : {
            "vue$"  : "vue/dist/vue.common.js",
            'assets': `${srcDir}/assets`,
        }
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                use : {loader: "raw-loader"}
            },
            {
                test   : /\.js$/,
                loader : "babel-loader",
                include: [srcDir],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use : extractCSS.extract({
                    fallback: "style-loader",
                    use     : [
                        {loader: "css-loader"},
                        {loader: "postcss-loader"}
                    ]
                })
            },
            {
                test: /\.scss$/,
                use : extractCSS.extract({
                    fallback: "style-loader",
                    use     : [
                        {loader: "css-loader"},
                        {loader: "sass-loader"},
                        {loader: "postcss-loader"}
                    ]
                })
            },
            {
                test  : /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                query : {
                    limit: 10000,
                    name : utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test  : /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                query : {
                    limit: 10000,
                    name : utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    },

    stats: {
        colors      : true,
        modules     : false,
        children    : false,
        chunks      : false,
        chunkModules: false
    },

    plugins: [
        ...utils.createHtmlTpl(),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': process.env.NODE_ENV || 'development'
        }),

        extractCSS,

        new FriendlyErrorsPlugin()
    ]
}