import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.js'),
        reminder: resolve(__dirname,'reminder.html')
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
