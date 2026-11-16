import { reactive } from 'vue'
import { resetCart } from './cart'

/**
 * 用户资料（昵称 / 头像 / 签名）的全局响应式存储。
 *
 * 设计说明：
 *  - 数据源仍是 localStorage 的 userInfo，但抽成 reactive 单例后，
 *    首页导航、欢迎语、子页面导航栏、菠萝屋个人中心会**实时同步**，
 *    不必等页面重新挂载才刷新。
 *  - avatar 支持两种形态：
 *      1) emoji 字符串（如 '🧽'）—— 默认头像；
 *      2) 图片 dataURL（'data:image/...'）—— 本地图片上传后压缩得到的头像。
 *  - 写回时**合并**已有 userInfo（保留后端返回的 role、token 相关字段等），
 *    避免覆盖掉登录时写入的角色信息导致后台路由守卫误判。
 */

export const DEFAULT_AVATAR = '🧽'
export const DEFAULT_SIGNATURE = '我准备好了！'

/** 可选头像（比奇堡角色 emoji） */
export const AVATARS = ['🧽', '⭐', '🦑', '🐿️', '🦀', '🐌', '🐙', '🫧', '🍍', '🐠']

export const profile = reactive({
  username: '',
  nickname: '海绵宝宝',
  signature: DEFAULT_SIGNATURE,
  avatar: DEFAULT_AVATAR,
})

/** 是否用图片当头像 */
export function isImageAvatar(src) {
  return typeof src === 'string' && src.startsWith('data:image')
}

/** 从 localStorage 读取资料到 store（App 启动、页面挂载时调用，幂等） */
export function loadProfile() {
  let info = null
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) info = JSON.parse(raw)
  } catch {
    info = null
  }

  const fallbackName = localStorage.getItem('username') || ''
  if (info) {
    profile.username = info.username || fallbackName
    profile.nickname = info.nickname || info.username || fallbackName || profile.nickname
    profile.signature = info.signature || profile.signature
    profile.avatar = info.avatar || profile.avatar
  } else if (fallbackName) {
    profile.username = fallbackName
    profile.nickname = fallbackName
  }
  return profile
}

/** 保存资料：合并写入 localStorage，返回完整 userInfo */
export function saveProfile(patch = {}) {
  Object.assign(profile, patch)

  let existing = {}
  try {
    existing = JSON.parse(localStorage.getItem('userInfo') || '{}') || {}
  } catch {
    existing = {}
  }

  const info = {
    ...existing,
    username: profile.username || existing.username,
    nickname: profile.nickname,
    signature: profile.signature,
    avatar: profile.avatar,
  }
  localStorage.setItem('userInfo', JSON.stringify(info))
  if (profile.username) localStorage.setItem('username', profile.username)
  return info
}

/** 退出登录时清空 store 与本地缓存 */
export function clearProfile() {
  profile.username = ''
  profile.nickname = '海绵宝宝'
  profile.signature = DEFAULT_SIGNATURE
  profile.avatar = DEFAULT_AVATAR
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('username')
  // 购物车是按账号存在服务端的，退出时清掉内存里的车，避免下一位登录者看到上一个人的订单
  resetCart()
}

/**
 * 把用户选择的图片压缩成正方形 dataURL 头像（默认 160×160，JPEG）。
 * 直接存原图会让 localStorage 迅速爆掉，这里统一裁切 + 压缩。
 */
export function readImageAsAvatar(file, size = 160) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.86))
      } catch (err) {
        reject(err)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片读取失败，换一张试试'))
    }
    img.src = url
  })
}
