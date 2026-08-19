import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 默认 base 为 '/'，适用于本地开发和 APK 打包
// GitHub Pages 部署时通过 --base /English/ 参数覆盖
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
