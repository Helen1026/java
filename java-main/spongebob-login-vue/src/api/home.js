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
export const HOT_KEYWORDS = ['蟹黄堡', '水母', '泡泡', '派大星', '美食', '神奇', '珊迪', '章鱼哥']

// ===== 本地兜底数据（后端未就绪时使用） =====

/** 本地分类树，结构 / id 与后端 sql/home.sql 种子保持一致 */
const LOCAL_CATEGORY_TREE = [
  { id: 1, name: '美食', level: 1, children: [
    { id: 11, name: '蟹堡王美食', level: 2, children: [] },
    { id: 12, name: '甜品冷饮', level: 2, children: [] },
    { id: 13, name: '海之霸黑暗料理', level: 2, children: [] },
  ]},
  { id: 2, name: '玩具', level: 1, children: [
    { id: 21, name: '泡泡玩具', level: 2, children: [] },
    { id: 22, name: '神奇小物', level: 2, children: [] },
    { id: 23, name: '水母周边', level: 2, children: [] },
  ]},
  { id: 3, name: '宠物', level: 1, children: [
    { id: 31, name: '蜗牛与伙伴', level: 2, children: [] },
    { id: 32, name: '海洋生物', level: 2, children: [] },
  ]},
  { id: 4, name: '工具', level: 1, children: [
    { id: 41, name: '捕捞工具', level: 2, children: [] },
    { id: 42, name: '清洁用品', level: 2, children: [] },
  ]},
  { id: 5, name: '乐器', level: 1, children: [
    { id: 51, name: '管乐器', level: 2, children: [] },
    { id: 52, name: '打击乐', level: 2, children: [] },
  ]},
  { id: 6, name: '服饰', level: 1, children: [
    { id: 61, name: '日常穿搭', level: 2, children: [] },
    { id: 62, name: '运动装备', level: 2, children: [] },
  ]},
  { id: 7, name: '家居', level: 1, children: [
    { id: 71, name: '菠萝屋装饰', level: 2, children: [] },
    { id: 72, name: '厨房用品', level: 2, children: [] },
  ]},
  { id: 8, name: '书籍', level: 1, children: [
    { id: 81, name: '漫画杂志', level: 2, children: [] },
    { id: 82, name: '教科书', level: 2, children: [] },
  ]},
]

/** id -> 分类名，便于本地模式下给卡片补上分类名 */
const LOCAL_CAT_NAME = {
  1: '美食', 11: '蟹堡王美食', 12: '甜品冷饮', 13: '海之霸黑暗料理',
  2: '玩具', 21: '泡泡玩具', 22: '神奇小物', 23: '水母周边',
  3: '宠物', 31: '蜗牛与伙伴', 32: '海洋生物',
  4: '工具', 41: '捕捞工具', 42: '清洁用品',
  5: '乐器', 51: '管乐器', 52: '打击乐',
  6: '服饰', 61: '日常穿搭', 62: '运动装备',
  7: '家居', 71: '菠萝屋装饰', 72: '厨房用品',
  8: '书籍', 81: '漫画杂志', 82: '教科书',
}

