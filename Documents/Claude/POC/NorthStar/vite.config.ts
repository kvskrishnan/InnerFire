import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const hmrConfig = process.env.VITE_HMR_PORT
  ? {
      clientPort: parseInt(process.env.VITE_HMR_PORT, 10),
      host: process.env.VITE_HMR_HOST || undefined,
      protocol: process.env.VITE_HMR_PROTOCOL || 'wss',
    }
  : undefined

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      // Disable SW in dev — it caches stale Vite bundles and causes tab reloads on mobile
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'InnerFire',
        short_name: 'InnerFire',
        description: "Ignite your identity. Become the person you were meant to be.",
        theme_color: '#1a1a2e',
        background_color: '#0f0f1a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  server: {
    port: 5200,
    strictPort: true,
    allowedHosts: true,
    hmr: hmrConfig,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.ts'],
  },
})
