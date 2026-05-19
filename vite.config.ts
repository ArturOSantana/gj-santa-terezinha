import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: true,
      allow: [
        // Permite acesso ao diretório raiz do projeto
        path.resolve(__dirname),
        // Permite acesso aos node_modules
        path.resolve(__dirname, 'node_modules'),
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
