import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/CLUE-visualizer/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/d3')) return 'd3'
          if (id.includes('node_modules/katex')) return 'katex'
        },
      },
    },
  },
})
