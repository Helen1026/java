<template>
  <section class="poster">
    <h1>熊 出 没</h1>
    <p>森林大本营 · 会员登录</p>

    <div class="bears">
      <!-- 熊大 -->
      <svg class="bear-briar" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="128" rx="34" ry="8" fill="#000" opacity=".15" />
        <circle cx="60" cy="70" r="44" fill="#8b5a2b" />
        <circle cx="60" cy="62" r="30" fill="#c89b6a" />
        <circle cx="32" cy="38" r="13" fill="#8b5a2b" />
        <circle cx="88" cy="38" r="13" fill="#8b5a2b" />
        <circle cx="32" cy="40" r="6" fill="#c89b6a" />
        <circle cx="88" cy="40" r="6" fill="#c89b6a" />
        <ellipse cx="60" cy="74" rx="20" ry="16" fill="#f0dcc0" />
        <circle cx="48" cy="62" r="5" fill="#3a2c1a" />
        <circle cx="72" cy="62" r="5" fill="#3a2c1a" />
        <circle cx="50" cy="60" r="1.6" fill="#fff" />
        <circle cx="74" cy="60" r="1.6" fill="#fff" />
        <ellipse cx="60" cy="80" rx="7" ry="5" fill="#5a3a1a" />
        <path d="M52 90 Q60 96 68 90" stroke="#5a3a1a" stroke-width="2.5" fill="none" stroke-linecap="round" />
      </svg>

      <!-- 熊二 -->
      <svg class="bear-bramble" viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="55" cy="120" rx="30" ry="7" fill="#000" opacity=".15" />
        <circle cx="55" cy="66" r="40" fill="#a9743f" />
        <circle cx="55" cy="60" r="27" fill="#d8b07e" />
        <circle cx="30" cy="36" r="12" fill="#a9743f" />
        <circle cx="80" cy="36" r="12" fill="#a9743f" />
        <circle cx="30" cy="38" r="5.5" fill="#d8b07e" />
        <circle cx="80" cy="38" r="5.5" fill="#d8b07e" />
        <ellipse cx="55" cy="70" rx="18" ry="14" fill="#f4e2c8" />
        <circle cx="45" cy="60" r="4.5" fill="#3a2c1a" />
        <circle cx="65" cy="60" r="4.5" fill="#3a2c1a" />
        <circle cx="47" cy="58.5" r="1.5" fill="#fff" />
        <circle cx="67" cy="58.5" r="1.5" fill="#fff" />
        <ellipse cx="55" cy="76" rx="6" ry="4.5" fill="#5a3a1a" />
        <path d="M48 85 Q55 90 62 85" stroke="#5a3a1a" stroke-width="2.2" fill="none" stroke-linecap="round" />
      </svg>

      <!-- 蜂蜜罐 -->
      <svg class="honey-pot" viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="66" rx="22" ry="4" fill="#000" opacity=".12" />
        <path d="M10 24 H50 L46 62 Q45 66 41 66 H19 Q15 66 14 62 Z" fill="#e8a33d" />
        <rect x="8" y="14" width="44" height="14" rx="6" fill="#d98e2b" />
        <ellipse cx="30" cy="14" rx="22" ry="6" fill="#f4c46b" />
        <text x="30" y="48" font-size="16" text-anchor="middle" fill="#fff">🍯</text>
      </svg>
    </div>
  </section>
</template>

<style scoped>
.poster {
  width: 42%;
  background: radial-gradient(circle at 50% 30%, #7fc98c 0%, #3f8a52 70%, #2f6b3d 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px;
  color: var(--cream);
}

.poster h1 {
  font-size: 30px;
  letter-spacing: 2px;
  margin-bottom: 6px;
  text-shadow: 0 3px 0 rgba(0, 0, 0, 0.18);
}

.poster p {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 18px;
}

.bears {
  position: relative;
  width: 100%;
  height: 220px;
}

.bears svg {
  position: absolute;
  bottom: 0;
  filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.25));
}

.bear-briar {
  left: 8%;
  width: 130px;
  animation: bob 3s ease-in-out infinite;
}

.bear-bramble {
  right: 8%;
  width: 100px;
  animation: bob 3s ease-in-out infinite 0.6s;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

.honey-pot {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 54px;
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.08);
  }
}

@media (max-width: 720px) {
  .poster {
    width: 100%;
    padding: 22px;
  }
  .bears {
    height: 150px;
  }
}
</style>
