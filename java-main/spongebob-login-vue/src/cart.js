/**
 * 全局购物车（轻量 store）
 *
 * 为什么不用 Pinia：项目只用到这一处跨组件状态，一个 reactive 单例足够，
 * 不额外引入依赖。数据写入 localStorage，刷新页面后购物车不会丢。
 *
 * 用法：
 *   import { useCart } from '../cart'
 *   const { items, count, total, add, setQty, remove, clear } = useCart()
 */

import { reactive, computed, watch } from 'vue'

const STORAGE_KEY = 'bb_cart'
const MAX_QTY = 99

/** 从 localStorage 读取，任何异常都退回空车，避免脏数据让页面白屏 */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    return list.filter((row) => row && row.id != null && row.qty > 0)
  } catch {
    return []
  }
}

const state = reactive({ rows: readStorage() })

// 任何增删改都自动落盘
watch(
  () => state.rows,
  (rows) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
    } catch {
      /* 无痕模式等场景写入失败时忽略，功能仍可用 */
    }
  },
  { deep: true }
)

/** 兼容后端条目（title/tag）与蟹堡王菜单（name/price）两种数据结构 */
function normalize(item, qty) {
  return {
    id: item.id,
    title: item.title || item.name || '未命名商品',
    icon: item.icon || '🛒',
    tag: item.tag || '',
    price: Number(item.price) || 0,
    qty: Math.min(Math.max(Number(qty) || 1, 1), MAX_QTY),
  }
}

export function useCart() {
  const items = computed(() => state.rows)
  const count = computed(() => state.rows.reduce((sum, row) => sum + row.qty, 0))
  const total = computed(() =>
    state.rows.reduce((sum, row) => sum + row.price * row.qty, 0)
  )
  /** 后端商品没有价格，只有全部条目都有价时才显示合计 */
  const hasPrice = computed(() =>
    state.rows.length > 0 && state.rows.every((row) => row.price > 0)
  )

  function add(item, qty = 1) {
    if (!item || item.id == null) return
    const exist = state.rows.find((row) => row.id === item.id)
    if (exist) {
      exist.qty = Math.min(exist.qty + (Number(qty) || 1), MAX_QTY)
      return
    }
    state.rows.push(normalize(item, qty))
  }

  function setQty(id, qty) {
    const row = state.rows.find((r) => r.id === id)
    if (!row) return
    const next = Number(qty)
    if (!next || next < 1) {
      remove(id)
      return
    }
    row.qty = Math.min(next, MAX_QTY)
  }

  function remove(id) {
    const index = state.rows.findIndex((r) => r.id === id)
    if (index > -1) state.rows.splice(index, 1)
  }

  function clear() {
    state.rows.splice(0, state.rows.length)
  }

  return { items, count, total, hasPrice, add, setQty, remove, clear }
}
