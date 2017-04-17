const rimraf  = require('rimraf')
const options = require('./index')

// 删除之前的代码
rimraf.sync(`${options.appsRoot}/*`)
rimraf.sync(`${options.staticRoot}/*`)