import { computed, reactive } from 'vue'
import { cartApi } from './api/cart'

/**
 * 全站购物车（服务端为准 + 本机兜底）
 *
 * 数据流：
 *   1) 已登录（有 token）→ 一切以 bb_cart 表为准，任何增删改都走接口，
 *      接口返回整车快照，这里整体替换 state，不做「本地也算一遍」的二次计算；
 *   2) 未登录 / 接口异常 → 退回 localStorage 的 bb_cart，保证页面还能用，
 *      等登录后再通过 /api/cart/merge 把本机这车并进账号。
 *
 * 商品身份用 goodsKey（source:goodsId）而不是裸 id：
 * 首页商品的 id 和蟹堡王菜单的 id 会撞车（都是 1、2、3…），加上来源才唯一。
 *
 * 用法：
 *   import { useCart, ensureCart, refreshCart, resetCart } from '../cart'
 *   const { items, count, total, add, setQty, remove, clear, checkout } = useCart()
 */

const LOCAL_KEY = 'bb_cart'
const MAX_QTY = 99

const state = reactive({
  /** 购物车行（字段与后端 CartItemVO 一致） */
  rows: [],
  /** 是否已从服务端/本机加载过 */
  ready: false,
  loading: false,
  /** 当前 rows 是否来自服务端 */
  synced: false,
  error: '',
})

function hasToken() {
  return Boolean(localStorage.getItem('token'))
}

function clampQty(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(Math.round(n), MAX_QTY)
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    return list
      .filter((row) => row && row.qty > 0 && (row.goodsKey || row.id != null))
      .map((row) => ({
        id: row.id ?? `local-${row.goodsKey}`,
        goodsKey: row.goodsKey || `home:${row.id}`,
        source: row.source || 'home',
        goodsId: row.goodsId ?? row.id ?? null,
        title: row.title || row.name || '未命名商品',
        icon: row.icon || '🛒',
        tag: row.tag || '',
        price: Number(row.price) || 0,
        qty: clampQty(row.qty),
      }))
  } catch {
    return []
  }
}

function writeLocal(rows) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows))
  } catch {
    /* 无痕模式等写入失败就只在内存里用，不阻塞功能 */
  }
}

/** 统一成后端要的请求体 */
function payloadOf(item, qty = 1) {
  const source = item.source === 'krusty' ? 'krusty' : 'home'
  const goodsId = Number(item.goodsId ?? item.id)
  return {
    source,
    goodsId,
    title: item.title || item.name || '未命名商品',
    icon: item.icon || '🛒',
    tag: item.tag || '',
    price: Number(item.price) || 0,
    qty: clampQty(qty) || 1,
  }
}

/** 用接口返回的整车快照替换本地 state */
function applyServer(summary) {
  const items = Array.isArray(summary?.items) ? summary.items : []
  state.rows = items.map((row) => ({
    ...row,
    price: Number(row.price) || 0,
    qty: Number(row.qty) || 0,
  }))
  state.synced = true
  state.ready = true
  state.error = ''
}

/** 本机兜底加购（未登录或接口失败时用） */
function localAdd(payload) {
  const goodsKey = `${payload.source}:${payload.goodsId}`
  const exist = state.rows.find((row) => row.goodsKey === goodsKey)
  if (exist) {
    exist.qty = Math.min(exist.qty + payload.qty, MAX_QTY)
  } else {
    state.rows.push({
      id: `local-${goodsKey}`,
      goodsKey,
      source: payload.source,
      goodsId: payload.goodsId,
      title: payload.title,
      icon: payload.icon,
      tag: payload.tag,
      price: payload.price,
      qty: payload.qty,
    })
  }
  writeLocal(state.rows)
  return state.rows
}

/** 拉取购物车：登录时顺便把本机旧车合并进账号 */
export async function refreshCart() {
  if (!hasToken()) {
    state.rows = readLocal()
    state.synced = false
    state.ready = true
    state.error = ''
    return state.rows
  }

  state.loading = true
  try {
    const legacy = readLocal()
    const res = legacy.length
      ? await cartApi.merge(legacy.map((row) => payloadOf(row, row.qty)))
      : await cartApi.list()
    if (legacy.length) localStorage.removeItem(LOCAL_KEY)
    applyServer(res.data)
  } catch (err) {
    state.error = err.message || '购物车加载失败'
    state.rows = readLocal()
    state.synced = false
    state.ready = true
  } finally {
    state.loading = false
  }
  return state.rows
}

