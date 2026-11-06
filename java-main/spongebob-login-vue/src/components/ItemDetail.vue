<template>
  <PageShell
    :title="item ? item.icon + ' ' + item.title : '🫧 商品加载中…'"
    :subtitle="item ? '比奇堡万事屋 · 商品详情' : ''"
    :toast="toast"
    footer-text="比奇堡万事屋 · 商品详情页演示数据"
  >
    <!-- 加载中 -->
    <div v-if="loading && !item" class="detail-box loading-box">
      <p class="loading-text">🫧 正在从海底打捞商品…</p>
    </div>

    <!-- 商品不存在 -->
    <div v-else-if="!item" class="detail-box empty-box">
      <p class="empty-title">🫧 什么也没捞到…</p>
      <p class="empty-tip">这个商品可能已经被派大星吃掉了</p>
      <button class="btn-back" @click="goBack">← 返回首页</button>
    </div>

    <!-- 商品详情 -->
    <template v-else>
      <div class="detail-layout">
        <!-- 左侧：大图 -->
        <div class="detail-visual">
          <div
            v-for="(h, i) in holes"
            :key="i"
            class="hole"
            :style="h"
          ></div>
          <div class="detail-icon">{{ item.icon }}</div>
          <div class="detail-category-tag" v-if="item.categoryName">
            {{ item.categoryName }}
          </div>
        </div>

        <!-- 右侧：信息 -->
        <div class="detail-info">
          <h2 class="detail-title">{{ item.title }}</h2>
          <p class="detail-desc">{{ item.desc }}</p>

          <div class="detail-meta">
            <div class="meta-row">
              <span class="meta-label">分类</span>
              <span class="meta-value">{{ item.categoryName || '未分类' }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">标签</span>
              <span class="meta-value tag-pill">{{ item.tag }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">热度</span>
              <span class="meta-value hot-num">🔥 {{ item.hot }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">编号</span>
              <span class="meta-value">#{{ String(item.id).padStart(4, '0') }}</span>
            </div>
          </div>

          <div class="detail-actions">
            <button class="btn-buy" @click="buyNow">🛒 立即抢购</button>
            <button class="btn-cart" @click="addCart">➕ 加入购物车</button>
            <button class="btn-back" @click="goBack">← 返回</button>
          </div>
        </div>
      </div>

      <!-- 推荐相似商品 -->
      <div class="recommend-section">
        <div class="section-head">
          <h2>🐠 相似推荐</h2>
          <span class="section-tip">派大星也在看</span>
        </div>
        <div v-if="similarItems.length" class="card-grid">
          <article
            v-for="s in similarItems"
            :key="s.id"
            class="item-card"
            @click="goDetail(s.id)"
          >
            <div class="item-icon">{{ s.icon }}</div>
            <h3 class="item-title">{{ s.title }}</h3>
            <p class="item-desc">{{ s.desc }}</p>
            <div class="item-meta">
              <span v-if="s.categoryName" class="cat-name">{{ s.categoryName }}</span>
              <span class="tag">{{ s.tag }}</span>
            </div>
          </article>
        </div>
        <div v-else class="placeholder-small">暂时没有相似商品了</div>
      </div>
    </template>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageShell from './PageShell.vue'
import { searchApi } from '../api/home'
import { useCart } from '../cart'

const route = useRoute()
const router = useRouter()
const { add: addToCart } = useCart()

const item = ref(null)
const loading = ref(true)
const toast = ref('')
let toastTimer = null

/** 卡片上的海绵孔洞装饰 */
const holes = [
  { width: '18px', height: '18px', top: '14px', right: '18px' },
  { width: '12px', height: '12px', bottom: '16px', left: '14px' },
]

/** 相似推荐：同分类下的其他商品 */
const similarItems = computed(() => {
  if (!item.value) return []
  // 从 searchApi 缓存里拿不到，直接用当前 item 的 categoryId 调一次搜索
  return similar.value
})
const similar = ref([])

onMounted(async () => {
  await loadItem()
  await loadSimilar()
})

async function loadItem() {
  const id = Number(route.params.id)
  loading.value = true
  try {
    // 通过搜索接口拿全量，再按 id 过滤（后端暂无单条详情接口）
    const res = await searchApi()
    const list = res.data || []
    item.value = list.find((it) => it.id === id) || null
  } catch {
    item.value = null
  } finally {
    loading.value = false
  }
}

async function loadSimilar() {
  if (!item.value) return
  try {
    const res = await searchApi('', item.value.categoryId)
    const list = (res.data || []).filter((it) => it.id !== item.value.id)
    similar.value = list.slice(0, 4)
  } catch {
    similar.value = []
  }
}

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2000)
}

function buyNow() {
  if (!item.value) return
  addToCart(item.value)
  showToast(`已下单「${item.value.title}」！蟹老板开心数钱中～`)
}

function addCart() {
  if (!item.value) return
  addToCart(item.value)
  showToast(`「${item.value.title}」已加入购物车 🛒`)
}

function goBack() {
  router.push('/home')
}

function goDetail(id) {
  router.push(`/item/${id}`)
}
</script>

<style scoped>
/* ===== 详情页布局 ===== */
.detail-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 28px;
  align-items: start;
}

