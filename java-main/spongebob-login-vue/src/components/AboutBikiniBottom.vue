<template>
  <PageShell
    title="🌊 关于比奇堡"
    subtitle="一座沉在太平洋海底的小镇，住着一块海绵、一只海星和一位不太开心的章鱼"
    :toast="toast"
    footer-text="关于比奇堡 · 页面内容为粉丝向演示资料，仅供学习交流"
  >
    <template #hero>
      <div class="fact-bar">
        <div v-for="f in FACTS" :key="f.label" class="fact">
          <span class="fact-num">{{ f.value }}</span>
          <span class="fact-label">{{ f.label }}</span>
        </div>
      </div>
    </template>

    <!-- 小镇简介 -->
    <section class="panel intro">
      <div class="panel-title">🏘️ 小镇简介</div>
      <p>
        比奇堡（Bikini Bottom）位于太平洋海底，是一座由珊瑚、贝壳与海藻搭起来的小镇。
        镇上有汉堡店、有水母田、有珊瑚礁学校，还有一条永远在修的公路。
        居民大多靠蟹黄堡和泡泡水过日子，偶尔会被一只想偷秘方的小浮游生物打扰。
      </p>
      <p>
        本项目的所有页面都以这座小镇为背景：登录页、注册页、首页搜索、水母田图鉴、蟹堡王订单，
        以及你现在看到的这一页，都共用同一套「海绵黄 + 海绿」的视觉语言。
      </p>
    </section>

    <!-- 地标 -->
    <div class="section-head">
      <h2>镇上的地标</h2>
      <span class="section-tip">按门牌号散步一圈</span>
    </div>
    <div class="pcard-grid landmark-grid">
      <article
        v-for="p in PLACES"
        :key="p.id"
        class="pcard hoverable"
        @click="visit(p)"
      >
        <div class="pcard-icon">{{ p.icon }}</div>
        <h3 class="pcard-title">{{ p.name }}</h3>
        <p class="pcard-desc">{{ p.desc }}</p>
        <div class="place-foot">
          <span class="pill">{{ p.owner }}</span>
          <span class="place-no">{{ p.no }}</span>
        </div>
      </article>
    </div>

    <!-- 时间线 -->
    <div class="section-head timeline-head">
      <h2>小镇编年史</h2>
      <span class="section-tip">从一块海绵诞生说起</span>
    </div>
    <ol class="timeline">
      <li v-for="t in TIMELINE" :key="t.year" class="tl-item">
        <span class="tl-dot"></span>
        <div class="tl-card">
          <div class="tl-year">{{ t.year }}</div>
          <div class="tl-title">{{ t.title }}</div>
          <p class="tl-desc">{{ t.desc }}</p>
        </div>
      </li>
    </ol>

    <!-- 联系 -->
    <section class="panel contact">
      <div class="panel-title">📮 联系我们</div>
      <p>
        想给蟹老板提建议？还是想举报痞老板又偷看秘方？写邮件到
        <span class="mail">krustykrab@bikinibottom.sea</span>，
        或者直接去水母田找海绵宝宝——他大概又在抓水母。
      </p>
      <div class="contact-actions">
        <button class="btn-sea" @click="go('/jellyfish')">去水母田</button>
        <button class="btn-amber" @click="go('/krusty-krab')">去蟹堡王</button>
        <button class="btn-amber" @click="go('/home')">回首页</button>
      </div>
    </section>
  </PageShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageShell from './PageShell.vue'

const router = useRouter()
const toast = ref('')
let toastTimer = null

const FACTS = [
  { value: '1999', label: '首次播出（美国）' },
  { value: '124', label: '贝壳街门牌号' },
  { value: '5', label: '主要地标' },
  { value: '∞', label: '蟹黄堡销量' },
]

