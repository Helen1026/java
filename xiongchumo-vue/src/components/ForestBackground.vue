<template>
  <!-- 飘动的树叶 -->
  <div class="leaves">
    <div
      v-for="(leaf, i) in leaves"
      :key="i"
      class="leaf"
      :style="{
        width: leaf.size + 'px',
        height: leaf.size + 'px',
        left: leaf.left + 'vw',
        animationDuration: leaf.duration + 's',
        animationDelay: leaf.delay + 's'
      }"
    />
  </div>

  <!-- 远处树林剪影 -->
  <div class="tree-line"></div>
</template>

<script setup>
// 随机生成 14 片飘落树叶的样式参数
const leaves = Array.from({ length: 14 }, () => ({
  size: 10 + Math.random() * 18,
  left: Math.random() * 100,
  duration: 6 + Math.random() * 7,
  delay: Math.random() * 8
}))
</script>

<style scoped>
.leaves {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.leaf {
  position: absolute;
  top: -40px;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 0 100% 0 100%;
  animation: fall linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0;
  }
}

.tree-line {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 22vh;
  background: var(--forest-deep);
  clip-path: polygon(
    0 60%, 4% 40%, 8% 62%, 12% 35%, 16% 60%, 20% 30%, 24% 58%, 28% 38%,
    32% 62%, 36% 32%, 40% 60%, 44% 36%, 48% 62%, 52% 30%, 56% 58%, 60% 38%,
    64% 62%, 68% 33%, 72% 60%, 76% 36%, 80% 62%, 84% 34%, 88% 60%, 92% 38%,
    96% 62%, 100% 42%, 100% 100%, 0 100%
  );
  z-index: 0;
  opacity: 0.85;
}
</style>
