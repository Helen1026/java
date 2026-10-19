<template>
  <canvas
    ref="canvasRef"
    class="captcha-canvas"
    width="112"
    height="44"
    title="看不清？点击刷新"
    @click="refresh"
  ></canvas>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/**
 * 本地画布图形验证码（后端未就绪时的占位实现）。
 * 后端就绪后：调用 auth.js 的 getCaptchaApi() 获取 { captchaId, img }，
 * 将 <canvas> 替换为 <img :src="img">，并把 captchaId 随注册请求提交即可。
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去掉易混淆字符
const COLORS = ['#0369A1', '#059669', '#B45309', '#BE123C', '#6D28D9']

const canvasRef = ref(null)
const code = ref('')

function randomCode() {
  let s = ''
  for (let i = 0; i < 4; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return s
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas

  // 背景
  ctx.fillStyle = '#FFFBEB'
  ctx.fillRect(0, 0, width, height)

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = COLORS[Math.floor(Math.random() * COLORS.length)] + '66'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.bezierCurveTo(
      Math.random() * width, Math.random() * height,
      Math.random() * width, Math.random() * height,
      Math.random() * width, Math.random() * height
    )
    ctx.stroke()
  }

  // 干扰点
  for (let i = 0; i < 24; i++) {
    ctx.fillStyle = COLORS[Math.floor(Math.random() * COLORS.length)] + '88'
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, 1.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // 字符
  code.value = randomCode()
  ctx.textBaseline = 'middle'
  for (let i = 0; i < code.value.length; i++) {
    ctx.font = `bold ${24 + Math.floor(Math.random() * 6)}px "Comic Sans MS", sans-serif`
    ctx.fillStyle = COLORS[Math.floor(Math.random() * COLORS.length)]
    ctx.save()
    ctx.translate(16 + i * 26, height / 2 + (Math.random() * 6 - 3))
    ctx.rotate((Math.random() * 30 - 15) * Math.PI / 180)
    ctx.fillText(code.value[i], 0, 0)
    ctx.restore()
  }
}

function refresh() {
  draw()
}

/** 校验输入（不区分大小写） */
function verify(input) {
  return !!input && input.toUpperCase() === code.value
}

onMounted(draw)

defineExpose({ refresh, verify })
</script>

<style scoped>
.captcha-canvas {
  flex-shrink: 0;
  border: 3px solid #F59E0B;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color .2s;
}
.captcha-canvas:hover {
  border-color: var(--sea-green);
}
</style>
