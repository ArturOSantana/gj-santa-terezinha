import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Permite que o Vite sirva arquivos fora do root
      strict: false,
      // Nega acesso à pasta api
      deny: ['**/api/**'],
    },
  },
  optimizeDeps: {
    // Exclui a pasta api da otimização de dependências
    exclude: ['api'],
  },
})