/** 本地演示数据池：比奇堡主题，categoryId 与上面的分类树对应 */
const SEARCH_POOL = [
  // === 美食 ===
  { id: 1, icon: '🍔', title: '蟹黄堡', desc: '蟹堡王招牌，海之霸永远无法复制的秘方', tag: '美食', hot: 9999, categoryId: 11 },
  { id: 2, icon: '🍟', title: '海霸王薯条', desc: '趁热吃，凉了它可能会跟你聊天', tag: '美食', hot: 3333, categoryId: 11 },
  { id: 3, icon: '🍔', title: '蟹黄堡套餐', desc: '蟹黄堡+薯条+饮料，派大星的最爱', tag: '美食', hot: 888, categoryId: 11 },
  { id: 4, icon: '🍔', title: '双层蟹黄堡', desc: '两层海藻肉饼，派大星说还不够', tag: '美食', hot: 777, categoryId: 11 },
  { id: 5, icon: '🍔', title: '小蟹黄堡', desc: '一口一个版，小蜗都抢着吃', tag: '美食', hot: 666, categoryId: 11 },
  { id: 6, icon: '🍦', title: '海藻冰淇淋', desc: '珊迪发明的海藻味冰淇淋，清爽一整夏', tag: '美食', hot: 6666, categoryId: 12 },
  { id: 7, icon: '🥤', title: '海藻气泡水', desc: '喝一口能吐三分钟泡泡，珊迪说这叫碳酸反应', tag: '美食', hot: 555, categoryId: 12 },
  { id: 8, icon: '🥧', title: '珊瑚派', desc: '蟹老板私藏，只有节假日才肯做上一炉', tag: '美食', hot: 444, categoryId: 12 },
  { id: 9, icon: '🧋', title: '泡泡奶茶', desc: '里面的珍珠是会往上飘的小气泡', tag: '美食', hot: 333, categoryId: 12 },
  { id: 10, icon: '☕', title: '章鱼哥特调咖啡', desc: '苦到让人沉思人生的深海咖啡，附赠一声叹息', tag: '美食', hot: 222, categoryId: 12 },
  { id: 11, icon: '🍕', title: '海之霸披萨（仿）', desc: '痞老板出品，据说每份附赠窃听器一枚', tag: '黑暗料理', hot: 111, categoryId: 13 },
  { id: 12, icon: '🥫', title: '海霸糊', desc: '痞老板的看家菜，吃完需要一点勇气', tag: '黑暗料理', hot: 99, categoryId: 13 },

  // === 玩具 ===
  { id: 13, icon: '🫧', title: '泡泡水', desc: '吹出会说话的大泡泡，还能装下菠萝屋', tag: '玩具', hot: 7777, categoryId: 21 },
  { id: 14, icon: '🔫', title: '泡泡枪', desc: '一次喷出十个会跳舞的泡泡', tag: '玩具', hot: 666, categoryId: 21 },
  { id: 15, icon: '🫧', title: '巨型泡泡圈', desc: '能把整个人包在泡泡里飘起来', tag: '玩具', hot: 555, categoryId: 21 },
  { id: 16, icon: '🐚', title: '会唱歌的海螺', desc: '按一下就能听到比奇堡的海浪声', tag: '神奇', hot: 5555, categoryId: 22 },
  { id: 17, icon: '🪨', title: '派大星的石头', desc: '房子是石头，沙发也是石头，但很温馨', tag: '搞笑', hot: 1111, categoryId: 22 },
  { id: 18, icon: '🔮', title: '魔法海螺', desc: '问它问题它会回答"是"或"不是"，偶尔会骗你', tag: '神奇', hot: 444, categoryId: 22 },
  { id: 19, icon: '🪼', title: '毛绒水母玩偶', desc: '软乎乎的发光水母抱枕，抱着睡觉特别安心', tag: '玩具', hot: 888, categoryId: 23 },
  { id: 20, icon: '🏆', title: '水母奖杯', desc: '水母田捕捞大赛冠军奖杯，派大星说他也得过', tag: '玩具', hot: 77, categoryId: 23 },

  // === 宠物 ===
  { id: 21, icon: '🐌', title: '小蜗的壳', desc: '一只会喵喵叫的宠物蜗牛，比奇堡最黏人', tag: '宠物', hot: 2222, categoryId: 31 },
  { id: 22, icon: '🦀', title: '宠物小螃蟹', desc: '会夹筷子但不会夹手指，蟹老板的远房亲戚', tag: '宠物', hot: 333, categoryId: 31 },
  { id: 23, icon: '🐠', title: '观赏小丑鱼', desc: '在菠萝屋鱼缸里游来游去，心情好会吐泡泡', tag: '宠物', hot: 222, categoryId: 32 },
  { id: 24, icon: '🦑', title: '宠物小章鱼', desc: '安静优雅，偶尔会吹小竖笛', tag: '宠物', hot: 111, categoryId: 32 },

  // === 工具 ===
  { id: 25, icon: '🪼', title: '水母网', desc: '抓水母必备神器，派大星强烈推荐', tag: '工具', hot: 8888, categoryId: 41 },
  { id: 26, icon: '🥫', title: '水母罐头', desc: '封存一整只发光水母，装饰与食用两不误', tag: '工具', hot: 777, categoryId: 41 },
  { id: 27, icon: '🧽', title: '海绵擦', desc: '比奇堡最勤快的清洁工，擦什么都亮', tag: '日用', hot: 999, categoryId: 42 },
  { id: 28, icon: '🧹', title: '深海扫帚', desc: '一扫一片海草，章鱼哥说它比自己勤快', tag: '日用', hot: 88, categoryId: 42 },

  // === 乐器 ===
  { id: 29, icon: '🎺', title: '章鱼哥的竖笛', desc: '吹出来的每一个音符都写满忧伤', tag: '乐器', hot: 4444, categoryId: 51 },
  { id: 30, icon: '🎷', title: '海草萨克斯', desc: '珊迪推荐，吹起来自带爵士海风', tag: '乐器', hot: 222, categoryId: 51 },
  { id: 31, icon: '🥁', title: '珊瑚鼓', desc: '敲起来像海浪拍岸，派大星能敲一整天', tag: '乐器', hot: 111, categoryId: 52 },
  { id: 32, icon: '🎸', title: '贝壳吉他', desc: '用贝壳做的吉他，弹起来嗡嗡响', tag: '乐器', hot: 99, categoryId: 52 },

  // === 服饰 ===
  { id: 33, icon: '👖', title: '海裤', desc: '比奇堡居民标配，耐脏又耐穿', tag: '服饰', hot: 666, categoryId: 61 },
  { id: 34, icon: '👕', title: '海绵黄衬衫', desc: '经典款，海绵宝宝同款', tag: '服饰', hot: 555, categoryId: 61 },
  { id: 35, icon: '🧤', title: '水母网手套', desc: '抓水母不被电，派大星同款', tag: '服饰', hot: 444, categoryId: 62 },
  { id: 36, icon: '👟', title: '贝壳运动鞋', desc: '踩在珊瑚上也不滑，跑水母田专用', tag: '服饰', hot: 333, categoryId: 62 },

  // === 家居 ===
  { id: 37, icon: '🛏️', title: '石头沙发', desc: '派大星同款，坐上去硬邦邦但很有安全感', tag: '家居', hot: 222, categoryId: 71 },
  { id: 38, icon: '🪴', title: '海草盆栽', desc: '放在菠萝屋里，不用浇水也能活', tag: '家居', hot: 111, categoryId: 71 },
  { id: 39, icon: '🍳', title: '蟹黄堡煎锅', desc: '蟹堡王后厨同款，煎出来的堡特别香', tag: '家居', hot: 333, categoryId: 72 },
  { id: 40, icon: '🔪', title: '海藻菜刀', desc: '切海草如泥，蟹老板亲测好用', tag: '家居', hot: 222, categoryId: 72 },

  // === 书籍 ===
  { id: 41, icon: '📚', title: '比奇堡漫画周刊', desc: '每周三出版，章鱼哥是忠实读者', tag: '书籍', hot: 444, categoryId: 81 },
  { id: 42, icon: '📖', title: '水母捕捞指南', desc: '从入门到精通，派大星看了三遍还是不会', tag: '书籍', hot: 333, categoryId: 82 },
  { id: 43, icon: '📓', title: '章鱼哥的忧伤日记', desc: '记录了每一天的不开心，请勿在公共场合阅读', tag: '书籍', hot: 222, categoryId: 82 },
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
