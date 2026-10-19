<template>
  <div class="bubbles">
    <div
      v-for="(b, i) in bubbles"
      :key="i"
      class="bubble"
      :style="b"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const bubbles = ref(
  Array.from({ length: 22 }, () => {
    const size = 10 + Math.random() * 40
    return {
      width: size + 'px',
      height: size + 'px',
      left: Math.random() * 100 + 'vw',
      animationDuration: 6 + Math.random() * 8 + 's',
      animationDelay: Math.random() * 8 + 's',
    }
  })
)
</script>
