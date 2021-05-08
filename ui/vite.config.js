import { defineConfig } from 'vite'
import svelte from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from "vite-plugin-singlefile"
import { resolve } from 'path';
// import svelteSVG from "rollup-plugin-svelte-svg";
// import inlineSvg from 'rollup-plugin-inline-svg';
// import svg from 'rollup-plugin-svg';
import image from '@rollup/plugin-image';
import preprocess from 'svelte-preprocess';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({ preprocess: preprocess() }), viteSingleFile()],
  build: {
    outDir: resolve(__dirname, '..', 'dist'),
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      // input: resolve(__dirname, 'index.html'),
      output: {
        // inlineDynamicImports: true,
        manualChunks: () => "everything.js",
        plugins: [image()]
      }
    }
  }
});
