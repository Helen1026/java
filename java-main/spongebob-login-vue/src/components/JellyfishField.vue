<template>
  <PageShell
    title="🪼 水母田"
    subtitle="比奇堡最著名的一片水母田，带上水母网，别把派大星落下"
    :toast="toast"
    footer-text="水母田图鉴 · 捕捞记录保存在本地，换个皮肤别怪水母跑掉"
  >
    <template #hero>
      <!-- 捕捞统计 -->
      <div class="stat-bar">
        <div class="stat">
          <span class="stat-num">{{ caughtKinds }}<em>/{{ jellyfish.length }}</em></span>
          <span class="stat-label">已收集种类</span>
        </div>
        <div class="stat">
          <span class="stat-num">{{ totalCaught }}</span>
          <span class="stat-label">累计捕获</span>
        </div>
        <div class="stat">
          <span class="stat-num">{{ basket.length }}</span>
          <span class="stat-label">鱼篓中</span>
        </div>
      </div>

      <!-- 稀有度筛选 -->
      <div class="filter-row">
        <button
          v-for="r in RARITY_FILTERS"
          :key="r"
          class="pill-btn"
          :class="{ active: rarity === r }"
          @click="rarity = r"
        >
          {{ r }}
        </button>
      </div>
    </template>

    <div class="field-layout">
      <!-- 图鉴 -->
      <div>
        <div class="section-head">
          <h2>水母图鉴</h2>
          <span class="section-tip">点击卡片即可挥网捕捞</span>
        </div>

        <div v-if="visibleList.length" class="pcard-grid">
          <article
            v-for="j in visibleList"
            :key="j.id"
            class="pcard hoverable jelly-card"
            :style="{ '--jelly': j.color }"
            @click="catchOne(j)"
          >
            <div class="jelly-glow"></div>
            <div class="pcard-icon jelly-icon">{{ j.icon }}</div>
            <h3 class="pcard-title">{{ j.name }}</h3>
            <p class="pcard-desc">{{ j.desc }}</p>
            <div class="jelly-meta">
              <span class="pill" :class="'r-' + j.rarity">{{ j.rarity }}</span>
              <span class="stars" :title="'捕捞难度 ' + j.difficulty + ' 星'">
                {{ '★'.repeat(j.difficulty) }}{{ '☆'.repeat(5 - j.difficulty) }}
              </span>
            </div>
            <div v-if="caughtMap[j.id]" class="caught-badge">
              已捕获 ×{{ caughtMap[j.id] }}
            </div>
          </article>
        </div>
        <div v-else class="empty-box">🫧 这一片水母田空空的，换种稀有度看看？</div>
      </div>

      <!-- 鱼篓 -->
      <aside class="panel basket">
        <div class="panel-title">
          🧺 我的鱼篓
          <span class="panel-extra">{{ basket.length }} 只</span>
        </div>

        <ul v-if="basket.length" class="basket-list">
          <li v-for="(b, i) in basket" :key="i" class="basket-item">
            <span class="basket-icon">{{ b.icon }}</span>
            <span class="basket-name">{{ b.name }}</span>
            <button class="basket-del" title="放生" @click="release(i)">✕</button>
          </li>
        </ul>
        <p v-else class="basket-empty">还没抓到水母，去左边试试手气～</p>

        <div class="basket-actions">
          <button class="btn-sea" :disabled="!basket.length" @click="keepAll">
            全部收进图鉴
          </button>
          <button class="btn-amber" :disabled="!basket.length" @click="basket = []">
            全部放生
          </button>
        </div>
      </aside>
    </div>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageShell from './PageShell.vue'

