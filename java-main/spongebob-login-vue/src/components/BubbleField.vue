<template>
  <div class="bubbles" aria-hidden="true">
    <span
      v-for="(b, i) in bubbles"
      :key="i"
      class="bubble"
      :style="b"
    ></span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/**
 * 背景气泡：缓慢从海底升起，左右轻轻摆动，透明度压得很低，不抢内容。
 * 每个气泡的差异都通过 CSS 变量控制（尺寸 / 时长 / 延迟 / 摆动幅度 / 最高透明度），
 * 动画本身写在下面的 <style> 里，避免和 main.css 里的旧样式打架。
 */
const bubbles = ref(
  Array.from({ length: 26 }, (_, i) => {
    // 大泡少、小泡多：让画面像真实海水里的气泡
    const size = i % 5 === 0 ? 26 + Math.random() * 22 : 8 + Math.random() * 18
    return {
      '--size': `${size.toFixed(1)}px`,
      // 起浮位置随机铺满整个宽度
      '--left': `${(Math.random() * 100).toFixed(2)}%`,
      // 18~40s 缓慢上浮，越大气泡越慢
      '--dur': `${(18 + Math.random() * 14 + size * 0.2).toFixed(1)}s`,
      '--delay': `${(-Math.random() * 30).toFixed(1)}s`,
      // 左右摆动幅度 ±12~48px
      '--drift': `${(Math.random() * 36 + 12).toFixed(0)}px`,
      // 透明度上限：0.14~0.34，刻意很低
      '--peak': (0.14 + Math.random() * 0.2).toFixed(2),
      // 越大的泡越糊一点，增加景深感
      '--blur': size > 28 ? '1.2px' : '0px',
    }
  }),
)
</script>

<style scoped>
.bubbles {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bubble {
  position: absolute;
  left: var(--left);
  bottom: -90px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  /* 高光偏左上，像真的水泡 */
  background:
    radial-gradient(circle at 32% 30%, rgba(255, 255, 255, .95), rgba(255, 255, 255, .32) 42%, rgba(186, 230, 253, .18) 70%);
  box-shadow: inset 0 0 6px rgba(255, 255, 255, .5);
  filter: blur(var(--blur));
  opacity: 0;
  will-change: transform, opacity;
  animation: bubble-rise var(--dur) linear var(--delay) infinite;
}

@keyframes bubble-rise {
  0% {
    transform: translate3d(0, 0, 0) scale(.75);
    opacity: 0;
  }
  12% {
    opacity: var(--peak);
  }
  50% {
    transform: translate3d(var(--drift), -52vh, 0) scale(1);
  }
  88% {
    opacity: var(--peak);
  }
  100% {
    transform: translate3d(calc(var(--drift) * -0.7), -112vh, 0) scale(1.15);
    opacity: 0;
  }
}

/* 尊重系统「减少动态效果」设置：不要一堆气泡在飘 */
@media (prefers-reduced-motion: reduce) {
  .bubble {
    animation: none;
    opacity: 0;
  }
}
</style>
