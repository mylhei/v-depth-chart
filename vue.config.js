const path = require('path')
const debug = process.env.NODE_ENV !== 'production'

module.exports = {
  'css': {
    'extract': false
  },
  'pages': {
    index: {
      entry: './example/main.ts',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  chainWebpack: (config) => {
    config.module
      .rule('js')
      .include.add(path.resolve(__dirname, 'package')).end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        return options
      })
  }
  // configureWebpack: (config) => {
  //   if (!debug) {
  //     config.output.libraryExport = 'default'
  //   }
  // }
}
