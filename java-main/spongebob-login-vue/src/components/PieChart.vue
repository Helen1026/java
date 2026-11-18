<template>
  <div class="pie-chart">
    <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" preserveAspectRatio="xMidYMid meet" role="img">
      <!-- 只有一个分类时直接画整圆环，避免扇形退化 -->
      <circle
        v-if="slices.length === 1"
        :cx="SIZE / 2"
        :cy="SIZE / 2"
        :r="(R_OUT + R_IN) / 2"
        fill="none"
        :stroke="slices[0].color"
        :stroke-width="R_OUT - R_IN"
      >
        <title>{{ slices[0].name }}：{{ slices[0].value }}（100%）</title>
      </circle>
      <path
        v-else
        v-for="(s, i) in slices"
        :key="i"
        :d="s.d"
        :fill="s.color"
        stroke="#FFFBEB"
        stroke-width="2"
      >
        <title>{{ s.name }}：{{ s.value }}（{{ s.percent }}%）</title>
      </path>
      <!-- 中心总数 -->
      <text :x="SIZE / 2" :y="SIZE / 2 - 2" text-anchor="middle" class="pie-num">{{ total }}</text>
      <text :x="SIZE / 2" :y="SIZE / 2 + 16" text-anchor="middle" class="pie-unit">总计</text>
    </svg>

    <ul class="legend">
      <li v-for="(s, i) in slices" :key="i">
        <span class="legend-dot" :style="{ background: s.color }"></span>
        <span class="legend-name">{{ s.name }}</span>
        <span class="legend-val">{{ s.value }} · {{ s.percent }}%</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 轻量 SVG 环形图（无第三方依赖）。
 * props.data: [{ name, value }]，颜色按预设色板自动分配。
 * 悬停扇形可看到「名称：数量（百分比）」的提示。
 */
const props = defineProps({
  data: { type: Array, default: () => [] },
})

const SIZE = 200
const R_OUT = 92
const R_IN = 58
const COLORS = ['#34D399', '#FBBF24', '#7DD3FC', '#FB7185', '#A78BFA', '#F59E0B', '#2DD4BF', '#F472B6', '#60A5FA', '#C4B5FD', '#FDE047', '#FCA5A5', '#6EE7B7', '#FDBA74']

const total = computed(() => props.data.reduce((sum, d) => sum + (Number(d.value) || 0), 0))

const slices = computed(() => {
  const sum = total.value
  if (sum <= 0) return []
  const cx = SIZE / 2
  const cy = SIZE / 2
  // 单一分类：整圆不拆扇形
  const valid = props.data.filter((d) => (Number(d.value) || 0) > 0)
  if (valid.length === 1) {
    return [{
      name: valid[0].name,
      value: valid[0].value,
      percent: 100,
      color: COLORS[0],
      d: '',
    }]
  }
  let angle = -Math.PI / 2 // 从正上方开始
  return valid.map((d, i) => {
    const v = Number(d.value) || 0
    const sweep = (v / sum) * Math.PI * 2
    const a0 = angle
    const a1 = angle + sweep
    angle = a1
    return {
      name: d.name,
      value: d.value,
      percent: Math.round((v / sum) * 100),
      color: COLORS[i % COLORS.length],
      d: donutSegment(cx, cy, R_IN, R_OUT, a0, a1),
    }
  })
})

/** 环形扇形路径：外圆顺时针 + 内圆逆时针 */
function donutSegment(cx, cy, rIn, rOut, a0, a1) {
  const largeArc = a1 - a0 > Math.PI ? 1 : 0
  const x0 = cx + rOut * Math.cos(a0)
  const y0 = cy + rOut * Math.sin(a0)
  const x1 = cx + rOut * Math.cos(a1)
  const y1 = cy + rOut * Math.sin(a1)
  const x2 = cx + rIn * Math.cos(a1)
  const y2 = cy + rIn * Math.sin(a1)
  const x3 = cx + rIn * Math.cos(a0)
  const y3 = cy + rIn * Math.sin(a0)
  return [
    `M${x0.toFixed(2)},${y0.toFixed(2)}`,
    `A${rOut},${rOut} 0 ${largeArc} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`,
    `L${x2.toFixed(2)},${y2.toFixed(2)}`,
    `A${rIn},${rIn} 0 ${largeArc} 0 ${x3.toFixed(2)},${y3.toFixed(2)}`,
    'Z',
  ].join(' ')
}
</script>

<style scoped>
.pie-chart {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}
.pie-chart svg { width: 190px; height: 190px; flex-shrink: 0; }
.pie-num { font-size: 26px; font-weight: bold; fill: #7C2D12; }
.pie-unit { font-size: 12px; font-weight: bold; fill: #B45309; }
.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 150px;
}
.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #78350F;
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  flex-shrink: 0;
}
.legend-name {
  font-weight: bold;
  color: #7C2D12;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.legend-val { margin-left: auto; color: #B45309; white-space: nowrap; }
</style>
