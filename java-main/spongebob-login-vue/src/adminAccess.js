import { listCategories } from './api/admin'

/**
 * 后台入口统一处理。
 *
 * 之前的问题：首页点「后台管理」直接进 /admin，等接口返回 403 才弹提示并踢回首页，
 * 用户会看到一个只有气泡背景的空白页 + "无权限"提示，必须退出重新登录才能进后台。
 *
 * 现在改为点击时先确认身份再导航：
 *   - 已知管理员（role=admin）→ 直接进后台，无需重登；
 *   - 已知普通用户（role=user）→ 直接去后台登录页，用管理员账号登录；
 *   - 老数据没有 role → 调一个受白名单保护的接口实测一次，再决定去向。
 */

function readRole() {
  try {
    const raw = localStorage.getItem('userInfo')
    return raw ? JSON.parse(raw).role : undefined
  } catch {
    return undefined
  }
}

/** 回写角色，避免每次都重复探测；不影响当前登录状态 */
function markRole(role) {
  try {
    const raw = localStorage.getItem('userInfo')
    const info = raw ? JSON.parse(raw) : {}
    info.role = role
    localStorage.setItem('userInfo', JSON.stringify(info))
  } catch {
    /* 本地信息损坏时忽略 */
  }
}

export async function openAdmin(router) {
  if (!localStorage.getItem('token')) {
    router.push('/admin/login')
    return
  }

  const role = readRole()
  if (role === 'admin') {
    router.push('/admin')
    return
  }
  if (role === 'user') {
    router.push({ path: '/admin/login', query: { reason: 'noauth' } })
    return
  }

  // 没有 role 的旧登录数据：用受白名单保护的接口实测一次
  try {
    await listCategories()
    markRole('admin')
    router.push('/admin')
  } catch (err) {
    const message = (err.message || '').toLowerCase()
    if (message.includes('权限') || message.includes('403')) {
      markRole('user')
      router.push({ path: '/admin/login', query: { reason: 'noauth' } })
      return
    }
    // token 失效 / 未登录
    router.push('/admin/login')
  }
}
