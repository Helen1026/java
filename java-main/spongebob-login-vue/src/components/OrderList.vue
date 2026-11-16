<template>
  <PageShell
    title="🧾 我的订单"
    subtitle="蟹堡王与比奇堡好物的下单记录，支持付款、取消与历史查询"
    :toast="toast"
    footer-text="订单状态：待付款 / 已完成 / 已取消 · 历史订单长期保留"
  >
    <!-- 状态筛选 -->
    <div class="tag-row">
      <button
        v-for="t in TABS"
        :key="t.value"
        class="tag-btn"
        :class="{ active: activeStatus === t.value }"
        @click="switchTab(t.value)"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 订单列表 -->
    <div v-if="loading" class="empty-box">🫧 正在打捞订单记录…</div>

    <div v-else-if="orders.length" class="order-list">
      <article v-for="order in orders" :key="order.id" class="panel order-card">
        <!-- 卡片头：订单号 + 状态 + 时间 -->
        <div class="order-head">
          <div class="order-no">🧾 单号：{{ order.orderNo }}</div>
          <span class="status-badge" :class="'st-' + order.status">{{ statusText(order.status) }}</span>
        </div>
        <div class="order-time">下单时间：{{ formatTime(order.createTime) }}</div>
        <div v-if="order.remark" class="order-remark">📝 {{ order.remark }}</div>

        <!-- 明细 -->
        <ul class="item-list">
          <li v-for="it in order.items" :key="it.id" class="item-row">
            <span class="item-icon">{{ it.icon }}</span>
            <div class="item-info">
              <div class="item-name">{{ it.name }}</div>
              <div class="item-price">¥{{ fmt(it.price) }} × {{ it.quantity }}</div>
            </div>
            <span class="item-line">¥{{ fmt(it.lineTotal) }}</span>
          </li>
        </ul>

        <!-- 金额 + 操作 -->
        <div class="order-foot">
          <div class="amounts">
            <span>小计 ¥{{ fmt(order.subtotal) }}</span>
            <span>税费 ¥{{ fmt(order.taxAmount) }}</span>
            <span class="total">合计 ¥{{ fmt(order.totalAmount) }}</span>
          </div>
          <div class="actions">
            <template v-if="order.status === ORDER_STATUS.PENDING">
              <button class="btn-sea" @click="pay(order)">💳 付款</button>
              <button class="btn-amber" @click="cancel(order)">取消订单</button>
            </template>
            <span v-else class="done-tip">{{ order.status === ORDER_STATUS.DONE ? '订单已完成，感谢光临' : '订单已取消' }}</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="empty-box">
      🫧 还没有相关订单记录<br>
      <span class="empty-tip">去蟹堡王点一份蟹黄堡，或在首页挑件好物吧～</span>
    </div>
  </PageShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageShell from './PageShell.vue'
import {
  listOrdersApi,
  payOrderApi,
  cancelOrderApi,
  ORDER_STATUS,
  STATUS_TEXT,
} from '../api/order'

const TABS = [
  { label: '全部', value: null },
  { label: '待付款', value: ORDER_STATUS.PENDING },
  { label: '已完成', value: ORDER_STATUS.DONE },
  { label: '已取消', value: ORDER_STATUS.CANCELLED },
]

const orders = ref([])
const loading = ref(false)
const activeStatus = ref(null)
const toast = ref('')
let toastTimer = null

onMounted(() => loadOrders())

async function loadOrders() {
  loading.value = true
  try {
    const res = await listOrdersApi(activeStatus.value)
    orders.value = res.data || []
  } catch {
    orders.value = []
    showToast('订单加载失败，稍后再试～')
  } finally {
    loading.value = false
  }
}

function switchTab(status) {
  activeStatus.value = status
  loadOrders()
}

async function pay(order) {
  if (!confirm(`确认支付订单 ${order.orderNo}（¥${fmt(order.totalAmount)}）？`)) return
  try {
    await payOrderApi(order.id)
    showToast('付款成功，订单已完成 🎉')
    loadOrders()
  } catch (e) {
    showToast(e.message || '付款失败')
  }
}

async function cancel(order) {
  if (!confirm(`确定取消订单 ${order.orderNo} 吗？`)) return
  try {
    await cancelOrderApi(order.id)
    showToast('订单已取消')
    loadOrders()
  } catch (e) {
    showToast(e.message || '取消失败')
  }
}

function statusText(status) {
  return STATUS_TEXT[status] || '未知'
}

function fmt(n) {
  return Number(n || 0).toFixed(2)
}

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2200)
}
</script>

<style scoped>
/* ===== 状态筛选标签 ===== */
.tag-row {
  margin: 6px 0 20px;
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

/* ===== 订单卡片 ===== */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.order-card {
  padding: 20px;
}
.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.order-no {
  color: #7C2D12;
  font-size: 15px;
  font-weight: bold;
  letter-spacing: .5px;
}
.order-time {
  margin-top: 4px;
  color: #B45309;
  font-size: 12px;
}
.order-remark {
  margin-top: 6px;
  color: #92400E;
  font-size: 13px;
}

/* 状态徽章 */
.status-badge {
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid transparent;
}
.st-0 { background: #FEF3C7; color: #B45309; border-color: #FBBF24; }
.st-1 { background: #D1FAE5; color: #047857; border-color: #34D399; }
.st-2 { background: #F1F5F9; color: #64748B; border-color: #CBD5E1; }

/* ===== 明细行 ===== */
.item-list {
  list-style: none;
  margin: 14px 0;
  border-top: 2px dashed #FCD34D;
  padding-top: 12px;
}
.item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
}
.item-icon { font-size: 22px; }
.item-info { flex: 1; min-width: 0; }
.item-name {
  color: #7C2D12;
  font-size: 13px;
  font-weight: bold;
}
.item-price {
  color: #B45309;
  font-size: 12px;
}
.item-line {
  color: #7C2D12;
  font-size: 13px;
  font-weight: bold;
}

/* ===== 底部金额 + 操作 ===== */
.order-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  border-top: 2px dashed #F59E0B;
  padding-top: 12px;
}
.amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #92400E;
  font-size: 13px;
}
.amounts .total {
  color: #B91C1C;
  font-weight: bold;
  font-size: 15px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.done-tip {
  color: #B45309;
  font-size: 13px;
}
.empty-tip {
  color: #B45309;
  font-size: 13px;
}

@media (max-width: 640px) {
  .order-foot { flex-direction: column; align-items: stretch; }
  .actions { justify-content: flex-end; }
}
</style>
