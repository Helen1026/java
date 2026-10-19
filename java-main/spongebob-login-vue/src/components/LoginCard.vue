<template>
  <div class="login-card">
    <div
      v-for="(h, i) in holes"
      :key="i"
      class="hole"
      :style="h"
    ></div>

    <div class="avatar">
      <div class="eyes">
        <div class="eye"></div>
        <div class="eye"></div>
      </div>
      <div class="smile"></div>
      <div class="tooth t1"></div>
      <div class="tooth t2"></div>
    </div>

    <h1>比奇堡登录</h1>
    <p class="subtitle">我准备好了！我准备好了！🍍</p>

    <div class="error-msg" :class="{ show: showError }">{{ errorText }}</div>

    <form @submit.prevent="handleLogin">
      <div class="field">
        <label for="username">用户名</label>
        <span class="icon">🧽</span>
        <input
          type="text"
          id="username"
          v-model.trim="username"
          placeholder="例如：SpongeBob"
          autocomplete="username"
        >
      </div>
      <div class="field">
        <label for="password">密码</label>
        <span class="icon">🍔</span>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="蟹黄堡秘方，绝不外泄"
          autocomplete="current-password"
        >
      </div>

      <div class="options">
        <label><input type="checkbox" v-model="remember"> 记住我</label>
        <a href="#" @click.prevent="forgotPassword">忘记密码？</a>
      </div>

      <button type="submit" class="btn-login" :disabled="loading">
        {{ loading ? '登录中…' : '登 录' }}
      </button>
    </form>

    <p class="register-link">
      还没有账号？<router-link to="/register">立即注册</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi } from '../api/auth'

const router = useRouter()

const holes = [
  { width: '26px', height: '26px', top: '18px', left: '24px' },
  { width: '16px', height: '16px', top: '60px', right: '30px' },
  { width: '20px', height: '20px', bottom: '80px', left: '16px' },
  { width: '14px', height: '14px', bottom: '30px', right: '22px' },
  { width: '12px', height: '12px', top: '110px', left: '10px' },
]

const username = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const showError = ref(false)
const errorText = ref('')

function fail(msg) {
  errorText.value = msg
  showError.value = true
  return false
}

async function handleLogin() {
  if (!username.value || !password.value) {
    fail('用户名或密码不能为空哦～')
    return
  }
  if (loading.value) return
  showError.value = false
  loading.value = true
  try {
    // 后端接口已预留：USE_MOCK=true 时走本地模拟，详见 src/api/auth.js
    const res = await loginApi({
      username: username.value,
      password: password.value,
    })
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token)
    }
    // 记录用户信息，首页导航栏会展示昵称
    localStorage.setItem('username', username.value)
    localStorage.setItem('userInfo', JSON.stringify({
      username: res.data?.username || username.value,
      nickname: res.data?.nickname || username.value,
    }))
    // 登录成功 → 跳转首页
    router.push('/home')
  } catch (err) {
    fail(err.message || '登录失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

function forgotPassword() {
  alert('问问章鱼哥吧，他什么都知道（并不）')
}
</script>

<style scoped>
/* 卡片骨架、表单、按钮等共享样式见 src/assets/main.css */
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
  box-shadow: 0 6px 14px rgba(0,0,0,.15);
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
</style>
