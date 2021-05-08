import esbuild from 'rollup-plugin-esbuild';
import jsonPlugin from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import builtins from 'builtin-modules';
import pkg from './package.json';

const external = [
  ...builtins,
  ...Object.keys(pkg.dependencies || {})
];

const esbuildPlugin = (options = {}) => {
  return esbuild({
    watch: process.argv.includes('--watch'),
    minify: false,
    bundle: true,
    write: true,
    target: 'es2017',
    sourcemap: true,
    platform: 'node',
    ...options
  })
};

export default [
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/main.js',
      format: 'es',
      exports: 'auto'
    },
    external,
    plugins: [jsonPlugin(), nodeResolve(), esbuildPlugin()],
    watch: {
      include: 'src/**'
    }
  },
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/main.min.js',
      format: 'es',
      exports: 'auto'
    },
    external,
    plugins: [jsonPlugin(), nodeResolve(), esbuildPlugin({minify: true})],
    watch: {
      include: 'src/**'
    }
  }
//   {
//   input: 'src/index.ts',
//   output: [
//     {
//       file: 'dist/theemo.cjs.development.js',
//       format: 'cjs',
//       plugins: [
//         esbuild({

//         })
//       ]
//     },
//     // {
//     //   file: 'dist/bundle-b2.js',
//     //   format: 'es'
//     // }
//   ]
// }
];