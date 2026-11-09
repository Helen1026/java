import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // 绑定到本机局域网 IP，使同网段设备可通过 192.168.68.25:5173 访问前端
    host: '192.168.68.25',
    proxy: {
      // 前端 request.js 的 baseURL 是 /api，开发环境下由 Vite 转发到后端（已改用本地 IP）
      '/api': {
        target: 'http://192.168.68.25:8081',
        changeOrigin: true,
      },
    },
  },
})
