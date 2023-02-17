const { config } = require('@swc/core/spack')


module.exports = config({
  entry: {
    main: __dirname + '/src/main.ts',
  },
  output: {
    path: __dirname + '/../dist'
  },
  module: {},
});