import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    semi: true,
    singleQuote: true,
  },
  lint: {
    ignorePatterns: ['dist/**'],
  },
  run: {
    cache: {
      scripts: true,
    },
  },
});
