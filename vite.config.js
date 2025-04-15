import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: '.',
  resolve: {
    alias: {
      // Polyfill `path` with `path-browserify`
      path: 'path-browserify',
      // Replace `source-map-js` with `source-map` for browser compatibility
      'source-map-js': 'source-map',
      // Replace `url` with `url-polyfill` for browser compatibility
      url: 'url-polyfill',
      // Mock or Polyfill `fs` for browser compatibility
      fs: 'browserfs', // Optional: Use `browserfs` to polyfill fs or mock it manually
      // Add punycode polyfill
      punycode: 'punycode/',
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'main.jsx'),
      name: 'VSChatWidget',
      fileName: (format) => `vs-chat-widget.${format}.js`,
      formats: ['es', 'umd', 'iife']
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'botframework-webchat': 'BotFrameworkWebChat'
        },
        banner: '/* ValueSpace Chat Widget - Copyright ' + new Date().getFullYear() + ' */'
      },
      external: []
    },
    sourcemap: true,
    minify: 'terser'
  }
});
