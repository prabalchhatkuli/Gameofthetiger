import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  // pre-bundle CJS deps so the dev server doesn't 504 ("Outdated Optimize Dep")
  // when it discovers them late
  optimizeDeps: {
    include: ['canvas-confetti', 'qrcode.react'],
  },
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
    proxy: {
      '/room': 'http://localhost:8000',
      '/socket.io': { target: 'http://localhost:8000', ws: true },
    },
  },
});
