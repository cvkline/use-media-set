import { defineConfig } from 'vite';

// Library build for the use-media-set hook.
// src/ contains no JSX, so no React/JSX plugin is required — esbuild handles it.
export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: 'src/index.js',
      formats: ['es', 'cjs'],
      fileName: fmt => (fmt === 'es' ? 'index.es.js' : 'index.js'),
    },
    rollupOptions: {
      // Don't bundle peer deps or declared dependencies; let consumers dedupe them.
      external: ['react', 'react-dom', /^lodash/],
    },
  },
  test: {
    // The hook needs window/matchMedia, so run tests in a DOM environment.
    environment: 'jsdom',
    // Expose describe/it/expect/vi as globals so test files need no imports for them.
    globals: true,
  },
});
