import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // use happy-dom to avoid ESM/CJS conflicts with jsdom/parse5 in this setup
    environment: 'happy-dom',
    globals: true,
    setupFiles: 'src/setupTests.js',
  },
});
