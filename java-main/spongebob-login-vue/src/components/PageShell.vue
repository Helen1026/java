<template>
  <div class="page-root">
    <!-- ===== 顶部导航栏（与首页同款） ===== -->
    <header class="seabed-nav">
      <div class="seabed-nav-inner">
        <button class="seabed-brand" @click="go('/home')">
          <span class="seabed-brand-icon">🍍</span>
          <span>比奇堡</span>
        </button>

        <nav class="seabed-links">
          <button
            v-for="item in navItems"
            :key="item.to"
            class="seabed-link"
            :class="{ active: route.path === item.to }"
            @click="go(item.to)"
          >
            {{ item.name }}
          </button>
        </nav>

        <div class="seabed-right">
          <CartButton />
          <div class="seabed-chip" :title="nickname">
            <span>{{ avatar }}</span>
            <span>{{ nickname }}</span>
          </div>
          <button class="seabed-logout" @click="logout">退出</button>
        </div>
      </div>
    </header>

    <!-- ===== 页面标题区 ===== -->
    <section class="page-hero">
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="page-sub">{{ subtitle }}</p>
      <slot name="hero" />
    </section>

    <!-- ===== 页面主体 ===== -->
    <section class="page-content">
      <slot />
    </section>

    <footer class="page-footer">
      {{ footerText || '比奇堡 · 海底小镇日常记录' }}
    </footer>

    <!-- ===== 全局轻提示 ===== -->
    <transition name="page-toast-fade">
      <div v-if="toast" class="page-toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CartButton from './CartButton.vue'

defineProps({
  /** 页面主标题 */
  title: { type: String, required: true },
  /** 副标题 */
  subtitle: { type: String, default: '' },
  /** 由父页面控制的轻提示文案 */
  toast: { type: String, default: '' },
  /** 页脚文案 */
  footerText: { type: String, default: '' },
})

const route = useRoute()
const router = useRouter()

/** 全站导航（与首页 HomeView 保持一致） */
const navItems = [
  { name: '首页', to: '/home' },
  { name: '水母田', to: '/jellyfish' },
  { name: '蟹堡王', to: '/krusty-krab' },
  { name: '菠萝屋', to: '/pineapple' },
  { name: '关于比奇堡', to: '/about' },
]

const nickname = ref('海绵宝宝')
const avatar = ref('🧽')

onMounted(() => {
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const info = JSON.parse(raw)
      nickname.value = info.nickname || info.username || nickname.value
      avatar.value = info.avatar || avatar.value
    } else if (localStorage.getItem('username')) {
      nickname.value = localStorage.getItem('username')
    }
  } catch {
    /* 本地信息损坏时用默认昵称 */
  }
})

function go(path) {
  if (route.path === path) return
  router.push(path)
}

function logout() {
  if (!confirm('要离开比奇堡了吗？')) return
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
