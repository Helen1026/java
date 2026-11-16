<template>
  <BubbleField />
  <SeaDecor />
  <router-view v-slot="{ Component }">
    <transition name="swim" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <!-- 登录 / 注册页是居中卡片布局，只挂一条极简页脚（版权 + 关于 + 联系管理员） -->
  <SeaFooter v-if="showMiniFooter" compact />

  <!-- 每日登录积分提示：挂在 App 根节点，路由切换时不会被打断 -->
  <transition name="daily-pop">
    <div v-if="dailyTip" class="daily-award">
      <span class="daily-icon">🌅</span>
      <span>每日登录成功，积分 <b>+{{ dailyPoints }}</b> 🪙</span>
    </div>
  </transition>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BubbleField from './components/BubbleField.vue'
import SeaDecor from './components/SeaDecor.vue'
import SeaFooter from './components/SeaFooter.vue'
import { claimDailyLogin } from './points'
import { ensureCart } from './cart'

const route = useRoute()
const AUTH_PAGES = ['login', 'register', 'adminLogin']
const showMiniFooter = computed(() => AUTH_PAGES.includes(route.name))

const dailyTip = ref('')
const dailyPoints = ref(0)
let tipTimer = null

/**
 * 领取每日登录积分。
 * 一天只发一次（points.js 内部按自然日判断），所以每次进页面都调用是安全的。
 * 未登录（没有 token）不发放，避免登录页刷积分。
 */
function tryClaimDaily() {
  if (!localStorage.getItem('token')) return
  const res = claimDailyLogin()
  if (!res.ok) return
  dailyPoints.value = res.points
  dailyTip.value = 'show'
  clearTimeout(tipTimer)
  tipTimer = setTimeout(() => { dailyTip.value = '' }, 3600)
}

onMounted(() => {
  tryClaimDaily()
  // 启动即拉一次购物车（登录状态下来自服务端，未登录则用本机缓存）
  ensureCart()
})
// 登录成功会 push('/home')，App 不会重新挂载，靠路由变化补一次领取 / 拉车
watch(() => route.path, () => {
  tryClaimDaily()
  ensureCart()
})
onBeforeUnmount(() => clearTimeout(tipTimer))
</script>

<style>
/* 路由切换动画：像游走一样 */
.swim-enter-active,
.swim-leave-active {
  transition: opacity .35s ease, transform .35s ease;
}
.swim-enter-from {
  opacity: 0;
  transform: translateX(40px) rotate(1deg);
}
.swim-leave-to {
  opacity: 0;
  transform: translateX(-40px) rotate(-1deg);
}

/* 每日登录积分提示 */
.daily-award {
  position: fixed;
  left: 50%;
  bottom: 96px;
  z-index: 900;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #FBBF24;
  border-radius: 999px;
  background: rgba(255, 251, 235, .97);
  color: #7C2D12;
  font-size: 13px;
  font-weight: bold;
  box-shadow: 0 10px 26px rgba(12, 74, 110, .28);
  pointer-events: none;
  white-space: nowrap;
}
.daily-award b { color: #B45309; font-size: 15px; }
.daily-icon { font-size: 16px; line-height: 1; }

.daily-pop-enter-active,
.daily-pop-leave-active {
  transition: opacity .28s ease, transform .28s ease;
}
.daily-pop-enter-from,
.daily-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(14px) scale(.96);
}
</style>
