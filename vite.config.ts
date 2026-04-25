import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/snooker': {
        target: 'https://api.snooker.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/snooker/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add the required header to all proxied requests
            proxyReq.setHeader('X-Requested-By', process.env.VITE_X_REQUESTED_BY || '');
          });
        },
      },
    },
  },
})
