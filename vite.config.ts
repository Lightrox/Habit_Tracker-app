import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Remove proxy - use vercel dev for local development with API routes
    // Or set VITE_API_URL to your deployed Vercel URL
  },
})

