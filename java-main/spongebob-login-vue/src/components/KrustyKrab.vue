<template>
  <PageShell
    title="🍔 蟹堡王"
    subtitle="海之霸永远偷不走的那份秘方，今天依旧排着长队"
    :toast="toast"
    footer-text="蟹堡王 · 菜单价格均为比奇堡币（¥）演示数据，下单不会真的扣钱"
  >
    <template #hero>
      <div class="tag-row">
        <button
          v-for="t in TABS"
          :key="t"
          class="tag-btn"
          :class="{ active: tab === t }"
          @click="tab = t"
        >
          {{ t }}
        </button>
      </div>
    </template>

    <div class="krab-layout">
      <!-- 菜单 -->
      <div>
        <div class="section-head">
          <h2>今日菜单</h2>
          <span class="section-tip">共 {{ visibleMenu.length }} 道</span>
        </div>

        <div v-if="visibleMenu.length" class="pcard-grid">
          <article v-for="dish in visibleMenu" :key="dish.id" class="pcard dish-card">
            <div class="dish-icon">{{ dish.icon }}</div>
            <h3 class="pcard-title">{{ dish.name }}</h3>
            <p class="pcard-desc">{{ dish.desc }}</p>
            <div class="dish-foot">
              <span class="price">¥{{ dish.price.toFixed(2) }}</span>
              <span class="pill">{{ dish.tag }}</span>
            </div>
            <button class="btn-sea dish-add" @click="addToCart(dish)">
              + 加入订单
            </button>
          </article>
        </div>
        <div v-else class="empty-box">🫧 这个分类暂时卖完了，蟹老板正在后厨翻冰箱。</div>
      </div>

      <!-- 购物车 -->
      <aside class="panel cart">
        <div class="panel-title">
          🧾 我的订单
          <span class="panel-extra">{{ totalCount }} 件</span>
        </div>

        <ul v-if="cartItems.length" class="cart-list">
          <li v-for="row in cartItems" :key="row.id" class="cart-item">
            <span class="cart-icon">{{ row.icon }}</span>
            <div class="cart-info">
              <div class="cart-name">{{ row.name }}</div>
              <div class="cart-unit">¥{{ row.price.toFixed(2) }} / 份</div>
            </div>
            <div class="qty">
              <button class="qty-btn" @click="changeQty(row.id, -1)">−</button>
              <span class="qty-num">{{ row.qty }}</span>
              <button class="qty-btn" @click="changeQty(row.id, 1)">+</button>
            </div>
          </li>
        </ul>
        <p v-else class="cart-empty">订单还是空的，左边挑两道吧～</p>

        <div class="cart-sum">
          <div class="sum-row">
            <span>小计</span>
            <span>¥{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="sum-row">
            <span>海洋保护税（5%）</span>
            <span>¥{{ tax.toFixed(2) }}</span>
          </div>
          <div class="sum-row total">
            <span>合计</span>
            <span>¥{{ total.toFixed(2) }}</span>
          </div>
        </div>

        <div class="cart-actions">
          <button class="btn-sea" :disabled="!cartItems.length" @click="checkout">
            结 账
          </button>
          <button class="btn-amber" :disabled="!cartItems.length" @click="clearCart">
            清空订单
          </button>
        </div>
      </aside>
    </div>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageShell from './PageShell.vue'

/** 菜单数据：价格单位为比奇堡币（¥），纯演示用 */
const MENU = [
  { id: 1, icon: '🍔', name: '招牌蟹黄堡', price: 12, tag: '主食', desc: '秘方面包 + 海藻肉饼 + 珊瑚奶酪，蟹老板的命根子。' },
  { id: 2, icon: '🍟', name: '海霸王薯条', price: 8, tag: '主食', desc: '现炸酥脆，趁热吃，凉了它可能会跟你聊天。' },
  { id: 3, icon: '🍕', name: '海之霸披萨（仿）', price: 11, tag: '主食', desc: '痞老板出品，据说每份附赠窃听器一枚。' },
  { id: 4, icon: '🥤', name: '海藻气泡水', price: 6, tag: '饮料', desc: '喝一口能吐三分钟泡泡，珊迪说这叫碳酸反应。' },
  { id: 5, icon: '☕', name: '章鱼哥特调', price: 10, tag: '饮料', desc: '苦到让人沉思人生的深海咖啡，附赠一声叹息。' },
  { id: 6, icon: '🧋', name: '泡泡奶茶', price: 7, tag: '饮料', desc: '里面的珍珠是会往上飘的小气泡。' },
  { id: 7, icon: '🍦', name: '海藻冰淇淋', price: 9, tag: '甜点', desc: '珊迪的配方，清爽里带一点海的味道。' },
  { id: 8, icon: '🥧', name: '珊瑚派', price: 15, tag: '甜点', desc: '蟹老板私藏，只有节假日才肯做上一炉。' },
]

const TABS = ['全部', '主食', '饮料', '甜点']

const tab = ref('全部')
/** id -> 份数 */
const cart = ref({})
const toast = ref('')
let toastTimer = null

const visibleMenu = computed(() =>
  tab.value === '全部' ? MENU : MENU.filter((d) => d.tag === tab.value)
)

const cartItems = computed(() =>
  MENU.filter((d) => cart.value[d.id] > 0).map((d) => ({ ...d, qty: cart.value[d.id] }))
)

const totalCount = computed(() =>
  Object.values(cart.value).reduce((sum, n) => sum + n, 0)
)
const subtotal = computed(() =>
  cartItems.value.reduce((sum, row) => sum + row.price * row.qty, 0)
)
const tax = computed(() => subtotal.value * 0.05)
const total = computed(() => subtotal.value + tax.value)

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2000)
}

