import { computed, reactive } from 'vue'

/**
 * 比奇堡积分系统（本地 store）
 *
 * 为什么不接后端：
 *   项目当前没有会员/订单/图鉴的数据库表，下单和捕捞都还是前端演示数据。
 *   这里沿用 cart.js / userProfile.js 的做法，用 reactive 单例 + localStorage，
 *   等后端补上 /api/points 时，只需把本文件的 addPoints / redeemFrame
 *   换成接口调用，页面无需改动。
 *
 * 规则（每日 0 点按自然日重置计数，余额不清零）：
 *   每日登录  +10   每天 1 次
 *   蟹堡王下单 +15   每天最多 3 单
 *   捕捉水母  +5    每天最多 10 只
 *   单日上限 10 + 45 + 50 = 105 🪙
 */

const STORAGE_KEY = 'bb_points'
const HISTORY_LIMIT = 20

/** 每日任务定义：key 同时是 state.tasks 里的计数键 */
export const DAILY_TASKS = [
  {
    key: 'login',
    icon: '🌅',
    name: '每日登录',
    desc: '回到比奇堡报到一次',
    points: 10,
    target: 1,
    unit: '次',
  },
  {
    key: 'order',
    icon: '🍔',
    name: '蟹堡王下单',
    desc: '完成一次结账，每天最多 3 单',
    points: 15,
    target: 3,
    unit: '单',
  },
  {
    key: 'catch',
    icon: '🪼',
    name: '捕捉水母',
    desc: '每抓到一只水母，每天最多 10 只',
    points: 5,
    target: 10,
    unit: '只',
  },
]

/**
 * 头像框目录。
 * css 字段对应 UserAvatar.vue 里的 .frame-xxx 类，纯 CSS 绘制，不依赖图片资源。
 */
export const FRAMES = [
  { id: 'none', css: '', name: '原味', emoji: '⚪', cost: 0, desc: '比奇堡原味，什么都不加' },
  { id: 'shell', css: 'frame-shell', name: '贝壳光环', emoji: '🐚', cost: 60, desc: '蟹堡王门口捡的贝壳，闪着落日色' },
  { id: 'bubble', css: 'frame-bubble', name: '泡泡之环', emoji: '🫧', cost: 120, desc: '一串永远不会破的泡泡围着你' },
  { id: 'coral', css: 'frame-coral', name: '珊瑚花冠', emoji: '🪸', cost: 200, desc: '珊迪从礁石上帮你摘的那一朵' },
  { id: 'jelly', css: 'frame-jelly', name: '水母荧光', emoji: '🪼', cost: 300, desc: '像水母一样呼吸式发光的边' },
  { id: 'pineapple', css: 'frame-pineapple', name: '菠萝皇冠', emoji: '🍍', cost: 450, desc: '菠萝屋认证，比奇堡贵宾专属' },
  { id: 'gold', css: 'frame-gold', name: '海绵金边', emoji: '✨', cost: 600, desc: '蟹老板都嫌贵的纯金边框' },
]

/** 本地自然日 key（不用 toISOString，避免时区把「今天」算成昨天） */
export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function emptyTasks() {
  return { login: 0, order: 0, catch: 0 }
}

function defaultState() {
  return {
    balance: 0,
    earned: 0,
    date: todayKey(),
    tasks: emptyTasks(),
    // 终身累计，用于菠萝屋的统计卡
    totalOrder: 0,
    totalCatch: 0,
    frames: ['none'],
    frame: 'none',
    history: [],
  }
}

function readStorage() {
  const base = defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object') return base

    const merged = {
      ...base,
      ...saved,
      tasks: { ...emptyTasks(), ...(saved.tasks || {}) },
      frames: Array.isArray(saved.frames) && saved.frames.length ? saved.frames : ['none'],
      history: Array.isArray(saved.history) ? saved.history.slice(0, HISTORY_LIMIT) : [],
    }
    merged.balance = Number(merged.balance) || 0
    merged.earned = Number(merged.earned) || 0
    merged.totalOrder = Number(merged.totalOrder) || 0
    merged.totalCatch = Number(merged.totalCatch) || 0

    // 跨天：计数归零，余额与头像框保留
    if (merged.date !== todayKey()) {
      merged.date = todayKey()
      merged.tasks = emptyTasks()
    }
    // 佩戴的框若数据损坏，退回原味
    if (!FRAMES.some((f) => f.id === merged.frame)) merged.frame = 'none'
    if (!merged.frames.includes('none')) merged.frames.push('none')
    return merged
  } catch {
    return base
  }
}

