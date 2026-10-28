import request from './request'

/**
 * 后台管理接口（直连真实后端 springBootTest）。
 *
 * 说明：
 *  - 全站默认走真实后端（Vite 在 dev 下把 /api 代理到 http://localhost:8081）。
 *  - /api/admin/** 受 JWT 拦截器保护（见 springBootTest 的 CorsConfig），
 *    必须由 request.js 自动在请求头带上 Authorization: Bearer <token>。
 *  - 后台登录复用 /api/auth/login 真实接口，确保拿到有效 JWT；本模块不进入 mock 分支，
 *    避免「假 token」导致后台接口 401。
 *
 * 后端接口一览（见 controller/AdminController.java）：
 *   GET    /api/admin/item            列出全部条目（含禁用），支持 keyword
 *   POST   /api/admin/item            新增条目
 *   PUT    /api/admin/item/{id}       更新条目（仅覆盖传入字段）
 *   DELETE /api/admin/item/{id}       删除条目
 *   GET    /api/admin/category        列出全部分类（含父级名称）
 *   POST   /api/admin/category        新增分类（level 由父级自动推导）
 *   PUT    /api/admin/category/{id}   更新分类
 *   DELETE /api/admin/category/{id}   删除分类（存在子分类时禁止）
 */

/** 后台登录：始终走真实 /api/auth/login，返回 { token, username, nickname, ... } */
export function adminLoginApi(data) {
  // data: { username, password }
  return request.post('/auth/login', data)
}

/** 当前登录管理员信息（受保护，用于后台展示昵称） */
export function adminProfileApi() {
  return request.get('/api/auth/profile')
}

/** ===== 条目管理（bb_item） ===== */
export function listItems(keyword) {
  const params = {}
  if (keyword && keyword.trim()) params.keyword = keyword.trim()
  return request.get('/api/admin/item', { params })
}

export function createItem(item) {
  return request.post('/api/admin/item', item)
}

export function updateItem(id, item) {
  return request.put(`/api/admin/item/${id}`, item)
}

export function deleteItem(id) {
  return request.delete(`/api/admin/item/${id}`)
}

/** ===== 分类管理（bb_category） ===== */
export function listCategories() {
  return request.get('/api/admin/category')
}

export function createCategory(category) {
  return request.post('/api/admin/category', category)
}

export function updateCategory(id, category) {
  return request.put(`/api/admin/category/${id}`, category)
}

export function deleteCategory(id) {
  return request.delete(`/api/admin/category/${id}`)
}
