<template>
  <div class="admin-login-root">
    <!-- 背景气泡（与全站一致） -->
    <span v-for="(b, i) in bubbles" :key="'b' + i" class="bubble" :style="b"></span>

    <div class="login-card">
      <div v-for="(h, i) in holes" :key="i" class="hole" :style="h"></div>

      <!-- 海绵宝宝头像 -->
      <div class="avatar">
        <div class="eyes">
          <div class="eye"></div>
          <div class="eye"></div>
        </div>
        <div class="smile"></div>
        <div class="tooth t1"></div>
        <div class="tooth t2"></div>
      </div>

      <h1>比奇堡后台</h1>
      <p class="subtitle">管理员专区 · 管好首页每一条数据 🔐</p>

      <div class="error-msg" :class="{ show: showError }">{{ errorText }}</div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="ad-username">管理员账号</label>
          <span class="icon">🧽</span>
          <input
            type="text"
            id="ad-username"
            v-model.trim="username"
            placeholder="例如：spongebob"
            autocomplete="username"
          >
        </div>
        <div class="field">
          <label for="ad-password">密码</label>
          <span class="icon">🍔</span>
          <input
            type="password"
            id="ad-password"
            v-model="password"
            placeholder="蟹黄堡秘方，绝不外泄"
            autocomplete="current-password"
          >
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? '登录中…' : '进 入 后 台' }}
        </button>
      </form>

      <p class="back-link">
        <router-link to="/home">← 返回比奇堡首页</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { adminLoginApi, listCategories } from '../api/admin'

const router = useRouter()
const route = useRoute()

const holes = [
  { width: '26px', height: '26px', top: '18px', left: '24px' },
  { width: '16px', height: '16px', top: '60px', right: '30px' },
  { width: '20px', height: '20px', bottom: '80px', left: '16px' },
  { width: '14px', height: '14px', bottom: '30px', right: '22px' },
  { width: '12px', height: '12px', top: '110px', left: '10px' },
]

// 随机气泡装饰
const bubbles = Array.from({ length: 14 }, () => ({
  left: Math.random() * 100 + '%',
  width: 8 + Math.random() * 26 + 'px',
  height: 8 + Math.random() * 26 + 'px',
  animationDuration: 7 + Math.random() * 8 + 's',
  animationDelay: -Math.random() * 10 + 's',
}))

const username = ref('')
const password = ref('')
const loading = ref(false)
const showError = ref(false)
const errorText = ref('')

function fail(msg) {
  errorText.value = msg
  showError.value = true
}

// 已登录则直接进入后台（除非显式点了退出）
onMounted(() => {
  if (localStorage.getItem('token') && route.path === '/admin/login') {
    router.replace('/admin')
  }
})

async function handleLogin() {
  if (!username.value || !password.value) {
    fail('账号或密码不能为空哦～')
    return
  }
  if (loading.value) return
  showError.value = false
  loading.value = true
  try {
    // 走真实后端 /api/auth/login，拿到有效 JWT（后台接口需要它）
    const res = await adminLoginApi({
      username: username.value,
      password: password.value,
    })
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token)
    }
    localStorage.setItem('username', username.value)
    localStorage.setItem('userInfo', JSON.stringify({
      username: res.data?.username || username.value,
      nickname: res.data?.nickname || username.value,
      role: 'admin',
    }))
    // 登录成功后立即校验是否拥有后台权限（白名单在后端 AdminController 配置），
    // 避免非管理员账号进入后台后又被接口 403 弹回。
    try {
      await listCategories()
    } catch (e) {
      const em = (e.message || '').toLowerCase()
      if (em.includes('权限') || em.includes('403')) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        fail('该账号无后台管理权限')
        return
      }
    }
    router.replace('/admin')
  } catch (err) {
    fail(err.message || '登录失败，请确认账号或密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-root {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 复用全局 .login-card / .hole / .field / .btn-login / .error-msg 等（见 main.css）。
   这里仅补充后台登录特有的头像与链接样式。 */
.avatar {
  width: 110px;
  height: 110px;
  margin: 0 auto 14px;
  background: #FFF7CC;
  border-radius: 24px;
  border: 3px solid #B45309;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 6px 14px rgba(0, 0, 0, .15);
}
.avatar .eyes { display: flex; gap: 14px; }
.avatar .eye {
  width: 32px; height: 36px;
  background: #fff;
  border: 3px solid #1F2937;
  border-radius: 50%;
  position: relative;
}
.avatar .eye::after {
  content: "";
  position: absolute;
  width: 12px; height: 12px;
  background: #3B82F6;
  border: 3px solid #1F2937;
  border-radius: 50%;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
.avatar .smile {
  position: absolute;
  bottom: 12px;
  width: 44px; height: 20px;
  border: 3px solid #1F2937;
  border-top: none;
  border-radius: 0 0 40px 40px;
}
.avatar .tooth {
  position: absolute;
  bottom: 12px;
  width: 10px; height: 12px;
  background: #fff;
  border: 2px solid #1F2937;
  border-top: none;
}
.avatar .tooth.t1 { left: calc(50% - 12px); }
.avatar .tooth.t2 { left: calc(50% + 2px); }

.back-link {
  text-align: center;
  margin-top: 18px;
  font-size: 13px;
}
.back-link a {
  color: #0369A1;
  text-decoration: none;
  font-weight: bold;
}
.back-link a:hover { text-decoration: underline; }
</style>
