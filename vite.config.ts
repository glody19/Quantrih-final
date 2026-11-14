import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Big libraries in their own files: cached separately and only downloaded by the pages that use them
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            // small helpers shared by our own code and the chart library stay with the core
            if (id.includes('/clsx/') || id.includes('tailwind-merge') || id.includes('eventemitter3') || id.includes('/tiny-invariant/')) return 'vendor-react';
            if (id.includes('firebase') || id.includes('@firebase')) return 'vendor-firebase';
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'vendor-charts';
            if (id.includes('lightweight-charts')) return 'vendor-tradingview';
            if (id.includes('motion') || id.includes('framer')) return 'vendor-motion';
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(_dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
