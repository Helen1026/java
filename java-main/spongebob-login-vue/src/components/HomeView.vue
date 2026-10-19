<template>
  <div class="home-root">
    <!-- ===== 顶部导航栏 ===== -->
    <header class="navbar">
      <div class="nav-inner">
        <div class="brand">
          <span class="brand-icon">🍍</span>
          <span class="brand-text">比奇堡</span>
        </div>

        <nav class="nav-links">
          <button
            v-for="item in navItems"
            :key="item.name"
            class="nav-link"
            :class="{ active: item.active }"
            @click="goPage(item)"
          >
            {{ item.name }}
          </button>
        </nav>

        <div class="nav-right">
          <div class="user-chip" :title="nickname">
            <span>🧽</span>
            <span class="user-name">{{ nickname }}</span>
          </div>
          <button class="btn-logout" @click="logout">退出</button>
        </div>
      </div>
    </header>

    <!-- ===== 英雄区 + 搜索栏 ===== -->
    <section class="hero">
      <h1>今天想抓点什么？</h1>
      <p class="hero-sub">比奇堡万事屋 · 蟹黄堡、水母网、泡泡水，应有尽有</p>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          v-model.trim="keyword"
          type="text"
          placeholder="搜索比奇堡的好东西，试试「蟹黄堡」"
          @keyup.enter="doSearch"
        >
        <button class="btn-search" :disabled="loading" @click="doSearch">
          {{ loading ? '打捞中…' : '搜 索' }}
        </button>
      </div>

      <div class="hot-row">
        <span class="hot-label">热门搜索：</span>
        <button
          v-for="k in HOT_KEYWORDS"
          :key="k"
          class="hot-chip"
          @click="searchHot(k)"
        >
          {{ k }}
        </button>
      </div>

      <!-- ===== 分级分类筛选 ===== -->
      <div class="category-filter" v-if="categories.length">
        <span class="cat-label">🐠 分类：</span>
        <button
          class="cat-chip"
          :class="{ active: selectedCategoryId === null }"
          @click="selectCategory(null)"
        >全部</button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="cat-chip"
          :class="{ active: selectedCategoryId === cat.id || selectedCategoryId === parentOf[cat.id] }"
          @click="selectCategory(cat.id)"
        >{{ cat.name }}</button>

        <div class="sub-cats" v-if="activeChildren.length">
          <button
            v-for="sub in activeChildren"
            :key="sub.id"
            class="cat-chip sub"
            :class="{ active: selectedCategoryId === sub.id }"
            @click="selectCategory(sub.id)"
          >{{ sub.name }}</button>
        </div>
      </div>
    </section>

    <!-- ===== 内容区 ===== -->
    <section class="content">
      <!-- 搜索结果 -->
      <template v-if="searched">
        <div class="section-head">
          <h2>搜索结果</h2>
          <span class="section-tip">
            <template v-if="selectedCategoryId !== null">分类「{{ selectedCategoryName }}」</template>
            <template v-else>关键词「{{ lastKeyword }}」</template>
            · 共 {{ results.length }} 条
          </span>
          <button class="btn-clear" @click="clearSearch">清空搜索</button>
        </div>

        <div v-if="loading" class="placeholder">🫧 正在打捞中，请稍等…</div>
        <div v-else-if="results.length" class="card-grid">
          <article
            v-for="item in results"
            :key="item.id"
            class="item-card"
            @click="searchHot(item.title)"
          >
            <div
              v-for="(h, i) in holes"
              :key="i"
              class="hole"
              :style="h"
            ></div>
            <div class="item-icon">{{ item.icon }}</div>
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-desc">{{ item.desc }}</p>
            <div class="item-meta">
              <span v-if="item.categoryName" class="cat-name">{{ item.categoryName }}</span>
              <span class="tag">{{ item.tag }}</span>
              <span class="hot">🔥 {{ item.hot }}</span>
            </div>
          </article>
        </div>
        <div v-else class="placeholder">
          🫧 什么也没捞到… 换个词试试？<br>
          <span class="placeholder-tip">比如「水母」「美食」「派大星」</span>
        </div>
      </template>

      <!-- 默认：今日热门推荐 -->
      <template v-else>
        <div class="section-head">
          <h2>今日热门推荐</h2>
          <span class="section-tip">派大星都收藏了</span>
        </div>
        <div class="card-grid">
          <article
            v-for="item in recommended"
            :key="item.id"
            class="item-card"
            @click="searchHot(item.title)"
          >
            <div
              v-for="(h, i) in holes"
              :key="i"
              class="hole"
              :style="h"
            ></div>
            <div class="item-icon">{{ item.icon }}</div>
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-desc">{{ item.desc }}</p>
            <div class="item-meta">
              <span v-if="item.categoryName" class="cat-name">{{ item.categoryName }}</span>
              <span class="tag">{{ item.tag }}</span>
              <span class="hot">🔥 {{ item.hot }}</span>
            </div>
          </article>
        </div>
      </template>
    </section>

    <footer class="home-footer">
      比奇堡登录系统 · 首页已接入后端（搜索 / 热门推荐 / 分级分类均可直连 springBootTest）
    </footer>

    <!-- ===== 全局轻提示 ===== -->
    <transition name="toast-fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchApi, recommendApi, categoriesApi, HOT_KEYWORDS } from '../api/home'

