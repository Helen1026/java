<template>
  <!-- 紧凑版：登录 / 注册页底部一行（页面主体是居中卡片，不适合铺大页脚） -->
  <footer v-if="compact" class="sea-footer-compact">
    <span>© {{ year }} 比奇堡</span>
    <span class="foot-dot">·</span>
    <button class="foot-mini" @click="go('/about')">关于比奇堡</button>
    <span class="foot-dot">·</span>
    <button class="foot-mini" @click="toggleContact">联系管理员</button>
    <span class="foot-dot">·</span>
    <span class="foot-mini-slogan">「{{ slogan }}」</span>
  </footer>

  <footer v-else class="sea-footer">
    <div class="sea-footer-inner">
      <!-- 左：品牌 + 小标语 -->
      <div class="foot-brand">
        <div class="foot-logo">
          <span class="foot-logo-icon">🍍</span>
          <span class="foot-logo-text">比奇堡 · 海底万事屋</span>
        </div>
        <p class="foot-slogan">「{{ slogan }}」<span class="foot-slogan-from">—— 海绵宝宝</span></p>
      </div>

      <!-- 右：链接组 -->
      <nav class="foot-links">
        <button class="foot-link" @click="go('/about')">关于比奇堡</button>
        <button class="foot-link" @click="toggleContact">联系管理员</button>
        <button class="foot-link" @click="go('/home')">回到首页</button>
      </nav>
    </div>

    <div class="foot-bottom">
      <span>© {{ year }} 比奇堡 Bikini Bottom · 万事屋出品</span>
      <span class="foot-dot">·</span>
      <span>仅供学习交流，非商业用途</span>
      <template v-if="note">
        <span class="foot-dot">·</span>
        <span>{{ note }}</span>
      </template>
    </div>
  </footer>

    <!-- 联系管理员：轻量弹层（不跳页，避免打断浏览） -->
    <transition name="foot-pop">
      <div v-if="contactOpen" class="foot-contact" @click.self="closeContact">
        <div class="foot-contact-card">
          <div class="foot-contact-title">📮 联系管理员</div>
          <p class="foot-contact-desc">
            蟹老板不在工位，遇到问题可以写信给比奇堡管理员小蜗，
            它虽然只会喵喵叫，但消息都会转达。
          </p>
          <div class="foot-contact-mail">
            <code>{{ ADMIN_MAIL }}</code>
            <button class="foot-copy" @click="copyMail">{{ copied ? '✓ 已复制' : '复制邮箱' }}</button>
          </div>
          <div class="foot-contact-actions">
            <a class="foot-mailto" :href="`mailto:${ADMIN_MAIL}?subject=比奇堡问题反馈`">打开邮件客户端</a>
            <button class="foot-close" @click="closeContact">知道啦</button>
          </div>
        </div>
      </div>
    </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

defineProps({
  /** 额外一行说明（例如子页面原本的页脚文案） */
  note: { type: String, default: '' },
  /** 紧凑版：登录 / 注册页底部只用一行版权 + 链接 */
  compact: { type: Boolean, default: false },
})

const ADMIN_MAIL = 'admin@bikini.bottom'

/** 比奇堡味的小标语，每次进页面随机一条 */
const SLOGANS = [
  '我准备好了！我准备好了！',
  '今天也要做一块快乐的海绵',
  '蟹黄堡的秘方，是认真对待每一件小事',
  '海底很大，慢慢游就好',
  '深呼吸，像水母一样轻盈',
]

const router = useRouter()
const slogan = ref(SLOGANS[0])
const year = new Date().getFullYear()
const contactOpen = ref(false)
const copied = ref(false)
let copyTimer = null

onMounted(() => {
  slogan.value = SLOGANS[Math.floor(Math.random() * SLOGANS.length)]
})

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})

function go(path) {
  if (router.currentRoute.value.path === path) return
  router.push(path)
}

function toggleContact() {
  contactOpen.value = !contactOpen.value
  if (!contactOpen.value) copied.value = false
}

function closeContact() {
  contactOpen.value = false
  copied.value = false
}

async function copyMail() {
  try {
    await navigator.clipboard.writeText(ADMIN_MAIL)
  } catch {
    // 非 https / 老浏览器降级：临时 textarea + execCommand
    const ta = document.createElement('textarea')
    ta.value = ADMIN_MAIL
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch {
      /* 复制失败就退化为手动选择 */
    }
    document.body.removeChild(ta)
  }
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.sea-footer {
  position: relative;
  z-index: 2;
  max-width: 1080px;
  margin: 40px auto 0;
  padding: 22px 20px 96px;
  color: #E0F2FE;
}

.sea-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  background: rgba(255, 251, 235, .14);
  border: 2px dashed rgba(224, 242, 254, .5);
  border-radius: var(--r-card, 22px);
  backdrop-filter: blur(6px);
}

