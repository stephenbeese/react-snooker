import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
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
              const apiKey = env.VITE_X_REQUESTED_BY || '';
              proxyReq.setHeader('X-Requested-By', apiKey);
            });
          },
        },
      },
    },
  }
})