const router = useRouter()

/** 导航项（除首页外，其他页面暂时只做提示，后续再开发） */
const navItems = [
  { name: '首页', active: true },
  { name: '水母田', active: false },
  { name: '蟹堡王', active: false },
  { name: '菠萝屋', active: false },
  { name: '关于比奇堡', active: false },
]

/** 卡片上的海绵孔洞装饰（与登录页风格统一） */
const holes = [
  { width: '18px', height: '18px', top: '14px', right: '18px' },
  { width: '12px', height: '12px', bottom: '16px', left: '14px' },
]

const keyword = ref('')
const searched = ref(false)
const loading = ref(false)
const results = ref([])
const recommended = ref([])
const lastKeyword = ref('')
const nickname = ref('海绵宝宝')
const toast = ref('')
/** 分级分类相关状态 */
const categories = ref([])
const selectedCategoryId = ref(null)
const selectedCategoryName = ref('')

/** 分类扁平化：id -> 节点 */
const flatCats = computed(() => {
  const m = {}
  const walk = (list) => (list || []).forEach((n) => {
    m[n.id] = n
    if (n.children) walk(n.children)
  })
  walk(categories.value)
  return m
})

/** id -> 父级分类 id（用于高亮当前顶层分类） */
const parentOf = computed(() => {
  const m = {}
  const walk = (list, pid) => (list || []).forEach((n) => {
    if (pid != null) m[n.id] = pid
    if (n.children) walk(n.children, n.id)
  })
  walk(categories.value, null)
  return m
})

/** 当前选中的顶层分类 id（选中的是子分类时取父级） */
const activeTopId = computed(() => {
  const id = selectedCategoryId.value
  if (id == null) return null
  return parentOf.value[id] != null ? parentOf.value[id] : id
})

/** 当前顶层分类下的子分类（用于二级筛选条） */
const activeChildren = computed(() => {
  const top = activeTopId.value
  if (top == null) return []
  const node = flatCats.value[top]
  return node && node.children ? node.children : []
})

onMounted(() => {
  // 读取登录时写入的用户信息
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const info = JSON.parse(raw)
      nickname.value = info.nickname || info.username || nickname.value
    } else if (localStorage.getItem('username')) {
      nickname.value = localStorage.getItem('username')
    }
  } catch {
    /* 本地信息损坏时用默认昵称 */
  }
  loadRecommend()
  loadCategories()
})

async function loadRecommend() {
  try {
    const res = await recommendApi()
    recommended.value = res.data || []
  } catch {
    recommended.value = []
  }
}

async function loadCategories() {
  try {
    const res = await categoriesApi()
    categories.value = res.data || []
  } catch {
    categories.value = []
  }
}

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2200)
}

async function doSearch() {
  const kw = keyword.value.trim()
  // 没关键词也没选分类时，提示一下（分级分类筛选可以不输关键词直接看分类下内容）
  if (!kw && selectedCategoryId.value == null) {
    showToast('先输入点什么，或选个分类再搜呀～')
    return
  }
  loading.value = true
  searched.value = true
  lastKeyword.value = kw
  try {
    // 后端接口已实现，见 src/api/home.js（VITE_USE_MOCK=false 时走真实接口）
    const res = await searchApi(kw, selectedCategoryId.value)
    results.value = res.data || []
  } catch {
    results.value = []
    showToast('搜索失败了，稍后再试～')
  } finally {
    loading.value = false
  }
}

/** 选择分级分类（null 表示「全部」） */
function selectCategory(id) {
  selectedCategoryId.value = id
  selectedCategoryName.value = id != null ? (flatCats.value[id]?.name || '') : ''
  // 选「全部」且没关键词 → 回到热门推荐视图
  if (id == null && !keyword.value.trim()) {
    clearSearch()
    return
  }
  doSearch()
}

