<template>
  <PageShell
    title="🍍 菠萝屋"
    subtitle="海绵宝宝的家，两室一厅加一个会说话的蜗牛"
    :toast="toast"
    footer-text="菠萝屋 · 资料与收藏保存在浏览器本地（localStorage）"
  >
    <div class="pine-layout">
      <!-- 左：身份卡 -->
      <section class="pcard profile">
        <div class="hole" style="width: 16px; height: 16px; top: 14px; right: 18px"></div>
        <div class="hole" style="width: 11px; height: 11px; bottom: 16px; left: 14px"></div>

        <div class="avatar">{{ form.avatar }}</div>
        <h2 class="profile-name">{{ form.nickname || '海绵宝宝' }}</h2>
        <p class="profile-sign">{{ form.signature || '我准备好了！' }}</p>

        <div class="profile-tags">
          <span class="pill">蟹堡王 首席煎肉饼师</span>
          <span class="pill">水母田 常客</span>
        </div>

        <ul class="profile-meta">
          <li><span>用户名</span><strong>{{ username }}</strong></li>
          <li><span>常驻地点</span><strong>比奇堡 贝壳街 124 号</strong></li>
          <li><span>宠物</span><strong>小蜗 🐌</strong></li>
        </ul>
      </section>

      <!-- 右：统计 + 收藏 + 设置 -->
      <div class="right-col">
        <div class="stat-grid">
          <div class="stat-card">
            <span class="stat-num">{{ stats.jelly }}</span>
            <span class="stat-label">捕获水母</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ stats.orders }}</span>
            <span class="stat-label">蟹堡王订单</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ favorites.length }}</span>
            <span class="stat-label">收藏好物</span>
          </div>
        </div>

        <section class="panel">
          <div class="panel-title">
            ⭐ 我的收藏
            <span class="panel-extra">{{ favorites.length }} 件</span>
          </div>
          <ul v-if="favorites.length" class="fav-list">
            <li v-for="f in favorites" :key="f.id" class="fav-item">
              <span class="fav-icon">{{ f.icon }}</span>
              <div class="fav-info">
                <div class="fav-name">{{ f.name }}</div>
                <div class="fav-desc">{{ f.desc }}</div>
              </div>
              <button class="fav-del" @click="removeFav(f.id)">移除</button>
            </li>
          </ul>
          <p v-else class="fav-empty">收藏夹空空的，去首页搜点好东西吧～</p>
        </section>

        <section class="panel">
          <div class="panel-title">⚙️ 账号设置</div>
          <div class="form-row">
            <label for="nickname">昵称</label>
            <input
              id="nickname"
              v-model.trim="form.nickname"
              type="text"
              maxlength="16"
              placeholder="海绵宝宝"
            >
          </div>
          <div class="form-row">
            <label for="signature">个性签名</label>
            <input
              id="signature"
              v-model.trim="form.signature"
              type="text"
              maxlength="30"
              placeholder="我准备好了！"
            >
          </div>
          <div class="form-row">
            <label for="avatar">头像</label>
            <div class="avatar-picker">
              <button
                v-for="a in AVATARS"
                :key="a"
                class="avatar-opt"
                :class="{ active: form.avatar === a }"
                @click="form.avatar = a"
              >{{ a }}</button>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-sea" @click="save">保存资料</button>
            <button class="btn-amber" @click="reset">恢复默认</button>
          </div>
        </section>
      </div>
    </div>
  </PageShell>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import PageShell from './PageShell.vue'

const AVATARS = ['🧽', '⭐', '🦑', '🐿️', '🦀', '🐌']

const DEFAULT_FAVORITES = [
  { id: 1, icon: '🍔', name: '蟹黄堡', desc: '蟹堡王招牌，海之霸永远无法复制的秘方' },
  { id: 2, icon: '🪼', name: '水母网', desc: '抓水母必备神器，派大星强烈推荐' },
  { id: 3, icon: '🐌', name: '小蜗的壳', desc: '一只会喵喵叫的宠物蜗牛，比奇堡最黏人' },
]

const stats = reactive({ jelly: 27, orders: 12 })
const username = ref('spongebob')
const favorites = ref([...DEFAULT_FAVORITES])
const form = reactive({ nickname: '海绵宝宝', signature: '我准备好了！', avatar: '🧽' })
const toast = ref('')
let toastTimer = null

