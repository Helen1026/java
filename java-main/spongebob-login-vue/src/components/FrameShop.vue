<template>
  <section class="panel frame-shop">
    <div class="panel-title">
      🖼️ 头像框商店
      <span class="panel-extra">🪙 {{ pointsState.balance }}</span>
    </div>

    <p class="shop-tip">
      做每日任务攒积分，兑换后头像框会在全站（导航栏、欢迎语、菠萝屋）立即生效。
    </p>

    <ul class="frame-grid">
      <li
        v-for="f in FRAMES"
        :key="f.id"
        class="frame-card"
        :class="{ equipped: pointsState.frame === f.id, locked: !owns(f.id) }"
      >
        <div class="frame-preview">
          <UserAvatar :src="profile.avatar" :size="52" :ring="false" :frame="f.id" />
        </div>

        <div class="frame-info">
          <div class="frame-name">
            {{ f.emoji }} {{ f.name }}
          </div>
          <div class="frame-desc">{{ f.desc }}</div>
        </div>

        <div class="frame-act">
          <span v-if="f.cost > 0 && !owns(f.id)" class="frame-cost">🪙 {{ f.cost }}</span>
          <span v-else-if="f.cost === 0" class="frame-cost free">免费</span>

          <button
            v-if="pointsState.frame === f.id"
            class="frame-btn current"
            disabled
          >使用中</button>
          <button
            v-else-if="owns(f.id)"
            class="frame-btn equip"
            @click="equip(f)"
          >佩戴</button>
          <button
            v-else
            class="frame-btn buy"
            :disabled="pointsState.balance < f.cost"
            @click="buy(f)"
          >
            {{ pointsState.balance < f.cost ? '积分不足' : '兑换' }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import UserAvatar from './UserAvatar.vue'
import { profile } from '../userProfile'
import { FRAMES, equipFrame, ownsFrame, pointsState, redeemFrame } from '../points'

const emit = defineEmits(['toast'])

function owns(id) {
  return ownsFrame(id)
}

function buy(frame) {
  const extra = pointsState.balance < frame.cost ? `（还差 ${frame.cost - pointsState.balance} 积分）` : ''
  if (!confirm(`花 ${frame.cost} 积分兑换「${frame.name}」？${extra}`)) return

  const res = redeemFrame(frame.id)
  if (res.ok) {
    emit('toast', `兑换成功！已自动佩戴「${frame.name}」🪙 -${frame.cost}`)
  } else if (res.reason === 'poor') {
    emit('toast', `积分不够啦，还差 ${res.need} 积分，去做今日任务吧～`)
  } else if (res.reason === 'owned') {
    emit('toast', '你已经有这个头像框了，直接点佩戴就行')
  } else {
    emit('toast', '兑换失败，稍后再试试')
  }
}

function equip(frame) {
  const res = equipFrame(frame.id)
  emit('toast', res.ok ? `已戴上「${frame.name}」` : '还没兑换这个头像框哦')
}
</script>

<style scoped>
.shop-tip {
  margin: -4px 0 14px;
  color: #B45309;
  font-size: 11px;
  line-height: 1.6;
}

.frame-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  list-style: none;
}
.frame-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 12px;
  background: #FFFBEB;
  border: 2px solid #FDE68A;
  border-radius: var(--r-card-sm);
  transition: border-color .2s, transform .15s, box-shadow .2s;
}
.frame-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(180, 83, 9, .16);
}
.frame-card.equipped {
  border-color: #34D399;
  background: #F0FDF4;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, .16);
}
.frame-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 45%, #FFF7D6, #FDE68A);
}
.frame-info {
  text-align: center;
  min-height: 46px;
}
.frame-name {
  color: #7C2D12;
  font-size: 13px;
  font-weight: bold;
}
.frame-desc {
  margin-top: 2px;
  color: #B45309;
  font-size: 11px;
  line-height: 1.45;
}
.frame-act {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}
.frame-cost {
  color: #B45309;
  font-size: 12px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
}
.frame-cost.free { color: #047857; }

.frame-btn {
  padding: 5px 14px;
  border: none;
  border-radius: var(--r-pill);
  font-family: inherit;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: filter .2s, transform .1s;
}
.frame-btn.buy {
  background: linear-gradient(180deg, #FDE047, #FACC15);
  color: #7C2D12;
  box-shadow: 0 3px 0 #D97706;
}
.frame-btn.equip {
  background: linear-gradient(180deg, #34D399, #059669);
  color: #fff;
  box-shadow: 0 3px 0 #047857;
}
.frame-btn.current {
  background: #D1FAE5;
  color: #047857;
  cursor: default;
}
.frame-btn:not(.current):hover { filter: brightness(1.05); }
.frame-btn:not(.current):active {
  transform: translateY(2px);
  box-shadow: none;
}
.frame-btn:disabled {
  filter: grayscale(.55);
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 520px) {
  .frame-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
}
</style>
