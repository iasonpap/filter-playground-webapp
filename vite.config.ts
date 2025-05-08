import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['plotly.js-dist', 'chart.js', 'react-chartjs-2']
  },
  build: {
    commonjsOptions: {
      include: [/plotly\.js-dist/, /chart\.js/, /react-chartjs-2/]
    }
  }
})