onMounted(() => {
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const info = JSON.parse(raw)
      username.value = info.username || username.value
      form.nickname = info.nickname || info.username || form.nickname
      form.signature = info.signature || form.signature
      form.avatar = info.avatar || form.avatar
    } else if (localStorage.getItem('username')) {
      username.value = localStorage.getItem('username')
      form.nickname = localStorage.getItem('username')
    }
  } catch {
    /* 本地信息损坏时用默认资料 */
  }

  try {
    const favRaw = localStorage.getItem('bikiniFavorites')
    if (favRaw) favorites.value = JSON.parse(favRaw)
  } catch {
    favorites.value = [...DEFAULT_FAVORITES]
  }
})

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2000)
}

function removeFav(id) {
  favorites.value = favorites.value.filter((f) => f.id !== id)
  persistFavorites()
  showToast('已从收藏夹移除')
}

function persistFavorites() {
  localStorage.setItem('bikiniFavorites', JSON.stringify(favorites.value))
}

/** 保存资料：写回 localStorage，首页与导航栏会同步显示新昵称 */
function save() {
  if (!form.nickname) {
    showToast('昵称不能为空哦')
    return
  }
  const info = {
    username: username.value,
    nickname: form.nickname,
    signature: form.signature,
    avatar: form.avatar,
  }
  localStorage.setItem('userInfo', JSON.stringify(info))
  localStorage.setItem('username', username.value)
  persistFavorites()
  showToast('资料已保存，比奇堡的大家都看到啦')
}

function reset() {
  form.nickname = username.value
  form.signature = '我准备好了！'
  form.avatar = '🧽'
  showToast('已恢复默认资料（记得点保存）')
}
</script>

<style scoped>
.pine-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}
.right-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ===== 身份卡 ===== */
.profile {
  position: sticky;
  top: 88px;
  padding: 26px 22px 22px;
  text-align: center;
}
.avatar {
  width: 84px;
  height: 84px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFBEB;
  border: 4px solid #F59E0B;
  border-radius: 50%;
  font-size: 44px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, .18);
}
.profile-name {
  color: #7C2D12;
  font-size: 20px;
  letter-spacing: 1px;
}
.profile-sign {
  margin-top: 6px;
  color: #92400E;
  font-size: 13px;
}
.profile-tags {
  margin: 14px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}
.profile-meta {
  list-style: none;
  margin-top: 6px;
  border-top: 2px dashed #F59E0B;
  padding-top: 12px;
}
.profile-meta li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 0;
  font-size: 13px;
}
.profile-meta span { color: #B45309; }
.profile-meta strong {
  color: #7C2D12;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 统计 ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat-card {
  padding: 14px 10px;
  background: rgba(255, 251, 235, .93);
  border: 3px solid #FBBF24;
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, .16);
  text-align: center;
}
.stat-num {
  display: block;
  color: #7C2D12;
  font-size: 22px;
  font-weight: bold;
}
.stat-label {
  color: #92400E;
  font-size: 12px;
}

/* ===== 收藏 ===== */
.fav-list { list-style: none; }
.fav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px dashed #FCD34D;
}
.fav-item:last-child { border-bottom: none; }
.fav-icon { font-size: 22px; }
.fav-info { flex: 1; min-width: 0; }
.fav-name {
  color: #7C2D12;
  font-size: 13px;
  font-weight: bold;
}
.fav-desc {
  color: #B45309;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fav-del {
  flex-shrink: 0;
  padding: 4px 10px;
  border: 2px solid #FBBF24;
  border-radius: 10px;
  background: #FEF3C7;
  color: #92400E;
  font-family: inherit;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}
.fav-del:hover { background: #FDE68A; }
.fav-empty {
  padding: 14px 0;
  font-size: 13px;
  text-align: center;
  color: #B45309;
}

/* ===== 表单 ===== */
.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.form-row label {
  flex-shrink: 0;
  width: 68px;
  color: #7C2D12;
  font-size: 13px;
  font-weight: bold;
}
.form-row input {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border: 3px solid #F59E0B;
  border-radius: 14px;
  background: #FFFBEB;
  color: #78350F;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.form-row input:focus {
  border-color: var(--sea-green);
  box-shadow: 0 0 0 4px rgba(45, 212, 191, .25);
}
.avatar-picker {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.avatar-opt {
  width: 38px;
  height: 38px;
  border: 3px solid #FBBF24;
  border-radius: 12px;
  background: #FFFBEB;
  font-size: 19px;
  line-height: 1;
  cursor: pointer;
  transition: transform .1s, border-color .2s, background .2s;
}
.avatar-opt:hover { transform: translateY(-2px); }
.avatar-opt.active {
  border-color: #059669;
  background: #D1FAE5;
}
.form-actions {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 860px) {
  .pine-layout { grid-template-columns: 1fr; }
  .profile { position: static; }
}
</style>
