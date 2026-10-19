import axios from 'axios'

// axios 实例：baseURL 在 .env / .env.development 中配置（VITE_API_BASE_URL）
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求拦截：自动携带 token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一返回 data，统一错误提示
request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || '网络异常，请稍后再试'
    return Promise.reject(new Error(msg))
  }
)

export default request
