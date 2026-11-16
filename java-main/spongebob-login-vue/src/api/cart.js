import request from './request'

/**
 * 购物车接口，与后端 CartController 一一对应（都需要登录，token 由 request 拦截器带上）。
 * 所有写操作都返回整车汇总 { items, count, subtotal }，前端整体替换本地 state。
 */
export const cartApi = {
  /** 我的购物车 */
  list: () => request.get('/cart'),

  /** 加入购物车（同商品累加数量） */
  add: (payload) => request.post('/cart', payload),

  /** 改数量（qty<=0 后端会删除该行） */
  updateQty: (id, qty) => request.put(`/cart/${id}`, { qty }),

  /** 删除一行 */
  remove: (id) => request.delete(`/cart/${id}`),

  /** 清空：不传 source 清整车，传 'krusty' 只清蟹堡王订单 */
  clear: (source) => request.delete('/cart', { params: source ? { source } : {} }),

  /** 合并本机旧购物车（登录后调用一次） */
  merge: (items) => request.post('/cart/merge', { items }),

  /** 结算：清空指定来源，返回剩余车 + checkoutCount / checkoutSubtotal */
  checkout: (source) => request.post('/cart/checkout', null, { params: source ? { source } : {} }),
}