function searchHot(k) {
  keyword.value = k
  doSearch()
}

function clearSearch() {
  keyword.value = ''
  searched.value = false
  results.value = []
  selectedCategoryId.value = null
  selectedCategoryName.value = ''
}

function goPage(item) {
  if (item.active) return
  showToast('「' + item.name + '」还在打捞中，先逛逛首页吧～')
}

function logout() {
  if (!confirm('要离开比奇堡了吗？')) return
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('username')
  showToast('已退出登录，下次再来抓水母～')
  setTimeout(() => router.push('/login'), 700)
}
</script>

<style scoped>
/* ===== 页面骨架：铺满屏幕、内部滚动（背景气泡与海底装饰来自 App.vue） ===== */
.home-root {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ===== 导航栏 ===== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 251, 235, .92);
  backdrop-filter: blur(8px);
  border-bottom: 3px solid #FBBF24;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .12);
}
.nav-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 20px;
  font-weight: bold;
  color: #7C2D12;
  letter-spacing: 1px;
  white-space: nowrap;
}
.brand-icon {
  font-size: 24px;
  animation: bob 2.6s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50%      { transform: translateY(-5px) rotate(6deg); }
}

.nav-links {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}
.nav-link {
  padding: 8px 14px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #92400E;
  font-family: inherit;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background .2s, color .2s, transform .1s;
}
.nav-link:hover {
  background: #FEF3C7;
  transform: translateY(-1px);
}
.nav-link.active {
  background: linear-gradient(180deg, #34D399, #059669);
  color: #fff;
  box-shadow: 0 3px 0 #047857;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 160px;
  padding: 6px 14px;
  background: #FFFBEB;
  border: 2px solid #FBBF24;
  border-radius: 999px;
  font-size: 13px;
  font-weight: bold;
  color: #7C2D12;
}
.user-name {
  overflow: hidden;
  text-overflow: ellipsis;
}
.btn-logout {
  padding: 7px 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #FB7185, #E11D48);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 3px 0 #9F1239;
  transition: transform .1s, box-shadow .1s, filter .2s;
}
.btn-logout:hover { filter: brightness(1.06); }
.btn-logout:active {
  transform: translateY(3px);
  box-shadow: 0 0 0 #9F1239;
}

/* ===== 英雄区 ===== */
.hero {
  max-width: 1080px;
  margin: 0 auto;
  padding: 54px 20px 10px;
  text-align: center;
}
.hero h1 {
  color: #fff;
  font-size: 40px;
  letter-spacing: 3px;
  text-shadow: 0 3px 0 rgba(3, 105, 161, .55), 0 8px 20px rgba(0, 0, 0, .28);
}
.hero-sub {
  margin-top: 12px;
  color: #E0F2FE;
  font-size: 15px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .22);
}

/* ===== 搜索栏（与登录卡片同风格：海绵黄 + 海绿按钮） ===== */
.search-bar {
  max-width: 640px;
  margin: 26px auto 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 10px 16px;
  background: linear-gradient(160deg, #FDE047, #FACC15);
  border: 4px solid #FBBF24;
  border-radius: 24px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, .28), inset 0 -5px 0 rgba(0, 0, 0, .07);
}
.search-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.search-bar input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: 3px solid transparent;
  border-radius: 14px;
  background: #FFFBEB;
  color: #78350F;
  font-family: inherit;
  font-size: 15px;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.search-bar input:focus {
  border-color: var(--sea-green);
  box-shadow: 0 0 0 4px rgba(45, 212, 191, .25);
}
.btn-search {
  flex-shrink: 0;
  padding: 12px 22px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(180deg, #34D399, #059669);
  color: #fff;
  font-family: inherit;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  box-shadow: 0 4px 0 #047857;
  transition: transform .1s, box-shadow .1s, filter .2s;
}
.btn-search:hover { filter: brightness(1.05); }
.btn-search:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #047857;
}
.btn-search:disabled {
  filter: grayscale(.35);
  cursor: not-allowed;
  transform: none;
}

