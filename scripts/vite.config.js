import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: false, // Script kontrolünde açacağız
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Debug için
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Error overlay'i aktif et
  server: {
    hmr: {
      overlay: true
    }
  }
})