<template>
  <span
    class="u-frame"
    :class="[frameDef.css, { 'has-frame': hasFrame }]"
    :style="frameStyle"
  >
    <span
      class="u-avatar"
      :class="{ 'is-image': isImage, 'has-ring': ring && !hasFrame, 'has-frame': hasFrame }"
      :style="sizeStyle"
      :title="title"
    >
      <img v-if="isImage" :src="src" alt="用户头像" draggable="false">
      <span v-else class="u-avatar-emoji">{{ src || DEFAULT_AVATAR }}</span>
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { DEFAULT_AVATAR, isImageAvatar } from '../userProfile'
import { frameOf, pointsState } from '../points'

const props = defineProps({
  /** emoji 或 dataURL 图片 */
  src: { type: String, default: DEFAULT_AVATAR },
  /** 直径（px） */
  size: { type: Number, default: 36 },
  /** 是否带外圈光晕 */
  ring: { type: Boolean, default: true },
  /** 悬浮提示 */
  title: { type: String, default: '去菠萝屋换头像' },
  /** 指定要预览的头像框 id；不传则跟随当前佩戴的框 */
  frame: { type: String, default: '' },
})

const isImage = computed(() => isImageAvatar(props.src))

/** 空字符串 → 用全站佩戴中的框；显式传 'none' 可以预览「无框」 */
const frameDef = computed(() => frameOf(props.frame || pointsState.frame))
const hasFrame = computed(() => frameDef.value.id !== 'none')

const sizeStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.55)}px`,
}))

/** 边框粗细跟头像大小走，24px 的导航头像不会被撑成大头 */
const frameStyle = computed(() => ({
  '--frame-pad': `${Math.max(2, Math.round(props.size * 0.05))}px`,
}))
</script>

<style scoped>
/* ===== 头像框容器 ===== */
.u-frame {
  position: relative;
  display: inline-flex;
  /* 关键：父级若把它设成 flex（菠萝屋头像是这样），不加 max-content 会被拉成椭圆 */
  width: max-content;
  flex-shrink: 0;
  vertical-align: middle;
  border-radius: 50%;
}
.u-frame.has-frame {
  padding: var(--frame-pad, 3px);
}
/* 渐变环画在伪元素上，被上方头像遮住中心，只露出外圈 */
.u-frame.has-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 50%;
  background: var(--frame-bg, #FBBF24);
  box-shadow: var(--frame-glow, none);
}

/* ===== 头像本体 ===== */
.u-avatar {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: #FFFBEB;
  border: 2px solid #FBBF24;
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, .06);
  line-height: 1;
  user-select: none;
}
.u-avatar.has-ring {
  box-shadow: 0 0 0 3px rgba(255, 251, 235, .75), inset 0 -2px 0 rgba(0, 0, 0, .06);
}
/* 有头像框时内圈改成白色细描边，避免黄边 + 彩框打架 */
.u-avatar.has-frame {
  border-color: rgba(255, 255, 255, .9);
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, .05);
}
.u-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.u-avatar-emoji {
  display: block;
  transform: translateY(1px);
}

/* ===== 各款头像框（纯 CSS，无需图片） ===== */
.frame-shell {
  --frame-bg: conic-gradient(from 20deg, #FDE68A, #FB923C, #F59E0B, #FDE68A);
  --frame-glow: 0 0 0 1px rgba(251, 146, 60, .35), 0 4px 12px rgba(251, 146, 60, .45);
}

.frame-bubble {
  --frame-bg: conic-gradient(from 0deg, #BFDBFE, #FFFFFF, #A5F3FC, #FFFFFF, #BFDBFE);
  --frame-glow: 0 0 0 1px rgba(125, 211, 252, .5), 0 4px 14px rgba(56, 189, 248, .4);
}

.frame-coral {
  --frame-bg: conic-gradient(from 30deg, #FDA4AF, #F0ABFC, #FBCFE8, #FDA4AF);
  --frame-glow: 0 0 0 1px rgba(244, 114, 182, .4), 0 4px 14px rgba(244, 114, 182, .42);
}

.frame-jelly {
  --frame-bg: conic-gradient(from 0deg, #5EEAD4, #A78BFA, #67E8F9, #5EEAD4);
  --frame-glow: 0 0 14px rgba(94, 234, 212, .75), 0 0 0 1px rgba(167, 139, 250, .4);
}
.frame-jelly::before {
  animation: frame-breathe 2.8s ease-in-out infinite;
}

.frame-pineapple {
  --frame-bg: conic-gradient(from 45deg, #FDE047, #65A30D, #FACC15, #FDE047);
  --frame-glow: 0 0 0 1px rgba(101, 163, 13, .35), 0 4px 14px rgba(250, 204, 21, .55);
}

.frame-gold {
  --frame-bg: conic-gradient(from 0deg, #FEF3C7, #F59E0B, #FEF9C3, #D97706, #FEF3C7);
  --frame-glow: 0 0 0 1px rgba(217, 119, 6, .45), 0 5px 16px rgba(245, 158, 11, .6);
}
.frame-gold::before {
  animation: frame-spin 7s linear infinite;
}

@keyframes frame-spin {
  to { transform: rotate(360deg); }
}
@keyframes frame-breathe {
  0%, 100% { opacity: .75; }
  50%      { opacity: 1; }
}

/* 尊重系统「减少动态效果」 */
@media (prefers-reduced-motion: reduce) {
  .frame-jelly::before,
  .frame-gold::before { animation: none; }
}
</style>
