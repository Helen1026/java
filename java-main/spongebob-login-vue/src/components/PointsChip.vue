<template>
  <button
    class="points-chip"
    :class="{ 'is-ready': todayDoneCount === DAILY_TASKS.length }"
    :title="tip"
    @click="goProfile"
  >
    <span class="pc-coin" aria-hidden="true">🪙</span>
    <span class="pc-num">{{ pointsState.balance }}</span>
    <span class="pc-progress" aria-hidden="true">
      <i
        v-for="t in todayTasks"
        :key="t.key"
        class="pc-dot"
        :class="{ done: t.done }"
      ></i>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { DAILY_TASKS, pointsState, todayDoneCount, todayTasks } from '../points'

const router = useRouter()

const tip = computed(() => {
  const lines = todayTasks.value.map(
    (t) => `${t.icon} ${t.name} ${t.count}/${t.target}${t.done ? ' ✓' : ''}`
  )
  return [`🪙 我的积分：${pointsState.balance}`, ...lines, '点击去菠萝屋做任务 / 换头像框'].join('\n')
})

function goProfile() {
  if (router.currentRoute.value.path === '/pineapple') return
  router.push('/pineapple')
}
</script>

<style scoped>
.points-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 2px solid #FBBF24;
  border-radius: var(--r-pill);
  background: #FFFBEB;
  color: #7C2D12;
  font-family: inherit;
  font-size: 13px;
  font-weight: bold;
  line-height: 1.2;
  cursor: pointer;
  transition: background .2s, transform .1s, box-shadow .2s;
}
.points-chip:hover {
  background: #FEF3C7;
  transform: translateY(-1px);
}
.points-chip.is-ready {
  border-color: #34D399;
  background: #ECFDF5;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, .18);
}
.pc-coin { font-size: 14px; line-height: 1; }
.pc-num { font-variant-numeric: tabular-nums; }

.pc-progress {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 2px;
  padding-left: 6px;
  border-left: 1px dashed #FCD34D;
}
.pc-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #FCD34D;
}
.pc-dot.done { background: #10B981; }

@media (max-width: 640px) {
  .pc-progress { display: none; }
}
</style>
