<template>
  <div class="admin-root">
    <!-- ===== 顶栏 ===== -->
    <header class="topbar">
      <div class="brand">
        <span class="brand-icon">🐠</span>
        <span class="brand-text">比奇堡后台管理系统</span>
      </div>
      <div class="top-right">
        <div class="user-chip" :title="nickname">
          <span>🔐</span>
          <span class="user-name">{{ nickname }}</span>
        </div>
        <button class="btn-logout" @click="logout">退出登录</button>
      </div>
    </header>

    <div class="body">
      <!-- ===== 侧边栏 ===== -->
      <aside class="sidebar">
        <button
          v-for="m in menus"
          :key="m.key"
          class="menu-item"
          :class="{ active: menu === m.key }"
          @click="menu = m.key"
        >
          <span class="menu-icon">{{ m.icon }}</span>
          <span>{{ m.label }}</span>
        </button>
      </aside>

      <!-- ===== 主内容 ===== -->
      <main class="main">
        <!-- 概览 -->
        <section v-if="menu === 'overview'" class="overview">
          <h2 class="block-title">📊 数据概览</h2>
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-num">{{ stats.items }}</div>
              <div class="stat-label">条目总数</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">{{ stats.itemsOn }}</div>
              <div class="stat-label">已上线条目</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">{{ stats.cats }}</div>
              <div class="stat-label">分类总数</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">{{ stats.catsOn }}</div>
              <div class="stat-label">已启用分类</div>
            </div>
          </div>
          <div class="quick">
            <button class="btn-sea" @click="menu = 'items'">管理首页条目 →</button>
            <button class="btn-amber" @click="menu = 'categories'">管理分类 →</button>
          </div>
          <p class="tip">这里管理的数据会直接同步到首页（搜索、热门推荐、分级分类），改完刷新首页即可看到。</p>
        </section>

        <!-- 条目管理 -->
        <section v-if="menu === 'items'">
          <div class="toolbar">
            <h2 class="block-title">🍔 首页条目管理</h2>
            <div class="toolbar-actions">
              <div class="search-box">
                <span class="search-icon">🔍</span>
                <input v-model.trim="itemKeyword" placeholder="搜标题 / 描述 / 标签" @keyup.enter="loadItems">
                <button class="btn-amber" @click="loadItems">搜索</button>
                <button class="btn-amber ghost" @click="resetItemSearch">重置</button>
              </div>
              <button class="btn-sea" @click="openItemForm(null)">＋ 新增条目</button>
            </div>
          </div>

          <div v-if="itemsLoading" class="empty-box">🫧 数据加载中…</div>
          <table v-else class="data-table">
            <thead>
              <tr>
                <th style="width:54px">图标</th>
                <th>标题</th>
                <th>描述</th>
                <th>标签</th>
                <th style="width:70px">热度</th>
                <th>分类</th>
                <th style="width:70px">状态</th>
                <th style="width:130px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in items" :key="it.id">
                <td class="center">{{ it.icon || '—' }}</td>
                <td class="bold">{{ it.title }}</td>
                <td class="desc">{{ it.description || it.desc || '—' }}</td>
                <td><span class="pill">{{ it.tag || '—' }}</span></td>
                <td class="center">🔥 {{ it.hot ?? 0 }}</td>
                <td>{{ it.categoryName || '—' }}</td>
                <td class="center">
                  <span class="badge" :class="it.status === 1 ? 'on' : 'off'">
                    {{ it.status === 1 ? '正常' : '禁用' }}
                  </span>
                </td>
                <td class="center">
                  <button class="btn-amber mini" @click="openItemForm(it)">编辑</button>
                  <button class="btn-coral mini" @click="removeItem(it)">删除</button>
                </td>
              </tr>
              <tr v-if="!items.length">
                <td colspan="8" class="empty-cell">还没有条目，点「新增条目」添加一个吧～</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 分类管理 -->
        <section v-if="menu === 'categories'">
          <div class="toolbar">
            <h2 class="block-title">🗂️ 首页分类管理</h2>
            <div class="toolbar-actions">
              <button class="btn-sea" @click="openCatForm(null)">＋ 新增分类</button>
            </div>
          </div>

          <div v-if="catsLoading" class="empty-box">🫧 数据加载中…</div>
          <table v-else class="data-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>父级</th>
                <th style="width:70px">层级</th>
                <th style="width:70px">排序</th>
                <th style="width:70px">状态</th>
                <th style="width:130px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in categories" :key="c.id">
                <td class="bold">{{ c.name }}</td>
                <td>{{ c.parentName || '顶级' }}</td>
                <td class="center">{{ c.level }}</td>
                <td class="center">{{ c.sort ?? 0 }}</td>
                <td class="center">
                  <span class="badge" :class="c.status === 1 ? 'on' : 'off'">
                    {{ c.status === 1 ? '正常' : '禁用' }}
                  </span>
                </td>
                <td class="center">
                  <button class="btn-amber mini" @click="openCatForm(c)">编辑</button>
                  <button class="btn-coral mini" @click="removeCat(c)">删除</button>
                </td>
              </tr>
              <tr v-if="!categories.length">
                <td colspan="6" class="empty-cell">还没有分类，点「新增分类」添加一个吧～</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>

    <!-- ===== 条目表单弹窗 ===== -->
    <div v-if="showItemModal" class="modal-mask" @click.self="showItemModal = false">
      <div class="modal">
        <h3 class="modal-title">{{ editingItem ? '编辑条目' : '新增条目' }}</h3>
        <div class="form-grid">
          <div class="field">
            <label>图标（emoji）</label>
            <input v-model.trim="itemForm.icon" placeholder="例如 🍔" maxlength="4">
          </div>
          <div class="field">
            <label>标题 *</label>
            <input v-model.trim="itemForm.title" placeholder="条目名称">
          </div>
          <div class="field full">
            <label>描述</label>
            <textarea v-model.trim="itemForm.description" rows="2" placeholder="一句话介绍"></textarea>
          </div>
          <div class="field">
            <label>标签</label>
            <input v-model.trim="itemForm.tag" placeholder="例如 美食">
          </div>
          <div class="field">
            <label>热度</label>
            <input v-model.number="itemForm.hot" type="number" min="0" placeholder="0">
          </div>
          <div class="field">
            <label>所属分类</label>
            <select v-model.number="itemForm.categoryId">
              <option :value="0">未分类</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ '　'.repeat((c.level || 1) - 1) }}{{ c.name }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>状态</label>
            <select v-model.number="itemForm.status">
              <option :value="1">正常</option>
              <option :value="0">禁用</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-amber" @click="showItemModal = false">取消</button>
          <button class="btn-sea" :disabled="saving" @click="saveItem">{{ saving ? '保存中…' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- ===== 分类表单弹窗 ===== -->
    <div v-if="showCatModal" class="modal-mask" @click.self="showCatModal = false">
      <div class="modal">
        <h3 class="modal-title">{{ editingCat ? '编辑分类' : '新增分类' }}</h3>
        <div class="form-grid">
          <div class="field full">
            <label>分类名称 *</label>
            <input v-model.trim="catForm.name" placeholder="例如 美食">
          </div>
          <div class="field">
            <label>父级分类</label>
            <select v-model.number="catForm.parentId">
              <option :value="0">顶级分类</option>
              <option
                v-for="c in parentOptions"
                :key="c.id"
                :value="c.id"
                :disabled="c._disabled"
              >
                {{ '　'.repeat((c.level || 1) - 1) }}{{ c.name }}{{ c._disabled ? '（自身/后代）' : '' }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>排序</label>
            <input v-model.number="catForm.sort" type="number" min="0" placeholder="0">
          </div>
          <div class="field">
            <label>状态</label>
            <select v-model.number="catForm.status">
              <option :value="1">正常</option>
              <option :value="0">禁用</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-amber" @click="showCatModal = false">取消</button>
          <button class="btn-sea" :disabled="saving" @click="saveCat">{{ saving ? '保存中…' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- 全局轻提示 -->
    <transition name="page-toast-fade">
      <div v-if="toast" class="page-toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  adminProfileApi, listItems, createItem, updateItem, deleteItem,
  listCategories, createCategory, updateCategory, deleteCategory,
} from '../api/admin'

const router = useRouter()

const menu = ref('overview')
const menus = [
  { key: 'overview', label: '数据概览', icon: '📊' },
  { key: 'items', label: '条目管理', icon: '🍔' },
  { key: 'categories', label: '分类管理', icon: '🗂️' },
]

const nickname = ref('管理员')
const toast = ref('')
let toastTimer = null

const items = ref([])
const itemsLoading = ref(false)
const itemKeyword = ref('')

const categories = ref([])
const catsLoading = ref(false)

const showItemModal = ref(false)
const editingItem = ref(null)
const saving = ref(false)
const itemForm = reactive({ icon: '', title: '', description: '', tag: '', hot: 0, categoryId: 0, status: 1 })

const showCatModal = ref(false)
const editingCat = ref(null)
const catForm = reactive({ name: '', parentId: 0, sort: 0, status: 1 })

/** 概览统计 */
const stats = computed(() => ({
  items: items.value.length,
  itemsOn: items.value.filter((i) => i.status === 1).length,
  cats: categories.value.length,
  catsOn: categories.value.filter((c) => c.status === 1).length,
}))

/** 分类父级下拉：排除自身及后代，避免产生循环层级 */
const parentOptions = computed(() => {
  if (!editingCat.value) return categories.value
  const forbidden = new Set([editingCat.value.id])
  // 收集后代
  const childrenOf = (pid) => categories.value.filter((c) => c.parentId === pid)
  const stack = [...childrenOf(editingCat.value.id)]
  while (stack.length) {
    const node = stack.pop()
    forbidden.add(node.id)
    stack.push(...childrenOf(node.id))
  }
  return categories.value.map((c) => ({ ...c, _disabled: forbidden.has(c.id) }))
})

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2200)
}

async function loadProfile() {
  try {
    const res = await adminProfileApi()
    const info = res.data || {}
    nickname.value = info.nickname || info.username || nickname.value
    localStorage.setItem('userInfo', JSON.stringify({
      username: info.username || '',
      nickname: info.nickname || nickname.value,
      role: 'admin',
    }))
  } catch {
    try {
      const raw = localStorage.getItem('userInfo')
      if (raw) nickname.value = JSON.parse(raw).nickname || nickname.value
    } catch {}
  }
}

async function loadItems() {
  itemsLoading.value = true
  try {
    const res = await listItems(itemKeyword.value)
    items.value = res.data || []
  } catch (err) {
    handleAuthError(err)
    showToast(err.message || '加载条目失败')
  } finally {
    itemsLoading.value = false
  }
}

function resetItemSearch() {
  itemKeyword.value = ''
  loadItems()
}

async function loadCategories() {
  catsLoading.value = true
  try {
    const res = await listCategories()
    categories.value = res.data || []
  } catch (err) {
    handleAuthError(err)
    showToast(err.message || '加载分类失败')
  } finally {
    catsLoading.value = false
  }
}

function handleAuthError(err) {
  const m = (err.message || '').toLowerCase()
  if (m.includes('权限') || m.includes('403')) {
    // 已登录但不是管理员：直接引导到后台登录页换管理员账号。
    // 不再弹提示后把用户甩回首页（那样会看到一瞬间的空白后台，还得重新登录）。
    router.replace({ path: '/admin/login', query: { reason: 'noauth' } })
    return
  }
  if (m.includes('未登录') || m.includes('过期') || m.includes('401')) {
    localStorage.removeItem('token')
    router.replace('/admin/login')
  }
}

// ===== 条目表单 =====
function openItemForm(it) {
  editingItem.value = it
  if (it) {
    Object.assign(itemForm, {
      icon: it.icon || '',
      title: it.title || '',
      description: it.description || it.desc || '',
      tag: it.tag || '',
      hot: it.hot ?? 0,
      categoryId: it.categoryId || 0,
      status: it.status ?? 1,
    })
  } else {
    Object.assign(itemForm, { icon: '', title: '', description: '', tag: '', hot: 0, categoryId: 0, status: 1 })
  }
  showItemModal.value = true
}

async function saveItem() {
  if (!itemForm.title) {
    showToast('标题不能为空哦～')
    return
  }
  saving.value = true
  const payload = {
    icon: itemForm.icon,
    title: itemForm.title,
    description: itemForm.description,
    tag: itemForm.tag,
    hot: Number(itemForm.hot) || 0,
    categoryId: itemForm.categoryId || null,
    status: itemForm.status,
  }
  try {
    if (editingItem.value) {
      await updateItem(editingItem.value.id, payload)
      showToast('条目已更新 🎉')
    } else {
      await createItem(payload)
      showToast('条目已新增 🎉')
    }
    showItemModal.value = false
    await loadItems()
  } catch (err) {
    handleAuthError(err)
    showToast(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function removeItem(it) {
  if (!confirm(`确定删除条目「${it.title}」吗？`)) return
  try {
    await deleteItem(it.id)
    showToast('已删除')
    await loadItems()
  } catch (err) {
    handleAuthError(err)
    showToast(err.message || '删除失败')
  }
}

// ===== 分类表单 =====
function openCatForm(c) {
  editingCat.value = c
  if (c) {
    Object.assign(catForm, {
      name: c.name || '',
      parentId: c.parentId || 0,
      sort: c.sort ?? 0,
      status: c.status ?? 1,
    })
  } else {
    Object.assign(catForm, { name: '', parentId: 0, sort: 0, status: 1 })
  }
  showCatModal.value = true
}

async function saveCat() {
  if (!catForm.name) {
    showToast('分类名称不能为空哦～')
    return
  }
  saving.value = true
  const payload = {
    name: catForm.name,
    parentId: catForm.parentId || 0,
    sort: Number(catForm.sort) || 0,
    status: catForm.status,
  }
  try {
    if (editingCat.value) {
      await updateCategory(editingCat.value.id, payload)
      showToast('分类已更新 🎉')
    } else {
      await createCategory(payload)
      showToast('分类已新增 🎉')
    }
    showCatModal.value = false
    await loadCategories()
  } catch (err) {
    handleAuthError(err)
    showToast(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function removeCat(c) {
  if (!confirm(`确定删除分类「${c.name}」吗？`)) return
  try {
    await deleteCategory(c.id)
    showToast('已删除')
    await loadCategories()
  } catch (err) {
    handleAuthError(err)
    showToast(err.message || '删除失败（请先删除其子分类）')
  }
}

function logout() {
  if (!confirm('退出后台管理？')) return
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('username')
  router.replace('/admin/login')
}

onMounted(() => {
  loadProfile()
  loadItems()
  loadCategories()
})
</script>

<style scoped>
.admin-root {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: #1F2937;
}

/* 顶栏 */
.topbar {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  background: rgba(255, 251, 235, .95);
  border-bottom: 3px solid #FBBF24;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .12);
}
.brand { display: flex; align-items: center; gap: 8px; }
.brand-icon { font-size: 24px; animation: seabob 2.6s ease-in-out infinite; }
@keyframes seabob {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-4px) rotate(6deg); }
}
.brand-text { font-size: 18px; font-weight: bold; color: #7C2D12; letter-spacing: 1px; }
.top-right { display: flex; align-items: center; gap: 12px; }
.user-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; background: #FFFBEB; border: 2px solid #FBBF24;
  border-radius: 999px; font-size: 13px; font-weight: bold; color: #7C2D12;
}
.user-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn-logout {
  padding: 7px 14px; border: none; border-radius: 12px;
  background: linear-gradient(180deg, #FB7185, #E11D48); color: #fff;
  font-family: inherit; font-size: 13px; font-weight: bold; cursor: pointer;
  box-shadow: 0 3px 0 #9F1239; transition: transform .1s, box-shadow .1s, filter .2s;
}
.btn-logout:hover { filter: brightness(1.06); }
.btn-logout:active { transform: translateY(3px); box-shadow: 0 0 0 #9F1239; }

/* 主体 */
.body { flex: 1; display: flex; min-height: 0; }
.sidebar {
  width: 200px; flex-shrink: 0; padding: 18px 12px;
  background: rgba(255, 251, 235, .85); border-right: 2px solid #FDE68A;
  display: flex; flex-direction: column; gap: 8px;
}
.menu-item {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border: none; border-radius: 14px;
  background: transparent; color: #92400E; font-family: inherit;
  font-size: 15px; font-weight: bold; cursor: pointer; text-align: left;
  transition: background .2s, transform .1s;
}
.menu-item:hover { background: #FEF3C7; transform: translateX(2px); }
.menu-item.active {
  background: linear-gradient(180deg, #34D399, #059669); color: #fff;
  box-shadow: 0 3px 0 #047857;
}
.menu-icon { font-size: 18px; }

.main { flex: 1; overflow-y: auto; padding: 22px 26px 60px; }

/* 概览 */
.block-title { color: #7C2D12; font-size: 20px; letter-spacing: 1px; margin-bottom: 14px; }
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
.stat-card {
  padding: 22px; border-radius: 20px; text-align: center;
  background: linear-gradient(160deg, #FDE047, #FACC15); border: 4px solid #FBBF24;
  box-shadow: 0 10px 22px rgba(0, 0, 0, .2), inset 0 -5px 0 rgba(0, 0, 0, .07);
}
.stat-num { font-size: 32px; font-weight: bold; color: #7C2D12; }
.stat-label { margin-top: 6px; font-size: 13px; color: #92400E; }
.quick { margin-top: 22px; display: flex; gap: 12px; flex-wrap: wrap; }
.tip { margin-top: 16px; font-size: 13px; color: #92400E; line-height: 1.9; }

/* 工具栏 */
.toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.search-box { display: flex; align-items: center; gap: 6px; background: #FFFBEB; border: 3px solid #FBBF24; border-radius: 14px; padding: 4px 6px 4px 12px; }
.search-box .search-icon { font-size: 16px; }
.search-box input { border: none; background: transparent; outline: none; font-family: inherit; font-size: 14px; color: #78350F; padding: 8px 4px; min-width: 160px; }

/* 数据表格 */
.data-table {
  width: 100%; border-collapse: separate; border-spacing: 0;
  background: rgba(255, 251, 235, .96); border-radius: 18px; overflow: hidden;
  box-shadow: 0 10px 22px rgba(0, 0, 0, .16); border: 3px solid #FBBF24;
}
.data-table th {
  background: #FEF3C7; color: #7C2D12; font-size: 13px; text-align: left;
  padding: 12px 14px; border-bottom: 2px solid #F59E0B; white-space: nowrap;
}
.data-table td { padding: 11px 14px; font-size: 13px; color: #78350F; border-bottom: 1px solid #FDE68A; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: rgba(253, 230, 138, .4); }
.center { text-align: center; }
.bold { font-weight: bold; color: #7C2D12; }
.desc { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty-cell { text-align: center; color: #B45309; padding: 26px; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; }
.badge.on { background: #D1FAE5; color: #047857; border: 1px solid #34D399; }
.badge.off { background: #FEE2E2; color: #B91C1C; border: 1px solid #FB7185; }

.mini { padding: 5px 10px; font-size: 12px; }

/* 弹窗 */
.modal-mask {
  position: fixed; inset: 0; z-index: 80;
  background: rgba(3, 20, 40, .5); display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px); padding: 20px;
}
.modal {
  width: 560px; max-width: 100%; max-height: 90vh; overflow-y: auto;
  padding: 24px 26px; border-radius: 24px;
  background: linear-gradient(160deg, #FDE047, #FACC15); border: 4px solid #FBBF24;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .35), inset 0 -6px 0 rgba(0, 0, 0, .07);
}
.modal-title { color: #7C2D12; font-size: 20px; letter-spacing: 1px; margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }
.field label { font-size: 13px; font-weight: bold; color: #7C2D12; }
.field input, .field textarea, .field select {
  padding: 10px 12px; border: 3px solid #F59E0B; border-radius: 12px;
  background: #FFFBEB; font-family: inherit; font-size: 14px; color: #78350F; outline: none;
  transition: border-color .2s, box-shadow .2s; resize: vertical;
}
.field input:focus, .field textarea:focus, .field select:focus {
  border-color: var(--sea-green); box-shadow: 0 0 0 4px rgba(45, 212, 191, .25);
}
.modal-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px; }

/* 小屏 */
@media (max-width: 720px) {
  .sidebar { width: 120px; }
  .menu-item { font-size: 13px; padding: 10px; }
  .menu-item span:last-child { display: none; }
  .form-grid { grid-template-columns: 1fr; }
  .main { padding: 16px; }
}
</style>