/** 幂等加载：页面挂载时调用，已加载过就不重复请求 */
export function ensureCart() {
  if (state.ready || state.loading) return Promise.resolve(state.rows)
  return refreshCart()
}

/** 退出登录：清空内存里的车（本机缓存也清掉，避免下一个账号看到上一个人的东西） */
export function resetCart() {
  state.rows = []
  state.ready = false
  state.synced = false
  state.error = ''
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    /* 忽略 */
  }
}

export function useCart() {
  const items = computed(() => state.rows)
  const count = computed(() => state.rows.reduce((sum, row) => sum + row.qty, 0))
  const total = computed(() => state.rows.reduce((sum, row) => sum + row.price * row.qty, 0))
  /** 后端条目大多没有价格，只有全部行都有价时才显示合计 */
  const hasPrice = computed(() => state.rows.length > 0 && state.rows.every((row) => row.price > 0))

  /** 按来源取子集（蟹堡王页面只需要自己的订单） */
  function bySource(source) {
    return computed(() => state.rows.filter((row) => row.source === source))
  }

  async function add(item, qty = 1) {
    const payload = payloadOf(item, qty)
    if (!hasToken()) return localAdd(payload)
    try {
      const res = await cartApi.add(payload)
      applyServer(res.data)
    } catch (err) {
      state.error = err.message || '加入购物车失败'
      return localAdd(payload)
    }
    return state.rows
  }

  async function setQty(goodsKey, qty) {
    const row = state.rows.find((item) => item.goodsKey === goodsKey)
    if (!row) return state.rows
    const next = clampQty(qty)

    if (!hasToken() || String(row.id).startsWith('local-')) {
      if (next <= 0) {
        state.rows = state.rows.filter((item) => item.goodsKey !== goodsKey)
      } else {
        row.qty = next
      }
      writeLocal(state.rows)
      return state.rows
    }

    try {
      const res = next <= 0
        ? await cartApi.remove(row.id)
        : await cartApi.updateQty(row.id, next)
      applyServer(res.data)
    } catch (err) {
      state.error = err.message || '修改数量失败'
    }
    return state.rows
  }

  function remove(goodsKey) {
    return setQty(goodsKey, 0)
  }

  async function clear(source) {
    if (!hasToken()) {
      state.rows = source ? state.rows.filter((row) => row.source !== source) : []
      writeLocal(state.rows)
      return state.rows
    }
    try {
      const res = await cartApi.clear(source)
      applyServer(res.data)
    } catch (err) {
      state.error = err.message || '清空购物车失败'
    }
    return state.rows
  }

  /**
   * 结算：返回本次结算的件数与小计，页面拿去做提示 / 积分任务。
   * source 传 'krusty' 时只结算蟹堡王那部分，首页商品继续留在车里。
   */
  async function checkout(source) {
    const target = source
      ? state.rows.filter((row) => row.source === source)
      : state.rows.slice()
    const count = target.reduce((sum, row) => sum + row.qty, 0)
    const subtotal = target.reduce((sum, row) => sum + row.price * row.qty, 0)

    if (!hasToken()) {
      state.rows = source ? state.rows.filter((row) => row.source !== source) : []
      writeLocal(state.rows)
      return { ok: true, count, subtotal }
    }

    if (!count) return { ok: false, count: 0, subtotal: 0, reason: 'empty' }

    try {
      const res = await cartApi.checkout(source)
      applyServer(res.data)
      return {
        ok: true,
        count: res.data?.checkoutCount ?? count,
        subtotal: Number(res.data?.checkoutSubtotal ?? subtotal) || 0,
      }
    } catch (err) {
      state.error = err.message || '结算失败'
      return { ok: false, count, subtotal, reason: 'error', message: state.error }
    }
  }

  return {
    items,
    count,
    total,
    hasPrice,
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    synced: computed(() => state.synced),
    bySource,
    add,
    setQty,
    remove,
    clear,
    checkout,
    refresh: refreshCart,
  }
}
