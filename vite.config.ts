import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/scheduler/') ||
                id.includes('/use-sync-external-store/')
              ) return 'vendor-react';
              if (id.includes('/react-router/') || id.includes('/react-router-dom/')) return 'vendor-router';
              if (id.includes('recharts')) return 'vendor-recharts';
              if (id.includes('react-icons') || id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('react-i18next') || id.includes('/i18next/')) return 'vendor-i18n';
              if (id.includes('@tanstack/react-query')) return 'vendor-query';
              if (id.includes('motion') || id.includes('framer-motion')) return 'vendor-motion';
              if (id.includes('/axios/') || id.includes('/date-fns/')) return 'vendor-utils';
              return 'vendor';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
