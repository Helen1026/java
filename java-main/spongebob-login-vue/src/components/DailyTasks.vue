<template>
  <section class="panel tasks-panel" :class="{ compact }">
    <div class="panel-title">
      🎯 每日任务
      <span class="panel-extra">每日 0 点重置</span>
    </div>

    <!-- 余额 + 今日进度 -->
    <div class="tasks-head">
      <div class="balance">
        <span class="balance-coin">🪙</span>
        <div class="balance-text">
          <strong>{{ pointsState.balance }}</strong>
          <span>我的积分</span>
        </div>
      </div>
      <div class="head-side">
        <span class="today-earned">今日 +{{ todayEarned }}</span>
        <span class="today-done">完成 {{ todayDoneCount }}/{{ DAILY_TASKS.length }}</span>
      </div>
    </div>

    <!-- 任务列表 -->
    <ul class="task-list">
      <li v-for="t in todayTasks" :key="t.key" class="task-row" :class="{ done: t.done }">
        <span class="task-icon">{{ t.icon }}</span>
        <div class="task-main">
          <div class="task-top">
            <span class="task-name">{{ t.name }}</span>
            <span class="task-reward">+{{ t.points }} 🪙{{ t.target > 1 ? ` / ${t.unit}` : '' }}</span>
          </div>
          <p v-if="!compact" class="task-desc">{{ t.desc }}</p>
          <div class="task-bar" :aria-label="`${t.count}/${t.target}`">
            <span class="task-fill" :style="{ width: `${(t.count / t.target) * 100}%` }"></span>
          </div>
        </div>
        <span class="task-state" :class="{ ok: t.done }">
          {{ t.done ? '已完成' : `${t.count}/${t.target}` }}
        </span>
      </li>
    </ul>

    <!-- 积分流水 -->
    <div v-if="!compact" class="task-history">
      <div class="history-title">最近积分记录</div>
      <ul v-if="pointsState.history.length" class="history-list">
        <li v-for="h in pointsState.history.slice(0, 5)" :key="h.id" class="history-item">
          <span class="history-name">{{ h.title }}</span>
          <span class="history-time">{{ h.time }}</span>
          <span class="history-points" :class="{ minus: h.points < 0 }">
            {{ h.points > 0 ? '+' : '' }}{{ h.points }}
          </span>
        </li>
      </ul>
      <p v-else class="history-empty">还没有积分记录，去蟹堡王下一单试试～</p>
    </div>
  </section>
</template>

<script setup>
import {
  DAILY_TASKS,
  pointsState,
  todayDoneCount,
  todayEarned,
  todayTasks,
} from '../points'

defineProps({
  /** 首页用的紧凑版：隐藏说明与流水 */
  compact: { type: Boolean, default: false },
})
</script>

<style scoped>
.tasks-panel.compact {
  padding: 16px 18px;
}

/* ===== 余额区 ===== */
.tasks-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(160deg, #FEF9C3, #FDE68A);
  border: 2px solid #FBBF24;
  border-radius: var(--r-card-sm);
}
.balance {
  display: flex;
  align-items: center;
  gap: 8px;
}
.balance-coin {
  font-size: 26px;
  line-height: 1;
  filter: drop-shadow(0 2px 3px rgba(180, 83, 9, .3));
}
.balance-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.balance-text strong {
  color: #7C2D12;
  font-size: 22px;
  font-variant-numeric: tabular-nums;
}
.balance-text span {
  color: #92400E;
  font-size: 11px;
}
.head-side {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.today-earned {
  padding: 1px 9px;
  border-radius: var(--r-pill);
  background: rgba(255, 251, 235, .85);
  border: 1px solid #F59E0B;
  color: #B45309;
  font-size: 11px;
  font-weight: bold;
}
.today-done {
  color: #92400E;
  font-size: 11px;
}

/* ===== 任务行 ===== */
.task-list {
  list-style: none;
  margin-top: 12px;
}
.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px dashed #FCD34D;
}
.task-row:last-child { border-bottom: none; }
.task-icon {
  flex-shrink: 0;
  font-size: 20px;
  line-height: 1;
}
.task-main { flex: 1; min-width: 0; }
.task-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.task-name {
  color: #7C2D12;
  font-size: 13px;
  font-weight: bold;
}
.task-reward {
  margin-left: auto;
  color: #B45309;
  font-size: 11px;
  white-space: nowrap;
}
.task-desc {
  margin: 2px 0 5px;
  color: #B45309;
  font-size: 11px;
  line-height: 1.5;
}
.task-bar {
  height: 6px;
  margin-top: 5px;
  overflow: hidden;
  background: #FEF3C7;
  border-radius: var(--r-pill);
}
.task-fill {
  display: block;
  height: 100%;
  border-radius: var(--r-pill);
  background: linear-gradient(90deg, #34D399, #059669);
  transition: width .35s ease;
}
.task-state {
  flex-shrink: 0;
  min-width: 46px;
  padding: 2px 8px;
  border-radius: var(--r-pill);
  background: #FEF3C7;
  color: #B45309;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.task-state.ok {
  background: #D1FAE5;
  color: #047857;
}
.task-row.done .task-name { color: #047857; }

/* ===== 流水 ===== */
.task-history {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 2px dashed #FCD34D;
}
.history-title {
  margin-bottom: 6px;
  color: #92400E;
  font-size: 12px;
  font-weight: bold;
}
.history-list { list-style: none; }
.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 11px;
  color: #B45309;
}
.history-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-time {
  flex-shrink: 0;
  color: #C2894A;
  font-variant-numeric: tabular-nums;
}
.history-points {
  flex-shrink: 0;
  min-width: 36px;
  color: #047857;
  font-weight: bold;
  text-align: right;
}
.history-points.minus { color: #B91C1C; }
.history-empty {
  color: #B45309;
  font-size: 11px;
  text-align: center;
  padding: 4px 0;
}
</style>
