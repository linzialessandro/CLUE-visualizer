import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/CLUE-visualizer/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          d3: ['d3'],
          katex: ['katex'],
        },
      },
    },
  },
})
