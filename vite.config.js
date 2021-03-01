import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __DEV__: process.env.NODE_ENV ? 'false' : 'true',
  },
  plugins: [vue()],
})
