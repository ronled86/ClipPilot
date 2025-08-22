import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  base: './',  // Important for Electron to find assets
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    assetsDir: 'assets',  // Ensure assets are in a consistent directory
    rollupOptions: {
      output: {
        manualChunks: undefined  // Prevent chunk splitting issues in Electron
      }
    }
  }
})