<template>
  <!-- 海底 -->
  <div class="sand"></div>
  <div
    v-for="(w, i) in seaweeds"
    :key="'w' + i"
    class="seaweed"
    :style="w"
  ></div>

  <!-- 比奇堡花朵云 -->
  <div
    v-for="(f, i) in flowers"
    :key="'f' + i"
    class="flower-cloud"
    :style="f"
  ></div>
</template>

<script setup>
const seaweeds = [
  { left: '8%',  height: '120px', animationDelay: '0s' },
  { left: '13%', height: '80px',  animationDelay: '.8s' },
  { right: '10%', height: '100px', animationDelay: '.4s' },
  { right: '15%', height: '70px',  animationDelay: '1.2s' },
]

const flowers = [
  { width: '90px', height: '90px', top: '8%',  left: '12%' },
  { width: '60px', height: '60px', top: '15%', right: '18%' },
  { width: '70px', height: '70px', top: '40%', left: '4%' },
]
</script>
