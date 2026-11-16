import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // 读取 .env.[mode] ，没有则用默认值
  const env = loadEnv(mode, process.cwd(), '')

  // 后端地址（本机局域网 IP）：默认 192.168.68.25:8081
  // 换 IP / 换网络时，只改 .env.development 里的 VITE_BACKEND_ORIGIN，或临时改成 http://127.0.0.1:8081
  const backendOrigin = env.VITE_BACKEND_ORIGIN || 'http://192.168.68.25:8081'

  return {
    plugins: [vue()],
    server: {
      // 监听 0.0.0.0：本机 localhost、局域网 IP（192.168.68.25）都能访问
      host: true,
      port: 5173,
      // 端口被占用时直接报错，避免悄悄换端口导致访问地址对不上
      strictPort: true,
      proxy: {
        // 前端 request.js 的 baseURL 是 /api，开发环境由 Vite 转发到本机后端
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
  }
})
