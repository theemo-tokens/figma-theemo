import { defineConfig } from 'vite'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, '..', 'dist'),
    lib: {
      entry: resolve(__dirname, 'main.ts'),
      formats: ['es'],
      fileName: 'main'
    },
    // rollupOptions: {
      // input: {
      //   ui: resolve(__dirname, 'ui/index.html')
      // },
      // output: {
      //   inlineDynamicImports: true,
      //   }
        // output: {
        //   manualChunks: (entry) => {
        //     if (entry.includes('ui')) {
        //       return 'index.html'
        //     }

        //     if (entry.includes('src')) {
        //       return 'main.js';
        //     }
        //     // console.log(entry);
        //     // return 'index.html'
        //   }
        // }
      // }
    
    // rollupOptions: {
    //   input: {
    //     ui: resolve(__dirname, 'ui/index.html'),
    //     main: resolve(__dirname, 'src/main.ts'),
    //   },
    //   output: [
    //     {
    //       // file: 'ui.html',
    //       format: 'es'
    //     },
    //     {
    //       // file: 'main.js',
    //       format: 'es'
    //     }
    //   ]
    // }

      // output: {
      //   manualChunks: (entry) => {
      //     if (entry.includes('ui')) {
      //       return 'index.html'
      //     }

      //     if (entry.includes('src')) {
      //       return 'main.js';
      //     }
      //     // console.log(entry);
      //     // return 'index.html'
      //   }
      // }
      // outputOptions: {
      //   inlineDynamicImports: true,
      //   manualChunks: () => "index.html",
      // },
    }
    // rollupOptions: {
      // input: {
      //   ui: resolve(__dirname, 'ui/index.html'),
      //   // main: resolve(__dirname, 'src/main.ts'),
      // },
    //   output: {
    //     chunkFileNames: {
          
    //     }
    //   }
      // output: {
      //   entryFileNames: '[name].[ext]'
      // }
    
  
});