export const pointsState = reactive(readStorage())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pointsState))
  } catch {
    /* 无痕模式写入失败时忽略，本次会话内积分仍然可用 */
  }
}

/** 跨天检查：页面长时间开着也要能重置 */
function ensureToday() {
  const key = todayKey()
  if (pointsState.date === key) return false
  pointsState.date = key
  pointsState.tasks = emptyTasks()
  persist()
  return true
}

/** 内部：加积分 + 记流水 */
function addPoints(amount, title, type) {
  if (amount <= 0) return 0
  pointsState.balance += amount
  pointsState.earned += amount
  pointsState.history.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    type,
    title,
    points: amount,
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
  })
  if (pointsState.history.length > HISTORY_LIMIT) {
    pointsState.history.length = HISTORY_LIMIT
  }
  persist()
  return amount
}

/**
 * 每日登录：一天只发一次。
 * @returns {{ok:boolean, points:number, reason?:string}}
 */
export function claimDailyLogin() {
  ensureToday()
  if (pointsState.tasks.login >= 1) return { ok: false, points: 0, reason: 'done' }
  pointsState.tasks.login = 1
  const points = addPoints(DAILY_TASKS[0].points, '每日登录比奇堡', 'login')
  persist()
  return { ok: true, points }
}

/** 蟹堡王下单：每单 +15，每天最多 3 单 */
export function recordOrder() {
  ensureToday()
  const task = DAILY_TASKS.find((t) => t.key === 'order')
  if (pointsState.tasks.order >= task.target) {
    return { ok: false, points: 0, reason: 'limit' }
  }
  pointsState.tasks.order += 1
  pointsState.totalOrder += 1
  const points = addPoints(task.points, '蟹堡王下单', 'order')
  persist()
  return { ok: true, points, count: pointsState.tasks.order, target: task.target }
}

/** 捕捉水母：每只 +5，每天最多 10 只 */
export function recordCatch(name = '') {
  ensureToday()
  const task = DAILY_TASKS.find((t) => t.key === 'catch')
  if (pointsState.tasks.catch >= task.target) {
    return { ok: false, points: 0, reason: 'limit' }
  }
  pointsState.tasks.catch += 1
  pointsState.totalCatch += 1
  const points = addPoints(task.points, `捕捉水母${name ? ` · ${name}` : ''}`, 'catch')
  persist()
  return { ok: true, points, count: pointsState.tasks.catch, target: task.target }
}

/** 按 id 找头像框定义 */
export function frameOf(id) {
  return FRAMES.find((f) => f.id === id) || FRAMES[0]
}

/** 兑换头像框 */
export function redeemFrame(id) {
  const frame = frameOf(id)
  if (!frame || frame.id === 'none') return { ok: false, reason: 'invalid' }
  if (pointsState.frames.includes(frame.id)) return { ok: false, reason: 'owned' }
  if (pointsState.balance < frame.cost) {
    return { ok: false, reason: 'poor', need: frame.cost - pointsState.balance }
  }
  pointsState.balance -= frame.cost
  pointsState.frames.push(frame.id)
  pointsState.frame = frame.id
  pointsState.history.unshift({
    id: `${Date.now()}-redeem`,
    type: 'redeem',
    title: `兑换头像框 · ${frame.name}`,
    points: -frame.cost,
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
  })
  if (pointsState.history.length > HISTORY_LIMIT) pointsState.history.length = HISTORY_LIMIT
  persist()
  return { ok: true, frame }
}

/** 佩戴已拥有的头像框 */
export function equipFrame(id) {
  const frame = frameOf(id)
  if (!pointsState.frames.includes(frame.id)) return { ok: false, reason: 'locked' }
  pointsState.frame = frame.id
  persist()
  return { ok: true, frame }
}

/** 是否已拥有 */
export function ownsFrame(id) {
  return pointsState.frames.includes(id)
}

/** 今日已获得积分（用于面板展示） */
export const todayEarned = computed(
  () =>
    DAILY_TASKS.reduce(
      (sum, t) => sum + Math.min(pointsState.tasks[t.key] || 0, t.target) * t.points,
      0
    )
)

/** 今日任务列表：附带进度 / 是否完成 */
export const todayTasks = computed(() =>
  DAILY_TASKS.map((t) => {
    const count = Math.min(pointsState.tasks[t.key] || 0, t.target)
    return {
      ...t,
      count,
      done: count >= t.target,
      earned: count * t.points,
    }
  })
)

/** 已完成任务数 */
export const todayDoneCount = computed(() => todayTasks.value.filter((t) => t.done).length)