/* ===== 热门搜索词 ===== */
.hot-row {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.hot-label {
  color: #E0F2FE;
  font-size: 13px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}
.hot-chip {
  padding: 5px 13px;
  border: 2px solid #7DD3FC;
  border-radius: 999px;
  background: rgba(255, 255, 255, .88);
  color: #0369A1;
  font-family: inherit;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: background .2s, transform .1s;
}
.hot-chip:hover {
  background: #fff;
  transform: translateY(-2px);
}

/* ===== 分级分类筛选 ===== */
.category-filter {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.cat-label {
  color: #E0F2FE;
  font-size: 13px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}
.cat-chip {
  padding: 6px 15px;
  border: 2px solid #7DD3FC;
  border-radius: 999px;
  background: rgba(255, 255, 255, .9);
  color: #0369A1;
  font-family: inherit;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: background .2s, color .2s, transform .1s, border-color .2s;
}
.cat-chip:hover {
  background: #fff;
  transform: translateY(-2px);
}
.cat-chip.active {
  background: linear-gradient(180deg, #34D399, #059669);
  color: #fff;
  border-color: #059669;
  box-shadow: 0 3px 0 #047857;
}
.sub-cats {
  width: 100%;
  margin-top: 2px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.cat-chip.sub {
  padding: 5px 13px;
  font-size: 12px;
  border-color: #FBBF24;
  color: #B45309;
}
.cat-name {
  padding: 2px 9px;
  background: rgba(255, 251, 235, .9);
  border: 2px solid #34D399;
  border-radius: 999px;
  color: #047857;
  font-size: 11px;
  font-weight: bold;
}

/* ===== 内容区 ===== */
.content {
  max-width: 1080px;
  margin: 0 auto;
  padding: 34px 20px 20px;
}
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.section-head h2 {
  color: #fff;
  font-size: 21px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, .28);
}
.section-tip {
  color: #E0F2FE;
  font-size: 13px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}
.btn-clear {
  margin-left: auto;
  padding: 7px 15px;
  border: 2px solid #FBBF24;
  border-radius: 12px;
  background: #FFFBEB;
  color: #92400E;
  font-family: inherit;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: background .2s;
}
.btn-clear:hover { background: #FEF3C7; }

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 18px;
}
.item-card {
  position: relative;
  overflow: hidden;
  padding: 20px 18px 16px;
  background: linear-gradient(160deg, #FDE047, #FACC15);
  border: 4px solid #FBBF24;
  border-radius: 22px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, .22), inset 0 -6px 0 rgba(0, 0, 0, .07);
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;
}
.item-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 34px rgba(0, 0, 0, .28), inset 0 -6px 0 rgba(0, 0, 0, .07);
}
.item-icon {
  font-size: 38px;
  line-height: 1;
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, .18));
}
.item-title {
  margin: 10px 0 6px;
  color: #7C2D12;
  font-size: 18px;
  letter-spacing: 1px;
}
.item-desc {
  min-height: 42px;
  color: #92400E;
  font-size: 13px;
  line-height: 1.65;
}
.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}
.tag {
  padding: 3px 11px;
  background: rgba(255, 251, 235, .9);
  border: 2px solid #F59E0B;
  border-radius: 999px;
  color: #B45309;
  font-size: 12px;
  font-weight: bold;
}
.hot {
  color: #B91C1C;
  font-size: 12px;
  font-weight: bold;
}

.placeholder {
  padding: 46px 20px;
  background: rgba(255, 251, 235, .93);
  border: 3px dashed #F59E0B;
  border-radius: 22px;
  color: #92400E;
  font-size: 15px;
  text-align: center;
  line-height: 2;
}
.placeholder-tip {
  color: #B45309;
  font-size: 13px;
}

/* ===== 页脚 ===== */
.home-footer {
  padding: 24px 20px 130px;
  color: rgba(224, 242, 254, .9);
  font-size: 12px;
  text-align: center;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}

/* ===== 轻提示 ===== */
.toast {
  position: fixed;
  left: 50%;
  bottom: 46px;
  z-index: 100;
  transform: translateX(-50%);
  padding: 12px 24px;
  max-width: 88vw;
  background: rgba(124, 45, 18, .94);
  border-radius: 999px;
  color: #FEF3C7;
  font-size: 14px;
  text-align: center;
  box-shadow: 0 10px 26px rgba(0, 0, 0, .32);
}
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity .25s ease, transform .25s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(14px);
}

/* ===== 小屏适配 ===== */
@media (max-width: 640px) {
  .nav-inner {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 14px;
  }
  .nav-links {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  .nav-right {
    margin-left: auto;
  }
  .hero {
    padding-top: 36px;
  }
  .hero h1 {
    font-size: 27px;
    letter-spacing: 2px;
  }
  .search-bar {
    flex-wrap: wrap;
    padding: 12px;
  }
  .search-bar input {
    flex-basis: calc(100% - 40px);
  }
  .btn-search {
    width: 100%;
  }
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
