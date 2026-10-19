<template>
  <BubbleField />
  <SeaDecor />
  <router-view v-slot="{ Component }">
    <transition name="swim" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import BubbleField from './components/BubbleField.vue'
import SeaDecor from './components/SeaDecor.vue'
</script>

<style>
/* 路由切换动画：像游走一样 */
.swim-enter-active,
.swim-leave-active {
  transition: opacity .35s ease, transform .35s ease;
}
.swim-enter-from {
  opacity: 0;
  transform: translateX(40px) rotate(1deg);
}
.swim-leave-to {
  opacity: 0;
  transform: translateX(-40px) rotate(-1deg);
}
</style>
