import { defineConfig } from 'oxfmt';

// Run unscoped from the repo root: the tools scan cwd recursively and
// ignorePatterns define this project's scope — packages govern themselves
// via their own configs.
export default defineConfig({
  semi: true,
  singleQuote: true,
  trailingComma: 'none',
  ignorePatterns: ['core/**', 'plugin/**', 'ui/**', 'dist/**']
});
