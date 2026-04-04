import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.worktree/**'],
    environment: 'jsdom',
  },
})