/** 图鉴数据：稀有度 / 捕捞难度参照比奇堡水母田的“民间说法” */
const jellyfish = [
  { id: 1, icon: '🪼', name: '粉红水母', rarity: '常见', difficulty: 1, color: '#FBCFE8', desc: '比奇堡海域最常见的小家伙，轻轻一碰就会亮起来。' },
  { id: 2, icon: '🎐', name: '风铃水母', rarity: '常见', difficulty: 1, color: '#BAE6FD', desc: '游动时叮咚作响，章鱼哥嘴上嫌弃，其实会偷偷听。' },
  { id: 3, icon: '🌊', name: '蓝纹水母', rarity: '常见', difficulty: 2, color: '#93C5FD', desc: '喜欢跟着洋流旅行，成群结队地路过菠萝屋的窗户。' },
  { id: 4, icon: '🫧', name: '泡泡水母', rarity: '稀有', difficulty: 3, color: '#A5F3FC', desc: '身体像肥皂泡，抓它之前最好先学会吹泡泡。' },
  { id: 5, icon: '🌸', name: '花帽水母', rarity: '稀有', difficulty: 3, color: '#FED7AA', desc: '头顶一朵海花，珊迪用它做过一整套研究样本。' },
  { id: 6, icon: '✨', name: '星光水母', rarity: '稀有', difficulty: 4, color: '#E9D5FF', desc: '夜里会拼出星座图案，只在满月那几天浮上来。' },
  { id: 7, icon: '🔮', name: '水晶水母', rarity: '传说', difficulty: 5, color: '#C7D2FE', desc: '透明的身体能映出三秒后的未来，派大星说看到了蟹黄堡。' },
  { id: 8, icon: '👑', name: '水母女王', rarity: '传说', difficulty: 5, color: '#FDE68A', desc: '传说里统领整片水母田的女王，亲眼见过的人不足三个。' },
  // —— 以下为新增种类，丰富图鉴 ——
  { id: 9, icon: '🟡', name: '柠檬水母', rarity: '常见', difficulty: 1, color: '#FEF08A', desc: '酸酸甜甜的小水母，派大星说它闻起来像被太阳晒过的泡泡。' },
  { id: 10, icon: '🍃', name: '苔藓水母', rarity: '常见', difficulty: 2, color: '#BBF7D0', desc: '总爱趴在礁石上装苔藓，一碰就“噗”地弹开。' },
  { id: 11, icon: '🐟', name: '小鱼水母', rarity: '常见', difficulty: 2, color: '#A7F3D0', desc: '长得像一条迷路的小鱼，其实是个社恐水母。' },
  { id: 12, icon: '🔥', name: '焰心水母', rarity: '稀有', difficulty: 3, color: '#FCA5A5', desc: '身体里封着一小团海底火山的热度，靠近能暖手。' },
  { id: 13, icon: '🌀', name: '漩涡水母', rarity: '稀有', difficulty: 4, color: '#67E8F9', desc: '自带迷你洋流，抓它会被带着转三圈才停。' },
  { id: 14, icon: '🌿', name: '海草水母', rarity: '稀有', difficulty: 3, color: '#86EFAC', desc: '身上缠满会发光的小海草，珊迪拿它当夜灯。' },
  { id: 15, icon: '💎', name: '宝石水母', rarity: '稀有', difficulty: 4, color: '#C4B5FD', desc: '半透明的身体里像镶了碎钻，蟹老板出高价收。' },
  { id: 16, icon: '🌟', name: '极光水母', rarity: '传说', difficulty: 5, color: '#A7F3D0', desc: '只有连续三个无月之夜才会出现，拖出一条极光尾巴。' },
  { id: 17, icon: '🦑', name: '墨玉水母', rarity: '传说', difficulty: 5, color: '#6B7280', desc: '通体乌黑发亮，章鱼哥说它像极了他失恋那晚的画。' },
  { id: 18, icon: '🐉', name: '龙王水母', rarity: '神话', difficulty: 5, color: '#FBBF24', desc: '传说中水母田的守护神，被它点过名的人会好运一整年。' },
  { id: 19, icon: '👁️', name: '虚空水母', rarity: '神话', difficulty: 5, color: '#A78BFA', desc: '几乎没人见过全貌，只偶尔飘过一只眼睛形状的影子。' },
  { id: 20, icon: '🌈', name: '虹光水母', rarity: '神话', difficulty: 5, color: '#F9A8D4', desc: '游过之处留下一道彩虹，孩子们追着它跑过整个比奇堡。' },
]

const RARITY_FILTERS = ['全部', '常见', '稀有', '传说', '神话']

const rarity = ref('全部')
const basket = ref([])
/** id -> 已捕获数量 */
const caughtMap = ref({})
const toast = ref('')
let toastTimer = null

const visibleList = computed(() =>
  rarity.value === '全部' ? jellyfish : jellyfish.filter((j) => j.rarity === rarity.value)
)

