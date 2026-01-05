<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="about-page">
    <div class="back-button-container">
      <router-link to="/" class="back-button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="#00ff00" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 19L5 12L12 5" stroke="#00ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-button-text">返回主页</span>
      </router-link>
    </div>

    <section class="about-content">
      <div class="profile-card bio-card">
        <h2 class="section-title">
          <span class="title-icon">🧬</span>
          身份识别
        </h2>
        
        <div class="bio-content">
          <div class="bio-tags">
            <span class="bio-tag">现实生活泥潭中的潜行者</span>
            <span class="bio-separator">|</span>
            <span class="bio-tag">Web3 探索者</span>
            <span class="bio-separator">|</span>
            <span class="bio-tag highlight">AI 激进派</span>
          </div>

          <div class="bio-details">
            <p>📸 <span class="label">爱好：</span>沉迷模型摄影与虚拟游戏。</p>
            <p>🔮 <span class="label">信仰：</span>AI 不仅是工具，它是未来本身。</p>
            <p>🛑 <span class="label">誓言：</span>2026 年起，拒绝手敲任何代码。<span class="glitch-text">Vibe Coding is the way.</span></p>
          </div>

          <div class="bio-quote">
            “一切都从这里开始。”
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(0, 20, 0, 0.95) 0%, rgba(0, 40, 0, 0.9) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.back-button-container {
  width: 100%;
  max-width: 800px;
  margin-bottom: 40px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  background-color: #0a0a0a;
  border: 2px solid #00ff00;
  color: #00ff00;
  text-decoration: none;
  font-size: 1rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;
  transform: skewX(-3deg);
}

.back-button:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
}

.back-button svg {
  width: 20px;
  height: 20px;
}

.about-content {
  width: 100%;
  max-width: 800px;
}

.bio-card {
  background: rgba(20, 15, 0, 0.8);
  border: 2px solid #00ffff;
  border-radius: 10px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
}

.section-title {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 1.5rem;
  color: #00ff00;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(0, 255, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
}

.bio-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 25px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.1rem;
  color: #ccc;
}

.bio-tag {
  color: #00ffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.bio-tag.highlight {
  color: #ff00ff;
  text-shadow: 0 0 10px #ff00ff;
  font-weight: bold;
}

.bio-separator {
  color: #333;
}

.bio-details p {
  margin-bottom: 12px;
  color: #bbb;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
}

.bio-details .label {
  color: #00ff00;
  font-weight: bold;
  margin-right: 5px;
}

.glitch-text {
  position: relative;
  display: inline-block;
  color: #fff;
  font-weight: bold;
  animation: glitch-skew 3s infinite linear alternate-reverse;
}

.bio-quote {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed rgba(0, 255, 255, 0.3);
  font-family: 'Orbitron', serif;
  font-style: italic;
  text-align: right;
  color: #00ffff;
  font-size: 1.2rem;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

@keyframes glitch-skew {
  0% { transform: skew(0deg); }
  10% { transform: skew(-2deg); }
  20% { transform: skew(2deg); }
  30% { transform: skew(0deg); }
  100% { transform: skew(0deg); }
}
</style>
