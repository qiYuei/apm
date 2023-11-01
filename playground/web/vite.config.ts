import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@apm/core': fileURLToPath(new URL('../../packages/core/src', import.meta.url)),
      '@apm/shared': fileURLToPath(new URL('../../packages/shared/src', import.meta.url)),
      '@apm/browser': fileURLToPath(new URL('../../packages/browser/src', import.meta.url))
    }
  }
})
