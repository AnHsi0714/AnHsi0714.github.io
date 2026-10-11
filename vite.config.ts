import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // 3D 與物理引擎只有少數頁面用到，獨立成 chunk 才不會被其他頁面一起下載
        manualChunks(id) {
          // react 要先獨立出來，否則 rolldown 會把它併進 three chunk，首頁就得連 three 一起下載
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three'
          if (id.includes('node_modules/matter-js')) return 'matter'
        },
      },
    },
  },
})
