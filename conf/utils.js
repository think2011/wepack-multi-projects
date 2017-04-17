const path              = require('path')
const glob              = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const options           = require('./index')
const envOptions        = options.env

let srcDir  = `${options.root}/src`
let entries = null

module.exports = {
    getEntries: function () {
        if (entries) {
            return entries
        } else {
            entries = glob
                .sync(`${srcDir}/apps/*/index.js`)
                .reduce((cur, next) => {
                    const file    = path.parse(next)
                    const dirName = file.dir.split(/\\|\//).pop()

                    cur[dirName] = next
                    return cur
                }, {})

            return entries
        }
    },

    createHtmlTpl: function () {
        entries = this.getEntries()

        let ext = process.env.MODE || 'jsp'

        return Object.keys(entries).map((name) => {
            let file = entries[name]
            let conf = {
                filename      : `${options.appsRoot}/${name}/index.${ext}`,
                template      : `${path.dirname(file)}/index.html`,
                chunks        : [name],
                chunksSortMode: 'dependency'
            }
            if (process.env.NODE_ENV === 'production') {
                conf.minify = {
                    removeComments       : true,
                    collapseWhitespace   : true,
                    removeAttributeQuotes: true
                }
            }

            return new HtmlWebpackPlugin(conf)
        })
    },

    assetsPath: function (_path) {
        return path.posix.join(envOptions.assetsSubDirectory, _path)
    }
}