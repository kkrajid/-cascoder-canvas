import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'konva',
    'react-konva',
    'zustand',
    '@cascoder/canvas-core',
  ],
  minify: false,
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
