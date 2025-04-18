import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    include: /\.(jsx|js)$/, // ✅ explicitly include .jsx
    babel: {
      presets: [],
      plugins: [],
    }
  })],
  root: '.',
  resolve: {
    alias: {
      path: 'path-browserify',
      'source-map-js': 'source-map',
      url: 'url-polyfill',
      fs: 'browserfs',
      punycode: 'punycode/',
    },
  },
  server: {
    open: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false
  }
});