const PLACES = [
  { id: 1, icon: '🍍', name: '菠萝屋', desc: '两室一厅，家具会响，养着一只会喵喵叫的蜗牛。', owner: '海绵宝宝', no: '贝壳街 124 号' },
  { id: 2, icon: '🪨', name: '石头屋', desc: '看起来像一块石头，住起来也像一块石头，但很温馨。', owner: '派大星', no: '贝壳街 122 号' },
  { id: 3, icon: '🗿', name: '复活节岛头像屋', desc: '镇上最讲究的房子，主人却总是一脸不情愿。', owner: '章鱼哥', no: '贝壳街 120 号' },
  { id: 4, icon: '🍔', name: '蟹堡王', desc: '比奇堡唯一的快餐店，招牌蟹黄堡每天排长队。', owner: '蟹老板', no: '海藻大道 1 号' },
  { id: 5, icon: '🪼', name: '水母田', desc: '镇外的一片蓝色草原，水母成群，是抓水母的好地方。', owner: '全体居民', no: '镇界以北' },
  { id: 6, icon: '🌰', name: '珊迪的树屋', desc: '海底里的橡树，装满了空气和一堆奇怪的科学装置。', owner: '珊迪', no: '珊瑚环礁旁' },
]

const TIMELINE = [
  { year: '1986', title: '一块海绵被画在纸上', desc: '创作者史蒂芬·海伦伯格是海洋生物学家，最初为教育漫画画下了这些海底角色。' },
  { year: '1999', title: '第一集播出', desc: '《急征店员》在美国首播，比奇堡正式向观众开放。' },
  { year: '2004', title: '登上大银幕', desc: '第一部剧场版上映，蟹黄堡秘方第一次成了全片的核心道具。' },
  { year: '今天', title: '它变成了一个 Vue 项目', desc: '于是有了这套海绵宝宝主题的登录、注册与首页，以及你正在看的这页。' },
]

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2000)
}

/** 点击地标：就近跳转到项目里对应的页面 */
function visit(p) {
  const map = { 1: '/pineapple', 4: '/krusty-krab', 5: '/jellyfish' }
  if (map[p.id]) {
    router.push(map[p.id])
    return
  }
  showToast(`${p.name}今天没开门，${p.owner}不在家～`)
}

function go(path) {
  router.push(path)
}
</script>

<style scoped>
/* ===== 数据条 ===== */
.fact-bar {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.fact {
  min-width: 118px;
  padding: 12px 18px;
  background: rgba(255, 251, 235, .93);
  border: 3px solid #FBBF24;
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, .18);
}
.fact-num {
  display: block;
  color: #7C2D12;
  font-size: 22px;
  font-weight: bold;
}
.fact-label {
  color: #92400E;
  font-size: 12px;
}

/* ===== 简介 ===== */
.intro { background: rgba(255, 251, 235, .96); }
.intro p {
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.9;
}
.intro p:last-child { margin-bottom: 0; }

/* ===== 区块标题 ===== */
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 26px 0 16px;
}
.section-head h2 {
  color: #fff;
  font-size: 20px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, .28);
}
.section-tip {
  color: #E0F2FE;
  font-size: 12px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}

/* ===== 地标 ===== */
.place-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
}
.place-no {
  color: #B45309;
  font-size: 11px;
}

/* ===== 时间线 ===== */
.timeline-head { margin-top: 30px; }
.timeline {
  list-style: none;
  position: relative;
  padding-left: 26px;
}
.timeline::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, #FBBF24, rgba(251, 191, 36, .2));
}
.tl-item {
  position: relative;
  margin-bottom: 14px;
}
.tl-dot {
  position: absolute;
  left: -26px;
  top: 16px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #FFFBEB;
  border: 4px solid #34D399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, .18);
}
.tl-card {
  padding: 14px 18px;
  background: rgba(255, 251, 235, .95);
  border: 3px solid #FBBF24;
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, .16);
}
.tl-year {
  color: #B45309;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}
.tl-title {
  margin: 4px 0 6px;
  color: #7C2D12;
  font-size: 16px;
  font-weight: bold;
}
.tl-desc {
  color: #92400E;
  font-size: 13px;
  line-height: 1.8;
}

/* ===== 联系 ===== */
.contact {
  margin-top: 24px;
  background: rgba(255, 251, 235, .96);
}
.mail {
  color: #0369A1;
  font-weight: bold;
}
.contact-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 640px) {
  .landmark-grid { grid-template-columns: 1fr; }
}
</style>
