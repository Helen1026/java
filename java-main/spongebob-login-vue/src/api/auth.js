import request from './request'

/**
 * 认证相关接口
 *
 * 后端未就绪时保持 VITE_USE_MOCK=true（默认），所有接口走本地模拟，页面可独立开发；
 * 后端就绪后在 .env.development 中配置：
 *   VITE_API_BASE_URL=http://你的后端地址/api
 *   VITE_USE_MOCK=false
 * 即可无缝切换到真实接口。
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

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
