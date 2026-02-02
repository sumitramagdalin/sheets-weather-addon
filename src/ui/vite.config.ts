import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '',
  plugins: [react()],
  build: {
    outDir: 'dist-ui',
    cssCodeSplit: false,
    lib: {
      entry: 'src/main.tsx',      // correct relative to src/ui/
      name: 'WeatherSidebar',
      formats: ['iife'],
      fileName: () => 'bundle.js',
    },
    rollupOptions: {
      external: [],
      output: { inlineDynamicImports: true, manualChunks: undefined },
      treeshake: true,
    },
    minify: 'esbuild'
  },
  // ✅ force replacement so only prod code remains
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
    global: 'window'
  }
});