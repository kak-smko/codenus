import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import renusifyAutoImport from 'renusify/plugins/auto-loader.mjs'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: '../../public/admin',
    sourcemap: false,
    minify: 'terser',
    cssMinify: 'lightningcss',
    terserOptions: {
      format: {
        comments: false
      },
    },
  },
  server: {
   proxy:{
      '/api': 'http://localhost:4000'
    }
  },
  plugins: [
    {
      name: 'production-content-security-policy',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler() {
          return [
            {
              tag: 'meta',
              attrs: {
                'http-equiv': 'Content-Security-Policy',
                content:
                  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'self'; upgrade-insecure-requests;",
              },
              injectTo: 'head',
            },
          ]
        },
      },
    },
    renusifyAutoImport(),
    vue({
      template: {
        compilerOptions: {
          comments: false
        },
      },
    }),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  }
})
