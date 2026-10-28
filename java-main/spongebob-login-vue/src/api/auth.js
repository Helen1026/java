import request from './request'

/**
 * 认证相关接口
 *
 * 项目默认后端已就绪，未设置 VITE_USE_MOCK 或不为 true 时直接走真实后端接口；
 * 如需离线开发页面，在 .env.development 中写 VITE_USE_MOCK=true 即可切回本地模拟。
 * 后端地址通过 request.js 的 baseURL（VITE_API_BASE_URL，默认 /api，由 Vite 代理到 8081）控制。
 */
// 与 home.js 保持一致：未显式设置 VITE_USE_MOCK=true 时走真实后端（项目默认后端已就绪）。
// 如需离线开发，可在 .env.development 中写 VITE_USE_MOCK=true 切回本地模拟。
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 登录 */
export function loginApi(data) {
  // data: { username, password }
  if (USE_MOCK) {
    return mock(() => ({ token: 'mock-token-' + Date.now(), username: data.username }))
  }
  return request.post('/auth/login', data)
}

/** 注册 */
export function registerApi(data) {
  // data: { username, password, captcha, captchaId }
  if (USE_MOCK) {
    return mock(() => ({ id: Date.now(), username: data.username }))
  }
  return request.post('/auth/register', data)
}

/**
 * 获取图形验证码（后端方案，二选一）
 * 约定返回：{ captchaId, img }（img 为 base64 或图片 URL）
 * 前端拿到后替换 GraphicCaptcha 的本地绘制逻辑，并将 captchaId 随表单提交。
 */
export function getCaptchaApi() {
  return request.get('/auth/captcha')
}

// ---- 本地模拟工具 ----
function mock(fn, delay = 500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ code: 0, data: fn(), message: 'ok' }), delay)
  })
}
