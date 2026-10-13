import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seoPlugin } from './vite-plugin-seo.ts'

export default defineConfig({
  plugins: [react(), seoPlugin()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('@react-three')) return 'r3f'
          return undefined
        },
      },
    },
  },
})
