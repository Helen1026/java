import request from './request'

/**
 * 首页相关接口
 *
 * 后端已实现（springBootTest / HomeController），接口约定：
 *   GET /home/search?keyword=xxx&categoryId=yyy  →  { code, message, data: [ItemVO] }  支持分级分类
 *   GET /home/recommend                           →  { code, message, data: [ItemVO] }  首页热门
 *   GET /home/categories                          →  { code, message, data: [CategoryNode] }  分级分类树
 *
 * ItemVO: { id, icon, title, desc, tag, hot, categoryId, categoryName }
 * CategoryNode: { id, name, level, children: [CategoryNode] }
 *
 * 策略：默认走真实后端接口（VITE_USE_MOCK=false）；接口不可用（404/网络异常）时
 * 自动回退到本地比奇堡主题演示数据，页面照常可用。分级分类搜索在后端与本地兜底中均支持。
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 首页搜索（支持分级分类：传 categoryId 会连同其所有子分类一起过滤） */
export async function searchApi(keyword = '', categoryId = null) {
  if (USE_MOCK) return localSearch(keyword, categoryId)
  try {
    const params = {}
    if (keyword && keyword.trim()) params.keyword = keyword.trim()
    if (categoryId && categoryId > 0) params.categoryId = categoryId
    return await request.get('/home/search', { params })
  } catch (err) {
    console.warn('[home] /home/search 暂不可用，先用本地数据展示：', err.message)
    return localSearch(keyword, categoryId)
  }
}

/** 首页热门推荐 */
export async function recommendApi() {
  if (USE_MOCK) return localResult(SEARCH_POOL.slice(0, 4))
  try {
    return await request.get('/home/recommend')
  } catch (err) {
    console.warn('[home] /home/recommend 暂不可用，先用本地数据展示：', err.message)
    return localResult(SEARCH_POOL.slice(0, 4))
  }
}

/** 分级分类树（用于分类导航 / 筛选） */
export async function categoriesApi() {
  if (USE_MOCK) return localResult(LOCAL_CATEGORY_TREE)
  try {
    return await request.get('/home/categories')
  } catch (err) {
    console.warn('[home] /home/categories 暂不可用，先用本地分类展示：', err.message)
    return localResult(LOCAL_CATEGORY_TREE)
  }
}

/** 热门搜索词 */
export const HOT_KEYWORDS = ['蟹黄堡', '水母', '泡泡', '派大星', '美食', '神奇']

// ===== 本地兜底数据（后端未就绪时使用） =====

/** 本地分类树，结构 / id 与后端 sql/home.sql 种子保持一致 */
const LOCAL_CATEGORY_TREE = [
  { id: 1, name: '美食', level: 1, children: [
    { id: 11, name: '蟹堡王美食', level: 2, children: [] },
    { id: 12, name: '海藻料理', level: 2, children: [] },
  ]},
  { id: 2, name: '玩具', level: 1, children: [
    { id: 21, name: '泡泡玩具', level: 2, children: [] },
    { id: 22, name: '神奇小物', level: 2, children: [] },
  ]},
  { id: 3, name: '宠物', level: 1, children: [
    { id: 31, name: '蜗牛与伙伴', level: 2, children: [] },
  ]},
  { id: 4, name: '工具', level: 1, children: [
    { id: 41, name: '捕捞工具', level: 2, children: [] },
  ]},
  { id: 5, name: '乐器', level: 1, children: [
    { id: 51, name: '管乐器', level: 2, children: [] },
  ]},
]

/** id -> 分类名，便于本地模式下给卡片补上分类名 */
const LOCAL_CAT_NAME = {
  1: '美食', 11: '蟹堡王美食', 12: '海藻料理',
  2: '玩具', 21: '泡泡玩具', 22: '神奇小物',
  3: '宠物', 31: '蜗牛与伙伴',
  4: '工具', 41: '捕捞工具',
  5: '乐器', 51: '管乐器',
}

/** 本地演示数据池：比奇堡主题，categoryId 与上面的分类树对应 */
const SEARCH_POOL = [
  { id: 1, icon: '🍔', title: '蟹黄堡', desc: '蟹堡王招牌，海之霸永远无法复制的秘方', tag: '美食', hot: 9999, categoryId: 11 },
  { id: 2, icon: '🪼', title: '水母网', desc: '抓水母必备神器，派大星强烈推荐', tag: '工具', hot: 8888, categoryId: 41 },
  { id: 3, icon: '🫧', title: '泡泡水', desc: '吹出会说话的大泡泡，还能装下菠萝屋', tag: '玩具', hot: 7777, categoryId: 21 },
  { id: 4, icon: '🍦', title: '海藻冰淇淋', desc: '珊迪发明的海藻味冰淇淋，清爽一整夏', tag: '美食', hot: 6666, categoryId: 12 },
  { id: 5, icon: '🐚', title: '会唱歌的海螺', desc: '按一下就能听到比奇堡的海浪声', tag: '神奇', hot: 5555, categoryId: 22 },
  { id: 6, icon: '🎺', title: '章鱼哥的竖笛', desc: '吹出来的每一个音符都写满忧伤', tag: '乐器', hot: 4444, categoryId: 51 },
  { id: 7, icon: '🍟', title: '海霸王薯条', desc: '趁热吃，凉了它可能会跟你聊天', tag: '美食', hot: 3333, categoryId: 11 },
  { id: 8, icon: '🐌', title: '小蜗的壳', desc: '一只会喵喵叫的宠物蜗牛，比奇堡最黏人', tag: '宠物', hot: 2222, categoryId: 31 },
  { id: 9, icon: '🪨', title: '派大星的石头', desc: '房子是石头，沙发也是石头，但很温馨', tag: '搞笑', hot: 1111, categoryId: 22 },
  { id: 10, icon: '🧽', title: '海绵擦', desc: '比奇堡最勤快的清洁工，擦什么都亮', tag: '日用', hot: 999, categoryId: 41 },
]

/** 计算某分类及其所有后代分类的 id 集合（分级分类） */
function collectDescendantIds(nodes, targetId) {
  const out = new Set()
  const walk = (list, hitParent) => {
    for (const n of list || []) {
      const hit = hitParent || n.id === targetId
      if (hit) out.add(n.id)
      if (n.children && n.children.length) walk(n.children, hit)
    }
  }
  walk(nodes, false)
  return out
}

/** 本地搜索：关键词（标题/描述/标签）+ 可选分级分类 */
function localSearch(keyword, categoryId) {
  const kw = (keyword || '').trim()
  const catIds = (categoryId && categoryId > 0)
    ? collectDescendantIds(LOCAL_CATEGORY_TREE, categoryId)
    : null
  const list = SEARCH_POOL.filter((item) => {
    const matchKw = !kw || [item.title, item.desc, item.tag].some((t) => t.includes(kw))
    const matchCat = !catIds || (item.categoryId != null && catIds.has(item.categoryId))
    return matchKw && matchCat
  }).map((item) => ({
    ...item,
    categoryName: LOCAL_CAT_NAME[item.categoryId] || item.tag,
  }))
  return localResult(list)
}

function localResult(list, delay = 300) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ code: 0, message: 'ok', data: list }), delay)
  })
}
