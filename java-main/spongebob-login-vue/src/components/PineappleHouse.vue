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

        <UserAvatar class="profile-avatar" :src="form.avatar" :size="88" />
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
            <span class="stat-num">{{ pointsState.balance }}</span>
            <span class="stat-label">我的积分</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ favorites.length }}</span>
            <span class="stat-label">收藏好物</span>
          </div>
        </div>

        <!-- 每日任务 + 积分 -->
        <DailyTasks />

        <!-- 头像框商店 -->
        <FrameShop @toast="showToast" />

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
            <label>头像</label>
            <div class="avatar-panel">
              <div class="avatar-preview">
                <UserAvatar :src="form.avatar" :size="54" :ring="false" />
                <span class="avatar-preview-tip">当前头像</span>
              </div>
              <div class="avatar-picker">
                <button
                  v-for="a in AVATARS"
                  :key="a"
                  class="avatar-opt"
                  :class="{ active: form.avatar === a }"
                  @click="form.avatar = a"
                >{{ a }}</button>
                <button class="avatar-upload" title="选择一张本地图片做头像" @click="pickFile">
                  📷 上传图片
                </button>
                <input
                  ref="fileInput"
                  class="avatar-file"
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
                >
              </div>
              <p class="avatar-hint">支持 emoji 头像或本地图片（自动裁成方形并压缩，不会撑爆浏览器存储）</p>
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
import { ref, reactive, computed, onMounted } from 'vue'
import PageShell from './PageShell.vue'
import UserAvatar from './UserAvatar.vue'
import DailyTasks from './DailyTasks.vue'
import FrameShop from './FrameShop.vue'
import { pointsState } from '../points'
import {
  AVATARS,
  DEFAULT_AVATAR,
  DEFAULT_SIGNATURE,
  loadProfile,
  saveProfile,
  readImageAsAvatar,
} from '../userProfile'

const DEFAULT_FAVORITES = [
  { id: 1, icon: '🍔', name: '蟹黄堡', desc: '蟹堡王招牌，海之霸永远无法复制的秘方' },
  { id: 2, icon: '🪼', name: '水母网', desc: '抓水母必备神器，派大星强烈推荐' },
  { id: 3, icon: '🐌', name: '小蜗的壳', desc: '一只会喵喵叫的宠物蜗牛，比奇堡最黏人' },
]

/** 统计卡数据来自积分系统累计（原来写死的 27 / 12 只是演示数字） */
const stats = computed(() => ({
  jelly: pointsState.totalCatch,
  orders: pointsState.totalOrder,
}))
const username = ref('spongebob')
const favorites = ref([...DEFAULT_FAVORITES])
const form = reactive({ nickname: '海绵宝宝', signature: DEFAULT_SIGNATURE, avatar: DEFAULT_AVATAR })
const toast = ref('')
const fileInput = ref(null)
let toastTimer = null

onMounted(() => {
  // 资料统一从 userProfile store 读，改完首页 / 导航栏会立即同步
  const p = loadProfile()
  username.value = p.username || username.value
  form.nickname = p.nickname || form.nickname
  form.signature = p.signature || form.signature
  form.avatar = p.avatar || form.avatar

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

/** 保存资料：写入 store + localStorage，首页与导航栏会同步显示新昵称 / 新头像 */
function save() {
  if (!form.nickname) {
    showToast('昵称不能为空哦')
    return
  }
  saveProfile({
    username: username.value,
    nickname: form.nickname,
    signature: form.signature,
    avatar: form.avatar,
  })
  persistFavorites()
  showToast('资料已保存，比奇堡的大家都看到啦')
}

/** 打开本地文件选择框（换自定义头像） */
function pickFile() {
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  try {
    form.avatar = await readImageAsAvatar(file)
    showToast('头像已换好，记得点「保存资料」')
  } catch (err) {
    showToast(err.message || '图片读取失败，换一张试试')
  } finally {
    // 允许再次选择同一张图
    if (fileInput.value) fileInput.value.value = ''
  }
}

function reset() {
  form.nickname = username.value
  form.signature = DEFAULT_SIGNATURE
  form.avatar = DEFAULT_AVATAR
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
.profile-avatar {
  margin: 0 auto 12px;
  display: flex !important;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat-card {
  padding: 14px 10px;
  background: rgba(255, 251, 235, .93);
  border: 3px solid #FBBF24;
  border-radius: var(--r-card-sm);
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
  border-radius: var(--r-pill);
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
  border-radius: var(--r-field);
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
.avatar-panel {
  flex: 1;
  min-width: 0;
}
.avatar-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.avatar-preview-tip {
  color: #B45309;
  font-size: 12px;
}
.avatar-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.avatar-opt {
  width: 38px;
  height: 38px;
  border: 3px solid #FBBF24;
  border-radius: var(--r-field);
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
.avatar-upload {
  padding: 0 14px;
  height: 38px;
  border: 3px dashed #F59E0B;
  border-radius: var(--r-field);
  background: #FFFBEB;
  color: #92400E;
  font-family: inherit;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: background .2s, border-color .2s;
}
.avatar-upload:hover {
  background: #FEF3C7;
  border-color: #D97706;
}
.avatar-file { display: none; }
.avatar-hint {
  margin-top: 8px;
  color: #B45309;
  font-size: 12px;
  line-height: 1.6;
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
@media (max-width: 520px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