const caughtKinds = computed(() => Object.keys(caughtMap.value).length)
const totalCaught = computed(() =>
  Object.values(caughtMap.value).reduce((sum, n) => sum + n, 0)
)

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2000)
}

/** 挥网捕捞：难度越高越容易“溜走”，捕到就放进鱼篓 */
function catchOne(j) {
  const luck = Math.random() * 5
  if (luck < j.difficulty - 1) {
    showToast(`${j.name}闪了一下就溜走了…再试一次？`)
    return
  }
  basket.value.push({ ...j })
  showToast(`抓到一只${j.name}！`)
}

function release(index) {
  const [gone] = basket.value.splice(index, 1)
  showToast(`把${gone.name}放回海里了～`)
}

/** 鱼篓结算：计入图鉴收集进度 */
function keepAll() {
  basket.value.forEach((b) => {
    caughtMap.value[b.id] = (caughtMap.value[b.id] || 0) + 1
  })
  const n = basket.value.length
  basket.value = []
  showToast(`图鉴 +${n}，蟹老板说这活儿干得漂亮`)
}
</script>

<style scoped>
/* ===== 统计条 ===== */
.stat-bar {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.stat {
  min-width: 128px;
  padding: 12px 20px;
  background: rgba(255, 251, 235, .93);
  border: 3px solid #FBBF24;
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, .18);
}
.stat-num {
  display: block;
  color: #7C2D12;
  font-size: 24px;
  font-weight: bold;
}
.stat-num em {
  color: #B45309;
  font-size: 14px;
  font-style: normal;
}
.stat-label {
  color: #92400E;
  font-size: 12px;
}

/* ===== 稀有度筛选 ===== */
.filter-row {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
.pill-btn {
  padding: 6px 16px;
  border: 2px solid #7DD3FC;
  border-radius: 999px;
  background: rgba(255, 255, 255, .9);
  color: #0369A1;
  font-family: inherit;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: background .2s, color .2s, transform .1s;
}
.pill-btn:hover {
  background: #fff;
  transform: translateY(-2px);
}
.pill-btn.active {
  background: linear-gradient(180deg, #34D399, #059669);
  border-color: #059669;
  color: #fff;
  box-shadow: 0 3px 0 #047857;
}

/* ===== 布局：图鉴 + 鱼篓 ===== */
.field-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 22px;
  align-items: start;
}
.section-head {
  display: flex;
  flex-wrap: wrap;
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
  font-size: 12px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}

/* ===== 水母卡片 ===== */
.jelly-card {
  text-align: left;
}
.jelly-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--jelly, #BAE6FD), transparent 70%);
  opacity: .85;
  pointer-events: none;
}
.jelly-icon {
  position: relative;
  animation: float 3.2s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
.jelly-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
}
.stars {
  color: #B45309;
  font-size: 12px;
  letter-spacing: 1px;
}
.r-常见 { border-color: #34D399; color: #047857; }
.r-稀有 { border-color: #3B82F6; color: #1D4ED8; }
.r-传说 { border-color: #F59E0B; color: #B45309; }
.r-神话 { border-color: #D946EF; color: #A21CAF; background: rgba(217, 70, 239, .08); }

.caught-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 2px 9px;
  background: rgba(4, 120, 87, .92);
  border-radius: 999px;
  color: #ECFDF5;
  font-size: 11px;
  font-weight: bold;
}

/* ===== 鱼篓 ===== */
.basket {
  position: sticky;
  top: 88px;
  background: rgba(255, 251, 235, .96);
}
.basket-list {
  list-style: none;
  max-height: 320px;
  overflow-y: auto;
}
.basket-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 4px;
  border-bottom: 1px dashed #FCD34D;
  font-size: 13px;
}
.basket-icon { font-size: 18px; }
.basket-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
}
.basket-del {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: #FEE2E2;
  color: #B91C1C;
  font-size: 11px;
  cursor: pointer;
}
.basket-del:hover { background: #FECACA; }
.basket-empty {
  padding: 18px 0;
  font-size: 13px;
  text-align: center;
  color: #B45309;
}
.basket-actions {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 860px) {
  .field-layout { grid-template-columns: 1fr; }
  .basket { position: static; }
}
</style>
