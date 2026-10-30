import { defineConfig, type ProxyOptions } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const apiProxy: ProxyOptions = {
  target: 'http://localhost:8080',
  changeOrigin: true,
  configure: (proxy) => {
    proxy.on('proxyRes', (proxyRes) => {
      delete proxyRes.headers['www-authenticate']
    })
  },
}

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    proxy: {
      '/api': apiProxy,
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Libraries change rarely, so they get their own files that stay cached between deployments
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'mui', test: /node_modules[\\/](@mui|@emotion)[\\/]/ },
            { name: 'msal', test: /node_modules[\\/]@azure[\\/]/ },
          ],
        },
      },
    },
  },
})
