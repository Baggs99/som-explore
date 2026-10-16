import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // relative paths so it works on GitHub Pages and locally
  plugins: [react()],
  server: {
    port: 5173,
    // Don't watch raw capture/reference assets: large or locked media files can make the
    // Windows watcher throw EBUSY and kill the dev server.
    watch: {
      ignored: [
        '**/reference/**',
        '**/First floor photos/**',
        '**/General-Layout-of-SOM/**',
        '**/McNays-Videos/**',
        '**/pilot-videos/**',
        '**/recon/**',
        '**/*.{pdf,HEIC,heic,MP4,mp4,MOV,mov,usdz}',
      ],
    },
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
