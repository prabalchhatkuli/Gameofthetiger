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
      // Proxy ONLY the backend API paths. `/room/:roomID` is a client-side
      // React Router route (the game-room page), so it must fall through to
      // Vite's SPA fallback — do NOT proxy the whole `/room` prefix.
      '/room/generate': 'http://localhost:8000',
      '/room/validateRoom': 'http://localhost:8000',
      '/room/joinRoom': 'http://localhost:8000',
      '/ai-game': 'http://localhost:8000',
      '/profile/avatar': 'http://localhost:8000',
      '/socket.io': { target: 'http://localhost:8000', ws: true },
    },
  },
});
