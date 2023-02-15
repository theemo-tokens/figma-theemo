module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      '@swc-node/jest',
      {
        swc: {
          module: {
            type: 'es6'
          }
        }
      }
    ]
  },
  // transform: {
  //   "^.+\\.ts$": "esbuild-jest"
  // },
  setupFiles: ['./tests/setup.ts']
};