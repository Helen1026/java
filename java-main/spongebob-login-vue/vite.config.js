import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // 监听 0.0.0.0：本机 localhost 和局域网都能访问。
    // 注意：不要写死某个局域网 IP（如 192.168.68.x），DHCP 换 IP 后会启动失败 EADDRNOTAVAIL。
    host: true,
    port: 5173,
    proxy: {
      // 前端 request.js 的 baseURL 是 /api，开发环境由 Vite 转发到本机后端
      '/api': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
    },
  },
})
