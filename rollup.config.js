import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import svg from 'rollup-plugin-svg';
import typescript from '@rollup/plugin-typescript';

/* Post CSS */
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';

/* Inline to single html */
import htmlBundle from 'rollup-plugin-html-bundle';

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'ui-svelte/main.js',
    output: {
      format: 'iife',
      name: 'ui',
      file: 'build/ui.js',
    },
    plugins: [
      svelte({
        // enable run-time checks when not in production
        dev: !production,
      }),

      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration —
      // consult the documentation for details:¡
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: (importee) =>
          importee === 'svelte' || importee.startsWith('svelte/'),
        extensions: ['.svelte', '.mjs', '.js', '.json', '.node'],
      }),
      typescript({
        tsconfig: 'ui-svelte/tsconfig.json'
      }),
      commonjs(),
      svg(),
      postcss({
        extensions: ['.css'],
        plugins: [cssnano()],
      }),
      htmlBundle({
        template: 'ui-svelte/main.html',
        target: 'dist/ui.html',
        inline: true,
      }),

      // In dev mode, call `npm run start` once
      // the bundle has been generated
      !production && serve(),

      // Watch the `dist` directory and refresh the
      // browser on changes when not in production
      !production && livereload('public'),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      // production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  },
  {
    input: 'plugin/src/main.ts',
    output: {
      file: 'dist/main.js',
      // dir: 'dist',
      format: 'cjs',
      name: 'code'
    },
    plugins: [
      resolve(),
      typescript({
        tsconfig: 'plugin/tsconfig.json'
      }),
      // ts({
      //   transpiler: "swc",
      //   tsconfig: 'plugin/tsconfig.json'
      //   // browserslist: ["last 1 version", "> 1%"],
      //   // swcConfig: {
      //   //   minify: true
      //   // }
      // }),
      commonjs()
      /*, commonjs(), production && terser()*/]
  },
];

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        });
      }
    },
  };
}
