import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom', 'konva', 'react-konva'],
  },
  server: {
    port: 5173,
    open: true,
  },
  optimizeDeps: {
    include: ['konva', 'react-konva'],
  },
});
