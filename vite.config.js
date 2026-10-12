import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // relative paths so it works on GitHub Pages and locally
  plugins: [react()],
  server: {
    port: 5173,
    // don't watch PDFs/reference assets: they can be locked (open in a viewer)
    // and a locked file makes the watcher throw EBUSY and kill the dev server
    watch: { ignored: ['**/*.pdf', '**/reference/**'] },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        office: resolve(__dirname, 'office.html'), // low-res LiDAR office viewer
        som: resolve(__dirname, 'som.html'), // full 6-floor Evans Hall walk-through
      },
    },
  },
})
