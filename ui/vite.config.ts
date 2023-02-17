import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from "vite-plugin-singlefile"
import svg from 'vite-plugin-svgo'

// alternative to write-to-disk while running in dev mode:
// https://stackoverflow.com/a/72695336/483492

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    viteSingleFile(),
    svg({
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false
            }
          }
        },
        { name: 'removeDimensions' }
      ]
    })
  ],
  build: {
    outDir: '../dist'
  }
})
