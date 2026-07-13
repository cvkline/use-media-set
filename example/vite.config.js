import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Demo app for the use-media-set hook, deployed to GitHub Pages.
// `base` must match the repo name so built asset URLs resolve at
// https://cvkline.github.io/use-media-set/.
export default defineConfig({
  base: '/use-media-set/',
  plugins: [react()],
});
