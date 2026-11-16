<template>
  <div ref="wrapRef" class="cart-wrap">
    <button
      class="cart-btn"
      :class="{ 'is-open': open }"
      :title="`购物车（${count} 件）`"
      @click="toggle"
    >
      <span class="cart-emoji">🛒</span>
      <span v-if="count" class="cart-badge">{{ count > 99 ? '99+' : count }}</span>
    </button>

    <transition name="cart-pop">
      <section v-if="open" class="cart-panel">
        <header class="cart-head">
          <span class="cart-head-title">
            我的购物车
            <span v-if="synced" class="cart-sync" title="已保存到账号，换设备登录也在">☁️ 已同步</span>
          </span>
          <button v-if="items.length" class="cart-clear" @click="clearAll">清空</button>
        </header>

        <ul v-if="items.length" class="cart-list">
          <li v-for="row in items" :key="row.goodsKey" class="cart-row">
            <span class="cart-icon">{{ row.icon }}</span>
            <div class="cart-info">
              <div class="cart-title" :title="row.title">{{ row.title }}</div>
              <div class="cart-sub">
                <span v-if="row.tag" class="cart-tag">{{ row.tag }}</span>
                <span v-if="row.source === 'krusty'" class="cart-tag krusty">蟹堡王</span>
                <span v-if="row.price > 0" class="cart-price">¥{{ row.price.toFixed(2) }}</span>
              </div>
            </div>
            <div class="cart-ops">
              <button class="cart-step" title="减少" @click="setQty(row.goodsKey, row.qty - 1)">−</button>
              <span class="cart-qty">{{ row.qty }}</span>
              <button class="cart-step" title="增加" @click="setQty(row.goodsKey, row.qty + 1)">+</button>
              <button class="cart-del" title="从购物车移除" @click="remove(row.goodsKey)">✕</button>
            </div>
          </li>
        </ul>

        <p v-else class="cart-empty">车里空空如也，去抓点水母吧 🪼</p>

        <footer v-if="items.length" class="cart-foot">
          <div class="cart-total">
            共 {{ count }} 件<template v-if="hasPrice"> · 合计 <b>¥{{ total.toFixed(2) }}</b></template>
          </div>
          <button class="cart-checkout" @click="checkout">去结算</button>
        </footer>
      </section>
    </transition>

    <transition name="cart-tip-fade">
      <div v-if="tip" class="cart-tip">{{ tip }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useCart } from '../cart'
import { recordOrder } from '../points'

/**
 * 导航栏购物车按钮：显示件数角标，点击展开下拉面板。
 * 项目没有独立的 /cart 路由，所以用面板承载「查看 / 增减 / 结算」。
 */
const {
  items,
  count,
  total,
  hasPrice,
  synced,
  setQty,
  remove,
  clear,
  checkout: submitCart,
} = useCart()

const open = ref(false)
const wrapRef = ref(null)
const tip = ref('')
let tipTimer = null

function toggle() {
  open.value = !open.value
}

function flash(msg) {
  tip.value = msg
  clearTimeout(tipTimer)
  tipTimer = setTimeout(() => {
    tip.value = ''
  }, 2200)
}

/** 结算：走后端 /api/cart/checkout 清空服务端购物车，再记一次下单积分 */
async function checkout() {
  if (!items.value.length) return
  const res = await submitCart()
  if (!res.ok) {
    flash('结算失败，请稍后再试')
    return
  }
  open.value = false
  const award = recordOrder()
  flash(
    `订单已提交（${res.count} 件）` +
      (award.ok ? `，积分 +${award.points} 🪙` : '，今日下单积分已拿满 💰')
  )
}

function clearAll() {
  clear()
}

/** 点击面板外部或按 Esc 关闭 */
function onDocClick(event) {
  if (!open.value) return
  if (wrapRef.value && !wrapRef.value.contains(event.target)) open.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape' && open.value) open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
  clearTimeout(tipTimer)
})
</script>

<style scoped>
.cart-wrap {
  position: relative;
  display: inline-flex;
}

