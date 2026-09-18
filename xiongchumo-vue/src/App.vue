<template>
  <ForestBackground />

  <div class="stage">
    <BearScene />
    <LoginPanel />
  </div>
</template>

<script setup>
import ForestBackground from './components/ForestBackground.vue'
import BearScene from './components/BearScene.vue'
import LoginPanel from './components/LoginPanel.vue'
</script>

<style scoped>
.stage {
  position: relative;
  z-index: 2;
  width: 920px;
  max-width: 94vw;
  display: flex;
  align-items: stretch;
  background: rgba(255, 248, 236, 0.92);
  border-radius: 28px;
  box-shadow: 0 30px 70px rgba(31, 74, 43, 0.45);
  overflow: hidden;
  backdrop-filter: blur(6px);
}

@media (max-width: 720px) {
  .stage {
    flex-direction: column;
  }
}
</style>
