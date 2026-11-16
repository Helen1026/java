import request from './request'

/**
 * 订单相关接口
 *
 * 后端已实现（springBootTest / OrderController），接口约定：
 *   POST /api/order            创建订单（待付款）
 *   GET  /api/order/list      订单历史（?status=0/1/2，不传为全部）
 *   GET  /api/order/{id}      订单详情
 *   PUT  /api/order/{id}/pay      付款：待付款 → 已完成
 *   PUT  /api/order/{id}/cancel   取消：待付款 → 已取消
 *
 * 订单状态 status：0 待付款 / 1 已完成 / 2 已取消
 * 策略：默认走真实后端接口；接口不可用时自动回退到本地 localStorage 演示数据，页面照常可用。
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 订单状态字典 */
export const ORDER_STATUS = {
  PENDING: 0,
  DONE: 1,
  CANCELLED: 2,
}

export const STATUS_TEXT = {
  0: '待付款',
  1: '已完成',
  2: '已取消',
}

/** 创建订单 */
export function createOrderApi(payload) {
  // payload: { items: [{ itemId, icon, name, price, quantity }], subtotal, taxAmount, totalAmount, remark }
  if (USE_MOCK) return mockCreate(payload)
  return request.post('/order', payload).catch((err) => {
    console.warn('[order] 创建订单接口暂不可用，先用本地数据：', err.message)
    return mockCreate(payload)
  })
}

/** 订单历史（可按状态筛选） */
export function listOrdersApi(status) {
  if (USE_MOCK) return mockList(status)
  return request.get('/order/list', { params: status == null ? {} : { status } })
    .catch((err) => {
      console.warn('[order] 订单列表接口暂不可用，先用本地数据：', err.message)
      return mockList(status)
    })
}

/** 订单详情 */
export function orderDetailApi(id) {
  if (USE_MOCK) return mockDetail(id)
  return request.get(`/order/${id}`).catch((err) => {
    console.warn('[order] 订单详情接口暂不可用：', err.message)
    return mockDetail(id)
  })
}

/** 付款：待付款 → 已完成 */
export function payOrderApi(id) {
  if (USE_MOCK) return mockTransition(id, ORDER_STATUS.DONE)
  return request.put(`/order/${id}/pay`).catch((err) => {
    console.warn('[order] 付款接口暂不可用，本地状态流转：', err.message)
    return mockTransition(id, ORDER_STATUS.DONE)
  })
}

/** 取消：待付款 → 已取消 */
export function cancelOrderApi(id) {
  if (USE_MOCK) return mockTransition(id, ORDER_STATUS.CANCELLED)
  return request.put(`/order/${id}/cancel`).catch((err) => {
    console.warn('[order] 取消订单接口暂不可用，本地状态流转：', err.message)
    return mockTransition(id, ORDER_STATUS.CANCELLED)
  })
}

// ===== 本地兜底（localStorage） =====

const STORE_KEY = 'bikiniOrders'

function seedOrders() {
  const now = Date.now()
  return [
    {
      id: 1, orderNo: 'BB20261116001', subtotal: 20.00, taxAmount: 1.00, totalAmount: 21.00,
      status: ORDER_STATUS.DONE, remark: '老顾客，多加一份海藻酱', createTime: new Date(now - 3600_000).toISOString(),
      items: [
        { id: 1, itemId: 1, icon: '🍔', name: '招牌蟹黄堡', price: 12.00, quantity: 1, lineTotal: 12.00 },
        { id: 2, itemId: 2, icon: '🍟', name: '海霸王薯条', price: 8.00, quantity: 1, lineTotal: 8.00 },
      ],
    },
    {
      id: 2, orderNo: 'BB20261116002', subtotal: 15.00, taxAmount: 0.75, totalAmount: 15.75,
      status: ORDER_STATUS.PENDING, remark: '待付款：蟹黄堡套餐', createTime: new Date(now - 1800_000).toISOString(),
      items: [
        { id: 3, itemId: 1, icon: '🍔', name: '蟹黄堡套餐', price: 12.00, quantity: 1, lineTotal: 12.00 },
        { id: 4, itemId: 8, icon: '🧋', name: '泡泡奶茶', price: 3.00, quantity: 1, lineTotal: 3.00 },
      ],
    },
    {
      id: 3, orderNo: 'BB20261116003', subtotal: 9.00, taxAmount: 0.45, totalAmount: 9.45,
      status: ORDER_STATUS.CANCELLED, remark: '用户取消：暂时不饿了', createTime: new Date(now - 7200_000).toISOString(),
      items: [
        { id: 5, itemId: 7, icon: '🍦', name: '海藻冰淇淋', price: 9.00, quantity: 1, lineTotal: 9.00 },
      ],
    },
  ]
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* 本地数据损坏时重置 */ }
  const seed = seedOrders()
  localStorage.setItem(STORE_KEY, JSON.stringify(seed))
  return seed
}

function writeStore(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list))
}

function wrap(data) {
  return Promise.resolve({ code: 0, message: 'ok', data })
}

function mockCreate(payload) {
  const list = readStore()
  const items = (payload.items || []).map((s, i) => ({
    id: Date.now() + i,
    itemId: s.itemId ?? null,
    icon: s.icon,
    name: s.name,
    price: Number(s.price) || 0,
    quantity: s.quantity || 1,
    lineTotal: (Number(s.price) || 0) * (s.quantity || 1),
  }))
  const order = {
    id: Math.max(0, ...list.map((o) => o.id)) + 1,
    orderNo: 'BB' + Date.now(),
    subtotal: payload.subtotal ?? items.reduce((s, it) => s + it.lineTotal, 0),
    taxAmount: payload.taxAmount ?? 0,
    totalAmount: payload.totalAmount ?? 0,
    status: ORDER_STATUS.PENDING,
    remark: payload.remark || null,
    createTime: new Date().toISOString(),
    items,
  }
  list.unshift(order)
  writeStore(list)
  return wrap(order)
}

function mockList(status) {
  const list = readStore()
  const filtered = status == null ? list : list.filter((o) => o.status === status)
  return wrap(filtered)
}

function mockDetail(id) {
  const order = readStore().find((o) => o.id === Number(id))
  return wrap(order || null)
}

function mockTransition(id, status) {
  const list = readStore()
  const order = list.find((o) => o.id === Number(id))
  if (order) {
    order.status = status
    writeStore(list)
  }
  return wrap(order)
}