/* ===== 左侧大图区 ===== */
.detail-visual {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: linear-gradient(160deg, #FDE047, #FACC15);
  border: 4px solid #FBBF24;
  border-radius: 24px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, .22), inset 0 -6px 0 rgba(0, 0, 0, .07);
  min-height: 280px;
}
.detail-icon {
  font-size: 90px;
  line-height: 1;
  filter: drop-shadow(0 5px 8px rgba(0, 0, 0, .2));
  animation: bob 3s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50%      { transform: translateY(-8px) rotate(4deg); }
}
.detail-category-tag {
  margin-top: 16px;
  padding: 5px 16px;
  background: rgba(255, 251, 235, .9);
  border: 2px solid #34D399;
  border-radius: 999px;
  color: #047857;
  font-size: 13px;
  font-weight: bold;
}
.hole {
  position: absolute;
  border-radius: 50%;
  background: rgba(180, 83, 9, .15);
}

/* ===== 右侧信息区 ===== */
.detail-info {
  padding: 8px 0;
}
.detail-title {
  color: #fff;
  font-size: 30px;
  letter-spacing: 2px;
  text-shadow: 0 3px 8px rgba(0, 0, 0, .28);
  margin-bottom: 12px;
}
.detail-desc {
  color: #E0F2FE;
  font-size: 15px;
  line-height: 1.8;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .2);
  margin-bottom: 24px;
}

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 16px;
  background: rgba(255, 251, 235, .92);
  border-radius: 14px;
}
.meta-label {
  min-width: 50px;
  color: #92400E;
  font-size: 13px;
  font-weight: bold;
}
.meta-value {
  color: #7C2D12;
  font-size: 14px;
  font-weight: bold;
}
.tag-pill {
  padding: 2px 12px;
  background: #FEF3C7;
  border: 2px solid #F59E0B;
  border-radius: 999px;
  color: #B45309;
  font-size: 12px;
}
.hot-num {
  color: #B91C1C;
}

/* ===== 操作按钮 ===== */
.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.btn-buy {
  padding: 12px 28px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(180deg, #FB7185, #E11D48);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 0 #9F1239;
  transition: transform .1s, box-shadow .1s, filter .2s;
}
.btn-buy:hover { filter: brightness(1.06); }
.btn-buy:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #9F1239;
}
.btn-cart {
  padding: 12px 24px;
  border: 2px solid #34D399;
  border-radius: 14px;
  background: linear-gradient(180deg, #34D399, #059669);
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 0 #047857;
  transition: transform .1s, box-shadow .1s, filter .2s;
}
.btn-cart:hover { filter: brightness(1.06); }
.btn-cart:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #047857;
}
.btn-back {
  padding: 12px 20px;
  border: 2px solid #7DD3FC;
  border-radius: 14px;
  background: rgba(255, 255, 255, .9);
  color: #0369A1;
  font-family: inherit;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background .2s;
}
.btn-back:hover { background: #fff; }

/* ===== 加载 / 空状态 ===== */
.loading-box, .empty-box {
  padding: 60px 20px;
  background: rgba(255, 251, 235, .93);
  border: 3px dashed #F59E0B;
  border-radius: 22px;
  text-align: center;
}
.loading-text {
  color: #92400E;
  font-size: 16px;
}
.empty-title {
  color: #7C2D12;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}
.empty-tip {
  color: #B45309;
  font-size: 14px;
  margin-bottom: 20px;
}

/* ===== 相似推荐 ===== */
.recommend-section {
  margin-top: 40px;
}
.section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.section-head h2 {
  color: #fff;
  font-size: 20px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, .28);
}
.section-tip {
  color: #E0F2FE;
  font-size: 13px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.item-card {
  position: relative;
  overflow: hidden;
  padding: 18px 16px 14px;
  background: linear-gradient(160deg, #FDE047, #FACC15);
  border: 4px solid #FBBF24;
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, .2), inset 0 -5px 0 rgba(0, 0, 0, .07);
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;
}
.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 30px rgba(0, 0, 0, .26), inset 0 -5px 0 rgba(0, 0, 0, .07);
}
.item-icon {
  font-size: 32px;
  line-height: 1;
}
.item-title {
  margin: 8px 0 4px;
  color: #7C2D12;
  font-size: 16px;
  letter-spacing: 1px;
}
.item-desc {
  min-height: 38px;
  color: #92400E;
  font-size: 12px;
  line-height: 1.6;
}
.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}
.cat-name {
  padding: 2px 8px;
  background: rgba(255, 251, 235, .9);
  border: 2px solid #34D399;
  border-radius: 999px;
  color: #047857;
  font-size: 10px;
  font-weight: bold;
}
.tag {
  padding: 2px 9px;
  background: rgba(255, 251, 235, .9);
  border: 2px solid #F59E0B;
  border-radius: 999px;
  color: #B45309;
  font-size: 11px;
  font-weight: bold;
}
.placeholder-small {
  padding: 24px;
  background: rgba(255, 251, 235, .9);
  border: 2px dashed #F59E0B;
  border-radius: 16px;
  color: #92400E;
  font-size: 13px;
  text-align: center;
}

/* ===== 小屏适配 ===== */
@media (max-width: 760px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
  .detail-visual {
    min-height: 200px;
    padding: 28px 16px;
  }
  .detail-icon {
    font-size: 64px;
  }
  .detail-title {
    font-size: 24px;
  }
}
</style>
