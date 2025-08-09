import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { ProxyOptions } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/reader': {
        target: 'https://r.jina.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reader/, ''),
        configure: (proxy) => {
          // No-op: Vite manages proxy. We just map /reader/http://... to r.jina.ai/http://...
        },
      } as ProxyOptions,
    },
  },
});
