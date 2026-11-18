<template>
  <div class="line-chart">
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="xMidYMid meet" role="img">
      <!-- 横向网格 + Y 轴刻度 -->
      <g v-for="(g, i) in gridLines" :key="'grid' + i">
        <line :x1="PAD_L" :y1="g.y" :x2="W - PAD_R" :y2="g.y" stroke="#FDE68A" stroke-width="1" />
        <text :x="PAD_L - 8" :y="g.y + 4" text-anchor="end" class="axis-text">{{ g.label }}</text>
      </g>

      <!-- X 轴日期标签（自动抽稀，避免挤在一起） -->
      <text
        v-for="(lb, i) in xLabels"
        :key="'x' + i"
        :x="lb.x"
        :y="H - PAD_B + 18"
        text-anchor="middle"
        class="axis-text"
      >{{ lb.text }}</text>

      <!-- 每个系列的折线 + 数据点 -->
      <g v-for="(s, si) in series" :key="'s' + si">
        <path
          :d="linePath(s)"
          fill="none"
          :stroke="s.color"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-for="(pt, i) in points(s)"
          :key="'p' + si + '-' + i"
          :cx="pt.x"
          :cy="pt.y"
          r="4"
          :fill="s.color"
          stroke="#FFFBEB"
          stroke-width="1.5"
        >
          <title>{{ pt.label }} · {{ s.name }}：{{ pt.value }}</title>
        </circle>
      </g>
    </svg>

    <div class="legend">
      <span v-for="(s, i) in series" :key="i" class="legend-item">
        <span class="legend-dot" :style="{ background: s.color }"></span>
        {{ s.name }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 轻量 SVG 折线图（无第三方依赖）。
 * props.series: [{ name, color, points: [{ label, value }] }]
 * 悬停数据点可看到「日期 · 系列：数值」的提示。
 */
const props = defineProps({
  series: { type: Array, default: () => [] },
})

const W = 680
const H = 280
const PAD_L = 52
const PAD_R = 18
const PAD_T = 20
const PAD_B = 36

const n = computed(() => {
  const first = props.series.find((s) => s.points && s.points.length)
  return first ? first.points.length : 0
})

/** Y 轴上限：取全系列最大值，向上取整到 4 的倍数，保证刻度好看 */
const maxVal = computed(() => {
  let max = 0
  for (const s of props.series) {
    for (const p of s.points || []) max = Math.max(max, Number(p.value) || 0)
  }
  if (max <= 4) return 4
  return Math.ceil((max * 1.15) / 4) * 4
})

const gridLines = computed(() => {
  const lines = []
  const innerH = H - PAD_T - PAD_B
  for (let i = 0; i <= 4; i++) {
    const v = Math.round((maxVal.value * i) / 4)
    lines.push({
      y: PAD_T + innerH - (innerH * i) / 4,
      label: String(v),
    })
  }
  return lines
})

function px(i) {
  const innerW = W - PAD_L - PAD_R
  if (n.value <= 1) return PAD_L + innerW / 2
  return PAD_L + (innerW * i) / (n.value - 1)
}

function py(v) {
  const innerH = H - PAD_T - PAD_B
  const ratio = maxVal.value === 0 ? 0 : (Number(v) || 0) / maxVal.value
  return PAD_T + innerH - innerH * ratio
}

function points(s) {
  return (s.points || []).map((p, i) => ({
    x: px(i),
    y: py(p.value),
    label: p.label,
    value: p.value,
  }))
}

function linePath(s) {
  const pts = points(s)
  if (!pts.length) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

/** 14 天标签显示约 7 个：每隔 2 个取 1 个 */
const xLabels = computed(() => {
  if (!n.value) return []
  const step = Math.max(1, Math.ceil(n.value / 7))
  const labels = []
  const first = props.series.find((s) => s.points && s.points.length)
  ;(first.points || []).forEach((p, i) => {
    if (i % step === 0 || i === n.value - 1) {
      labels.push({ x: px(i), text: p.label })
    }
  })
  return labels
})
</script>

<style scoped>
.line-chart { width: 100%; }
.line-chart svg { width: 100%; height: auto; display: block; }
.axis-text {
  font-size: 12px;
  fill: #B45309;
  font-weight: bold;
}
.legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 4px;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #7C2D12;
  font-size: 13px;
  font-weight: bold;
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
