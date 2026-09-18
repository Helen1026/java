<template>
  <section class="panel">
    <div class="welcome">欢迎回来！</div>
    <div class="sub">请选择身份并登录你的森林账号</div>

    <form @submit.prevent="onSubmit" novalidate>
      <div class="field" :class="{ error: errors.user }">
        <label for="username">账号</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="手机号 / 邮箱 / 昵称"
          autocomplete="username"
          @input="errors.user = false"
        />
        <span class="icon">🐾</span>
        <div class="err-msg">请填写账号哦，熊大在等你~</div>
      </div>

      <div class="field" :class="{ error: errors.pass }">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="password"
          :type="showPw ? 'text' : 'password'"
          placeholder="请输入密码"
          autocomplete="current-password"
          @input="errors.pass = false"
        />
        <span class="toggle" @click="togglePw">{{ showPw ? '🙈' : '👁️' }}</span>
        <div class="err-msg">密码至少 6 位，别让光头强偷走啦！</div>
      </div>

      <div class="row">
        <label class="remember"><input type="checkbox" v-model="remember" /> 记住我</label>
        <a href="#" @click="onForget">忘记密码？</a>
      </div>

      <button class="btn" type="submit">登 录</button>
    </form>

    <div class="divider">选择登录身份</div>
    <div class="roles">
      <div
        v-for="r in roles"
        :key="r.key"
        class="role"
        :class="{ active: role === r.key }"
        @click="selectRole(r.key)"
      >
        <div class="emoji">{{ r.emoji }}</div>
        <div class="name">{{ r.name }}</div>
      </div>
    </div>

    <div class="toast" :class="{ show: toast.show }">{{ toast.msg }}</div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const showPw = ref(false)
const remember = ref(false)
const role = ref('bear')
const errors = ref({ user: false, pass: false })
const toast = ref({ show: false, msg: '' })
let toastTimer = null

const roles = [
  { key: 'bear', emoji: '🐻', name: '熊熊' },
  { key: 'vick', emoji: '🪓', name: '光头强' },
  { key: 'guest', emoji: '🌲', name: '游客' }
]
const roleNames = { bear: '熊熊', vick: '光头强', guest: '游客' }

function showToast(msg) {
  toast.value = { show: true, msg }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = { show: false, msg: '' }), 2200)
}

function togglePw() {
  showPw.value = !showPw.value
}

function selectRole(key) {
  role.value = key
}

function onSubmit() {
  errors.value.user = !username.value.trim()
  errors.value.pass = password.value.length < 6
  if (errors.value.user || errors.value.pass) return

  showToast('🎉 登录成功，欢迎 ' + roleNames[role.value] + ' 回到狗熊岭！')
}

function onForget(e) {
  e.preventDefault()
  showToast('🐝 已发送找回链接（演示）')
}
</script>

<style scoped>
.panel {
  width: 58%;
  padding: 40px 44px;
}

.panel .welcome {
  font-size: 24px;
  font-weight: 700;
  color: var(--forest-deep);
}

.panel .sub {
  font-size: 13px;
  color: #7a6a52;
  margin: 6px 0 26px;
}

.field {
  margin-bottom: 18px;
  position: relative;
}

.field label {
  display: block;
  font-size: 13px;
  color: var(--forest-deep);
  font-weight: 600;
  margin-bottom: 7px;
}

.field input {
  width: 100%;
  height: 48px;
  border: 2px solid #e3d6bf;
  border-radius: 14px;
  padding: 0 44px 0 16px;
  font-size: 15px;
  color: var(--ink);
  background: #fffdf8;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.field input:focus {
  border-color: var(--leaf);
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.15);
}

.field .icon {
  position: absolute;
  right: 14px;
  top: 36px;
  font-size: 18px;
  opacity: 0.55;
}

.field .toggle {
  position: absolute;
  right: 14px;
  top: 36px;
  cursor: pointer;
  font-size: 16px;
  user-select: none;
}

.field.error input {
  border-color: var(--danger);
}

.err-msg {
  color: var(--danger);
  font-size: 12px;
  margin-top: 6px;
  display: none;
}

.field.error .err-msg {
  display: block;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 22px;
  font-size: 13px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #6f5f47;
  cursor: pointer;
}

.remember input {
  width: 16px;
  height: 16px;
  accent-color: var(--leaf);
}

.row a {
  color: var(--honey-deep);
  text-decoration: none;
  font-weight: 600;
}

.row a:hover {
  text-decoration: underline;
}

.btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  background: linear-gradient(135deg, var(--honey) 0%, var(--honey-deep) 100%);
  color: #5a3a00;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 4px;
  box-shadow: 0 10px 22px rgba(245, 166, 35, 0.4);
  transition: transform 0.12s, box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(245, 166, 35, 0.5);
}

.btn:active {
  transform: translateY(0);
}

.divider {
  text-align: center;
  color: #b3a588;
  font-size: 12px;
  margin: 22px 0 16px;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 32%;
  height: 1px;
  background: #e3d6bf;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.roles {
  display: flex;
  gap: 12px;
}

.role {
  flex: 1;
  border: 2px solid #e3d6bf;
  border-radius: 14px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  background: #fffdf8;
  transition: all 0.2s;
}

.role:hover {
  border-color: var(--leaf);
  transform: translateY(-2px);
}

.role.active {
  border-color: var(--honey-deep);
  background: #fff6e2;
}

.role .emoji {
  font-size: 26px;
}

.role .name {
  font-size: 12px;
  color: #6f5f47;
  font-weight: 600;
  margin-top: 4px;
}

.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  background: var(--forest-deep);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: all 0.3s;
  z-index: 99;
  pointer-events: none;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

@media (max-width: 720px) {
  .panel {
    width: 100%;
  }
}
</style>
