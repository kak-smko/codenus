import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import renusifyAutoImport from 'renusify/plugins/auto-loader.mjs'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: '../../public/index',
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
    proxy: {
      '/api': 'http://localhost:4000',
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
    vueDevTools(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,

      manifest: {
        name: 'test',
        short_name: 'test',
        description: 'test',
        theme_color: '#ffffff',

        icons: [{
        src: '/api/storage/img/logo-mini.png?w=64&h=64',
        sizes: '64x64',
        type: 'image/png',
      }, {
        src: '/api/storage/img/logo-mini.png?w=192&h=192',
        sizes: '192x192',
        type: 'image/png',
      }, {
        src: '/api/storage/img/logo-mini.png?w=512&h=512',
        sizes: '512x512',
        type: 'image/png',
      }, {
        src: '/api/storage/img/logo-mini.png?w=512&h=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: null, 
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkOnly'
          }
        ]
      },

      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
})
