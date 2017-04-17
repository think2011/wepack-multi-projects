const rimraf     = require('rimraf')
const options    = require('./index')
const envOptions = options.env

// 删除之前的代码
rimraf.sync(`${envOptions.assetsRoot}/*`)
