<template>
  <header class="header">
    <h1 class="title">
      <span class="cyberpunk-logo" data-text="MIKON BLOG">
        MIKON BLOG
        <span class="scanline"></span>
        <span class="electricity"></span>
        <span class="pixel-overlay"></span>
        <span class="distortion"></span>
      </span>
    </h1>
    <nav class="nav">
      <router-link to="/" class="nav-link">首页</router-link>
      <router-link to="/posts" class="nav-link">文章</router-link>
      <router-link to="/make-post" class="nav-link">发布</router-link>
      <router-link to="/posts" class="nav-link">项目</router-link>
      <router-link to="/posts" class="nav-link">关于</router-link>
    </nav>
  </header>
</template>

<script setup>
</script>

<style scoped>
.header {
  text-align: center;
  padding: 40px 0;
  border-bottom: 2px solid #FCEE0A;
  margin-bottom: 40px;
  position: relative;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 1;
}

.title {
  font-size: 3.5rem;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 8px;
  font-weight: 900;
  font-family: 'Orbitron', 'Arial Black', 'Impact', sans-serif;
  position: relative;
  z-index: 2;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.cyberpunk-logo {
  position: relative;
  color: #FCEE0A;
  text-shadow: 
    0 0 5px #FCEE0A,
    0 0 10px #FCEE0A,
    0 0 20px #FCEE0A,
    0 0 40px #FCEE0A,
    0 0 80px #FCEE0A;
  animation: flicker 3s infinite, glitch-skew 4s infinite;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: 10px;
  font-weight: 900;
  display: inline-block;
  transform: skewX(-5deg);
  filter: drop-shadow(0 0 0 transparent);
}

.cyberpunk-logo::before,
.cyberpunk-logo::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: skewX(-5deg);
}

.cyberpunk-logo::before {
  color: #FF0040;
  text-shadow: 
    0 0 5px #FF0040,
    0 0 10px #FF0040;
  animation: glitch-1 2.5s infinite linear alternate-reverse;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  mix-blend-mode: screen;
}

.cyberpunk-logo::after {
  color: #00D9FF;
  text-shadow: 
    0 0 5px #00D9FF,
    0 0 10px #00D9FF;
  animation: glitch-2 2.5s infinite linear alternate-reverse;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
  mix-blend-mode: screen;
}

.cyberpunk-logo .scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(252, 238, 10, 0.2) 50%,
    transparent 100%
  );
  animation: scanline 3s linear infinite;
  pointer-events: none;
  transform: skewX(-5deg);
}

@keyframes flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    opacity: 1;
  }
  20%, 24%, 55% {
    opacity: 0.8;
  }
}

@keyframes glitch-1 {
  0% {
    transform: translate(0) skewX(-5deg);
  }
  20% {
    transform: translate(-2px, 2px) skewX(-3deg);
  }
  40% {
    transform: translate(-2px, -2px) skewX(-7deg);
  }
  60% {
    transform: translate(2px, 2px) skewX(-4deg);
  }
  80% {
    transform: translate(2px, -2px) skewX(-6deg);
  }
  100% {
    transform: translate(0) skewX(-5deg);
  }
}

@keyframes glitch-2 {
  0% {
    transform: translate(0) skewX(-5deg);
  }
  20% {
    transform: translate(2px, -2px) skewX(-7deg);
  }
  40% {
    transform: translate(2px, 2px) skewX(-3deg);
  }
  60% {
    transform: translate(-2px, -2px) skewX(-6deg);
  }
  80% {
    transform: translate(-2px, 2px) skewX(-4deg);
  }
  100% {
    transform: translate(0) skewX(-5deg);
  }
}

@keyframes glitch-skew {
  0%, 90%, 100% {
    transform: skewX(-5deg) scaleX(1);
  }
  91% {
    transform: skewX(0deg) scaleX(1.05);
  }
  92% {
    transform: skewX(-10deg) scaleX(0.95);
  }
  93% {
    transform: skewX(-2deg) scaleX(1.02);
  }
  94% {
    transform: skewX(-8deg) scaleX(0.98);
  }
}

@keyframes scanline {
  0% {
    transform: translateY(-100%) skewX(-5deg);
  }
  100% {
    transform: translateY(100%) skewX(-5deg);
  }
}

.cyberpunk-logo .pixel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 3px,
    rgba(252, 238, 10, 0.08) 3px,
    rgba(252, 238, 10, 0.08) 4px
  ),
  repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 3px,
    rgba(252, 238, 10, 0.08) 3px,
    rgba(252, 238, 10, 0.08) 4px
  );
  pointer-events: none;
  animation: pixelate 0.5s steps(4) infinite;
  opacity: 0;
  transform: skewX(-5deg);
}

.cyberpunk-logo .distortion {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(252, 238, 10, 0.2) 50%,
    transparent 60%
  );
  pointer-events: none;
  animation: distort 3s ease-in-out infinite;
  opacity: 0;
  transform: skewX(-5deg);
}

@keyframes pixelate {
  0%, 100% {
    opacity: 0;
    transform: scale(1) skewX(-5deg);
  }
  5% {
    opacity: 1;
    transform: scale(1.02) skewX(-5deg);
  }
  10% {
    opacity: 0;
    transform: scale(0.98) skewX(-5deg);
  }
}

@keyframes distort {
  0%, 100% {
    opacity: 0;
    transform: translateX(-100%) skewX(-5deg);
  }
  10% {
    opacity: 0.6;
    transform: translateX(0%) skewX(5deg);
  }
  20% {
    opacity: 0;
    transform: translateX(100%) skewX(-15deg);
  }
}

.nav {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

.nav-link {
  color: #00ff00;
  text-decoration: none;
  font-size: 1rem;
  padding: 12px 24px;
  border: 1px solid #00ff00;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 500;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
  display: inline-block;
}

.nav-link.router-link-active {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 20px #00ff00;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  transition: left 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 20px #00ff00;
  transform: skewX(-3deg) scale(1.05);
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
    letter-spacing: 4px;
  }

  .cyberpunk-logo {
    letter-spacing: 6px;
  }

  .nav {
    gap: 12px;
  }

  .nav-link {
    padding: 10px 18px;
    font-size: 0.9rem;
    letter-spacing: 1px;
  }
}
</style>