.foot-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #FFFBEB;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .25);
}
.foot-logo-icon {
  font-size: 22px;
  animation: foot-bob 3s ease-in-out infinite;
}
@keyframes foot-bob {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50%      { transform: translateY(-4px) rotate(6deg); }
}

.foot-slogan {
  margin-top: 6px;
  font-size: 13px;
  color: #E0F2FE;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .22);
}
.foot-slogan-from {
  opacity: .75;
  font-size: 12px;
}

.foot-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.foot-link {
  padding: 7px 14px;
  border: 2px solid rgba(224, 242, 254, .55);
  border-radius: var(--r-pill, 999px);
  background: rgba(255, 255, 255, .16);
  color: #FFFBEB;
  font-family: inherit;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: background .2s, border-color .2s, transform .12s;
}
.foot-link:hover {
  background: rgba(255, 255, 255, .3);
  border-color: #FFFBEB;
  transform: translateY(-1px);
}

.foot-bottom {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(224, 242, 254, .85);
  text-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}
.foot-dot { opacity: .55; }

/* ===== 紧凑版：登录 / 注册页底部一行 ===== */
.sea-footer-compact {
  position: fixed;
  left: 50%;
  bottom: 12px;
  z-index: 5;
  transform: translateX(-50%);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: calc(100vw - 24px);
  padding: 5px 14px;
  background: rgba(3, 41, 66, .38);
  border-radius: var(--r-pill, 999px);
  backdrop-filter: blur(6px);
  color: rgba(224, 242, 254, .95);
  font-size: 12px;
  text-align: center;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .3);
}
.foot-mini {
  padding: 3px 10px;
  border: 1px solid rgba(224, 242, 254, .45);
  border-radius: var(--r-pill, 999px);
  background: rgba(255, 255, 255, .14);
  color: #FFFBEB;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background .2s, border-color .2s;
}
.foot-mini:hover {
  background: rgba(255, 255, 255, .3);
  border-color: #FFFBEB;
}
.foot-mini-slogan { opacity: .8; }

@media (max-width: 520px) {
  .foot-mini-slogan { display: none; }
}

/* ===== 联系管理员弹层 ===== */
.foot-contact {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 41, 66, .55);
  backdrop-filter: blur(3px);
}
.foot-contact-card {
  width: 380px;
  max-width: 92vw;
  padding: 22px;
  background: linear-gradient(160deg, #FDE047, #FACC15);
  border: 4px solid #FBBF24;
  border-radius: var(--r-card, 22px);
  box-shadow: 0 22px 48px rgba(0, 0, 0, .35), inset 0 -6px 0 rgba(0, 0, 0, .08);
  color: #7C2D12;
}
.foot-contact-title {
  font-size: 17px;
  font-weight: bold;
  letter-spacing: 1px;
}
.foot-contact-desc {
  margin: 8px 0 14px;
  font-size: 13px;
  line-height: 1.75;
  color: #92400E;
}
.foot-contact-mail {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 251, 235, .92);
  border: 2px solid #F59E0B;
  border-radius: var(--r-field, 14px);
}
.foot-contact-mail code {
  flex: 1;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  color: #78350F;
  overflow: hidden;
  text-overflow: ellipsis;
}
.foot-copy {
  flex-shrink: 0;
  padding: 6px 12px;
  border: none;
  border-radius: var(--r-pill, 999px);
  background: linear-gradient(180deg, #34D399, #059669);
  color: #fff;
  font-family: inherit;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 3px 0 #047857;
}
.foot-copy:active { transform: translateY(2px); box-shadow: 0 1px 0 #047857; }

.foot-contact-actions {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.foot-mailto,
.foot-close {
  flex: 1 1 140px;
  padding: 10px 14px;
  border-radius: var(--r-pill, 999px);
  font-family: inherit;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}
.foot-mailto {
  border: none;
  background: linear-gradient(180deg, #34D399, #059669);
  color: #fff;
  box-shadow: 0 4px 0 #047857;
}
.foot-close {
  border: 2px solid #FBBF24;
  background: #FFFBEB;
  color: #92400E;
  box-shadow: 0 4px 0 #FDE68A;
}
.foot-mailto:active,
.foot-close:active { transform: translateY(3px); box-shadow: none; }

.foot-pop-enter-active,
.foot-pop-leave-active { transition: opacity .2s ease; }
.foot-pop-enter-from,
.foot-pop-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .sea-footer { padding: 16px 14px 84px; }
  .sea-footer-inner { padding: 16px; }
  .foot-links { width: 100%; }
}
</style>
