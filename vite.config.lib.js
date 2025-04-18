import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  plugins: [react()],
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
  build: {
    lib: {
      entry: resolve(__dirname, 'main.jsx'),
      name: 'VSChatWidget',
      fileName: (format) => `vs-chat-widget.${format}.js`,
      formats: ['iife']
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
    sourcemap: false,
    minify: false //'terser'
  }
});