function addToCart(dish) {
  cart.value[dish.id] = (cart.value[dish.id] || 0) + 1
  showToast(`${dish.name} 已加入订单`)
}

function changeQty(id, delta) {
  const next = (cart.value[id] || 0) + delta
  if (next <= 0) {
    delete cart.value[id]
    return
  }
  cart.value[id] = next
}

function clearCart() {
  cart.value = {}
  showToast('订单已清空，蟹老板不太高兴')
}

function checkout() {
  showToast(`结账成功！共 ${totalCount.value} 件，¥${total.value.toFixed(2)}，谢谢光临～`)
  cart.value = {}
}
</script>

<style scoped>
/* ===== 分类标签 ===== */
.tag-row {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
.tag-btn {
  padding: 6px 18px;
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
.tag-btn:hover {
  background: #fff;
  transform: translateY(-2px);
}
.tag-btn.active {
  background: linear-gradient(180deg, #34D399, #059669);
  border-color: #059669;
  color: #fff;
  box-shadow: 0 3px 0 #047857;
}

/* ===== 布局 ===== */
.krab-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
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

/* ===== 菜品卡片 ===== */
.dish-card {
  display: flex;
  flex-direction: column;
}
.dish-icon {
  font-size: 36px;
  line-height: 1;
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, .18));
}
.dish-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}
.price {
  color: #B91C1C;
  font-size: 18px;
  font-weight: bold;
}
.dish-add {
  margin-top: 12px;
  width: 100%;
  font-size: 13px;
}

/* ===== 订单面板 ===== */
.cart {
  position: sticky;
  top: 88px;
  background: rgba(255, 251, 235, .96);
}
.cart-list {
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px dashed #FCD34D;
}
.cart-icon { font-size: 20px; }
.cart-info { flex: 1; min-width: 0; }
.cart-name {
  font-size: 13px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cart-unit {
  color: #B45309;
  font-size: 11px;
}
.qty {
  display: flex;
  align-items: center;
  gap: 6px;
}
.qty-btn {
  width: 24px;
  height: 24px;
  border: 2px solid #FBBF24;
  border-radius: 8px;
  background: #FEF3C7;
  color: #92400E;
  font-size: 13px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
}
.qty-btn:hover { background: #FDE68A; }
.qty-num {
  min-width: 18px;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
}

.cart-empty {
  padding: 18px 0;
  font-size: 13px;
  text-align: center;
  color: #B45309;
}
.cart-sum {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 2px dashed #F59E0B;
}
.sum-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 13px;
}
.sum-row.total {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid #FDE68A;
  color: #7C2D12;
  font-size: 16px;
  font-weight: bold;
}
.cart-actions {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 860px) {
  .krab-layout { grid-template-columns: 1fr; }
  .cart { position: static; }
}
</style>
