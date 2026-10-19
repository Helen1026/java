<template>
  <div class="login-card">
    <div
      v-for="(h, i) in holes"
      :key="i"
      class="hole"
      :style="h"
    ></div>

    <!-- 派大星头像 -->
    <div class="avatar patrick">
      <div class="star">⭐</div>
    </div>

    <h1>加入比奇堡</h1>
    <p class="subtitle">派大星：我也可以是天才！🌟</p>

    <div class="error-msg" :class="{ show: showError }">{{ errorText }}</div>

    <form @submit.prevent="handleRegister">
      <div class="field">
        <label for="reg-username">用户名</label>
        <span class="icon">🧽</span>
        <input
          type="text"
          id="reg-username"
          v-model.trim="username"
          placeholder="给自己起个海底名字"
          autocomplete="username"
        >
      </div>

      <div class="field">
        <label for="reg-password">密码</label>
        <span class="icon">🍔</span>
        <input
          type="password"
          id="reg-password"
          v-model="password"
          placeholder="设置你的蟹黄堡秘方"
          autocomplete="new-password"
          @focus="showRules = true"
        >
      </div>

      <!-- 密码规则实时校验 -->
      <ul class="pwd-rules" v-show="showRules || password">
        <li v-for="(r, i) in passwordRules" :key="i" :class="{ pass: r.pass }">
          {{ r.label }}
        </li>
      </ul>

      <div class="field">
        <label for="reg-confirm">确认密码</label>
        <span class="icon">🦀</span>
        <input
          type="password"
          id="reg-confirm"
          v-model="confirm"
          placeholder="再输入一次"
          autocomplete="new-password"
        >
      </div>

      <div class="field">
        <label for="reg-captcha">验证码</label>
        <span class="icon">🪼</span>
        <div class="captcha-row">
          <input
            type="text"
            id="reg-captcha"
            v-model.trim="captchaInput"
            placeholder="不区分大小写"
            maxlength="4"
            autocomplete="off"
          >
          <GraphicCaptcha ref="captchaRef" />
        </div>
      </div>
      <p class="captcha-tip">看不清？点击图片换一张</p>

      <div class="options">
        <label><input type="checkbox" v-model="agree"> 我已阅读蟹堡王员工守则</label>
      </div>

      <button type="submit" class="btn-login" :disabled="loading">
        {{ loading ? '注册中…' : '注 册' }}
      </button>
    </form>

    <p class="register-link">
      已有账号？<router-link to="/login">返回登录</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import GraphicCaptcha from './GraphicCaptcha.vue'
import { registerApi } from '../api/auth'

const router = useRouter()

const holes = [
  { width: '26px', height: '26px', top: '18px', right: '24px' },
  { width: '16px', height: '16px', top: '70px', left: '30px' },
  { width: '20px', height: '20px', bottom: '90px', right: '16px' },
  { width: '14px', height: '14px', bottom: '30px', left: '22px' },
]

const username = ref('')
const password = ref('')
const confirm = ref('')
const captchaInput = ref('')
const agree = ref(false)
const showRules = ref(false)
const loading = ref(false)
const showError = ref(false)
const errorText = ref('')
const captchaRef = ref(null)

// 密码规则：长度不少于 8 位（8-20）、字母+数字组合、不含空格
const passwordRules = computed(() => [
  {
    label: '长度 8-20 位',
    pass: password.value.length >= 8 && password.value.length <= 20,
  },
  {
    label: '同时包含字母和数字',
    pass: /[A-Za-z]/.test(password.value) && /\d/.test(password.value),
  },
  {
    label: '不包含空格',
    pass: password.value.length > 0 && !/\s/.test(password.value),
  },
])

const allRulesPass = computed(() => passwordRules.value.every((r) => r.pass))

function fail(msg) {
  errorText.value = msg
  showError.value = true
  return false
}

function validate() {
  if (!username.value) return fail('用户名不能为空哦～')
  if (!password.value) return fail('密码不能为空哦～')
  if (!allRulesPass.value) return fail('密码不符合规则，请检查黄色提示框')
  if (password.value !== confirm.value) return fail('两次输入的密码不一致')
  if (!captchaInput.value) return fail('请输入验证码')
  if (!captchaRef.value.verify(captchaInput.value)) {
    captchaRef.value.refresh()
    captchaInput.value = ''
    return fail('验证码错误，已为你换一张')
  }
  if (!agree.value) return fail('请先阅读并同意蟹堡王员工守则')
  showError.value = false
  return true
}

async function handleRegister() {
  if (!validate() || loading.value) return
  loading.value = true
  try {
    // 后端接口已预留：USE_MOCK=true 时走本地模拟，详见 src/api/auth.js
    // 后端验证码方案：提交时额外携带 captchaId（见 GraphicCaptcha 注释）
    await registerApi({
      username: username.value,
      password: password.value,
      captcha: captchaInput.value,
    })
    alert('注册成功，' + username.value + '！欢迎入住菠萝屋～')
    router.push('/login')
  } catch (err) {
    fail(err.message || '注册失败，请稍后再试')
    captchaRef.value.refresh()
    captchaInput.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 卡片骨架、表单、按钮等共享样式见 src/assets/main.css */
.avatar {
  width: 110px;
  height: 110px;
  margin: 0 auto 14px;
  background: #FFE4E6;
  border-radius: 24px;
  border: 3px solid #E11D48;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 6px 14px rgba(0,0,0,.15);
}
.avatar .star { font-size: 52px; }
</style>
