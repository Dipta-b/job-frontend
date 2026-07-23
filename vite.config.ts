import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'fuse.js': 'fuse.js/dist/fuse.mjs'
    }
  }
})