/* ===== 按钮 ===== */
.cart-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  padding: 0;
  border: 2px solid #FBBF24;
  border-radius: var(--r-pill);
  background: #FFFBEB;
  font-family: inherit;
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
  transition: background .2s, transform .1s, box-shadow .2s;
}
.cart-btn:hover {
  background: #FEF3C7;
  transform: translateY(-1px);
}
.cart-btn.is-open {
  background: linear-gradient(180deg, #FDE047, #FACC15);
  box-shadow: 0 3px 0 #D97706;
}
.cart-emoji { display: block; }

.cart-badge {
  position: absolute;
  top: -7px;
  right: -7px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--r-pill);
  background: linear-gradient(180deg, #FB7185, #E11D48);
  color: #fff;
  font-size: 11px;
  font-weight: bold;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
}

/* ===== 面板 ===== */
.cart-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 60;
  width: 308px;
  padding: 12px;
  border: 3px solid #FBBF24;
  border-radius: var(--r-card);
  background: #FFFBEB;
  box-shadow: 0 14px 32px rgba(12, 74, 110, .28);
}

.cart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 2px dashed #FDE68A;
}
.cart-head-title {
  font-size: 14px;
  font-weight: bold;
  color: #7C2D12;
}
.cart-clear {
  padding: 3px 9px;
  border: none;
  border-radius: var(--r-pill);
  background: #FEE2E2;
  color: #B91C1C;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}
.cart-clear:hover { background: #FECACA; }
.cart-sync {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: var(--r-pill);
  background: #D1FAE5;
  color: #047857;
  font-size: 10px;
  font-weight: normal;
  vertical-align: middle;
}

.cart-list {
  max-height: 268px;
  margin: 0;
  padding: 6px 0 0;
  overflow-y: auto;
  list-style: none;
}
.cart-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-radius: var(--r-field);
}
.cart-row:hover { background: #FEF9E7; }

.cart-icon { font-size: 20px; line-height: 1; }
.cart-info { flex: 1; min-width: 0; }
.cart-title {
  font-size: 13px;
  font-weight: bold;
  color: #7C2D12;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cart-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.cart-tag {
  padding: 1px 7px;
  border-radius: var(--r-pill);
  background: #DBEAFE;
  color: #1D4ED8;
  font-size: 11px;
}
.cart-tag.krusty {
  background: #FFE4E6;
  color: #BE123C;
}
.cart-price {
  font-size: 12px;
  font-weight: bold;
  color: #B45309;
}

.cart-ops {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.cart-step {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 2px solid #FBBF24;
  border-radius: var(--r-pill);
  background: #fff;
  color: #92400E;
  font-family: inherit;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
}
.cart-step:hover { background: #FEF3C7; }
.cart-del {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: var(--r-pill);
  background: #FEE2E2;
  color: #B91C1C;
  font-family: inherit;
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
}
.cart-del:hover { background: #FECACA; }
.cart-qty {
  min-width: 20px;
  text-align: center;
  font-size: 13px;
  font-weight: bold;
  color: #7C2D12;
}

.cart-empty {
  padding: 22px 8px;
  text-align: center;
  font-size: 13px;
  color: #B45309;
}

.cart-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 2px dashed #FDE68A;
}
.cart-total {
  font-size: 12px;
  color: #92400E;
}
.cart-total b { color: #B45309; font-size: 14px; }

.cart-checkout {
  padding: 7px 16px;
  border: none;
  border-radius: var(--r-pill);
  background: linear-gradient(180deg, #34D399, #059669);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 3px 0 #047857;
}
.cart-checkout:active { transform: translateY(2px); box-shadow: none; }

/* ===== 轻提示 ===== */
.cart-tip {
  position: fixed;
  left: 50%;
  bottom: 40px;
  z-index: 999;
  transform: translateX(-50%);
  padding: 10px 22px;
  border-radius: var(--r-pill);
  background: rgba(124, 45, 18, .92);
  color: #FFFBEB;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
  pointer-events: none;
}

/* ===== 过渡 ===== */
.cart-pop-enter-active,
.cart-pop-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.cart-pop-enter-from,
.cart-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(.97);
}
.cart-tip-fade-enter-active,
.cart-tip-fade-leave-active {
  transition: opacity .25s ease;
}
.cart-tip-fade-enter-from,
.cart-tip-fade-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .cart-panel { width: 264px; }
}
</style>
