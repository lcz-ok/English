import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Default base is '/' for custom domain and APK
// For GitHub Pages sub-path, set VITE_BASE env var
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
