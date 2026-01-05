<script setup>
import { ref } from 'vue'
import ChaosIcon from './ChaosIcon.vue'
import { socialConfig } from '../data/config'

const showModal = ref(false)
const copySuccess = ref(false)

async function copyEmail() {
  if (!socialConfig.email) return
  
  try {
    await navigator.clipboard.writeText(socialConfig.email)
    copySuccess.value = true
    setTimeout(() => {
      showModal.value = false
      setTimeout(() => {
        copySuccess.value = false
      }, 300)
    }, 800)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

function handleEmailClick() {
  if (socialConfig.email) {
    showModal.value = true
  }
}
</script>

<template>
  <footer class="footer">
    <p>© 2026 MIKON BLOG. All rights reserved.</p>
    <div class="social-links">
      <a 
        :href="socialConfig.github || 'javascript:void(0)'" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="social-link"
        :class="{ 'disabled': !socialConfig.github }"
        @click="!socialConfig.github && $event.preventDefault()"
      >
        GitHub
      </a>
      <a 
        :href="socialConfig.twitter || 'javascript:void(0)'" 
        target="_blank"
        rel="noopener noreferrer"
        class="social-link"
        :class="{ 'disabled': !socialConfig.twitter }"
        @click="!socialConfig.twitter && $event.preventDefault()"
      >
        Twitter
      </a>
      <a 
        :href="socialConfig.linkedin || 'javascript:void(0)'" 
        target="_blank"
        rel="noopener noreferrer"
        class="social-link"
        :class="{ 'disabled': !socialConfig.linkedin }"
        @click="!socialConfig.linkedin && $event.preventDefault()"
      >
        LinkedIn
      </a>
      <a 
        href="#" 
        @click.prevent="handleEmailClick" 
        class="social-link"
        :class="{ 'disabled': !socialConfig.email }"
      >
        Email
      </a>
    </div>

    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="mechanicus-modal">
          <div class="modal-corner top-left"></div>
          <div class="modal-corner top-right"></div>
          <div class="modal-corner bottom-left"></div>
          <div class="modal-corner bottom-right"></div>

          <div class="modal-header">
            <ChaosIcon name="mechanicus" size="2em" />
            <span class="system-text">[ SYSTEM: COGNITIO-LINK ESTABLISHED ]</span>
          </div>

          <div class="modal-body">
            <div class="prayer-text">
              <p class="prayer-en">Spirit of the Machine, hear my prayer. Guide the motive force to this cogitator.</p>
              <p class="prayer-cn">万机神灵，听我祈祷。引动动力源，注入此思工机。</p>
            </div>

            <div class="email-display">
              <span class="email-label">COGNITATOR ADDRESS:</span>
              <span class="email-address">{{ socialConfig.email }}</span>
            </div>
          </div>

          <div class="modal-footer">
            <button 
              class="auth-btn" 
              @click="copyEmail"
              :class="{ success: copySuccess }"
            >
              {{ copySuccess ? '[ SUCCESS: BUFFER UPDATED ]' : '[ AUTHENTICATE & COPY ]' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </footer>
</template>

<style scoped>
.footer {
  text-align: center;
  padding: 40px 0;
  border-top: 2px solid #00ff00;
  margin-top: 60px;
  position: relative;
}

.footer p {
  margin-bottom: 20px;
  color: #cccccc;
  font-family: 'Rajdhani', sans-serif;
  letter-spacing: 1px;
  transform: skewX(-2deg);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.social-link {
  color: #00ff00;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 12px 24px;
  border: 1px solid #00ff00;
  background: rgba(0, 0, 0, 0.95);
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 1px;
  border-radius: 6px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 3px rgba(0, 255, 0, 0.3);
  transform: skewX(-2deg);
}

.social-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  transition: left 0.4s ease;
}

.social-link:hover::before {
  left: 100%;
}

.social-link:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 20px #00ff00;
  transform: skewX(-2deg) scale(1.05);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.mechanicus-modal {
  position: relative;
  width: 90%;
  max-width: 600px;
  background: rgba(0, 5, 0, 0.95);
  border: 2px solid #00ff00;
  padding: 40px;
  font-family: 'Courier New', 'Monaco', monospace;
  text-transform: uppercase;
  box-shadow: 
    0 0 30px rgba(0, 255, 0, 0.5),
    inset 0 0 60px rgba(0, 255, 0, 0.1);
  animation: glitch-in 0.3s ease-out;
}

.mechanicus-modal::before {
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

.modal-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #00ff00;
  z-index: 2;
}

.modal-corner.top-left {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.modal-corner.top-right {
  top: -3px;
  right: -3px;
  border-left: none;
  border-bottom: none;
}

.modal-corner.bottom-left {
  bottom: -3px;
  left: -3px;
  border-right: none;
  border-top: none;
}

.modal-corner.bottom-right {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
  position: relative;
  z-index: 2;
}

.system-text {
  color: #00ff00;
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-shadow: 0 0 10px #00ff00;
  animation: text-flicker 3s infinite;
}

.modal-body {
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
}

.prayer-text {
  margin-bottom: 30px;
  text-align: center;
}

.prayer-en {
  color: #00ff00;
  font-size: 0.85rem;
  line-height: 1.6;
  margin-bottom: 15px;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.prayer-cn {
  color: #00ffff;
  font-size: 0.85rem;
  line-height: 1.6;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.email-display {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff00;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.email-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.2), transparent);
  animation: scanline 2s linear infinite;
}

.email-label {
  display: block;
  color: #00ff00;
  font-size: 0.75rem;
  letter-spacing: 2px;
  margin-bottom: 10px;
  text-shadow: 0 0 5px #00ff00;
}

.email-address {
  display: block;
  color: #00ff00;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 3px;
  text-shadow: 
    0 0 10px #00ff00,
    0 0 20px #00ff00,
    0 0 30px #00ff00;
  animation: email-glow 2s ease-in-out infinite;
}

.modal-footer {
  text-align: center;
  position: relative;
  z-index: 2;
}

.auth-btn {
  background: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  padding: 15px 40px;
  font-family: 'Courier New', 'Monaco', monospace;
  font-size: 0.9rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.auth-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  transition: left 0.4s ease;
}

.auth-btn:hover::before {
  left: 100%;
}

.auth-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  transform: scale(1.05);
}

.auth-btn.success {
  background: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  text-shadow: none;
}

@keyframes glitch-in {
  0% {
    opacity: 0;
    transform: translateX(-20px) skewX(-10deg);
  }
  20% {
    opacity: 0.8;
    transform: translateX(5px) skewX(5deg);
  }
  40% {
    opacity: 0.9;
    transform: translateX(-3px) skewX(-3deg);
  }
  60% {
    opacity: 1;
    transform: translateX(2px) skewX(2deg);
  }
  80% {
    opacity: 1;
    transform: translateX(-1px) skewX(-1deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) skewX(0);
  }
}

@keyframes scanline {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes text-flicker {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  52% {
    opacity: 1;
  }
  54% {
    opacity: 0.7;
  }
  56% {
    opacity: 1;
  }
}

@keyframes email-glow {
  0%, 100% {
    text-shadow: 
      0 0 10px #00ff00,
      0 0 20px #00ff00,
      0 0 30px #00ff00;
  }
  50% {
    text-shadow: 
      0 0 15px #00ff00,
      0 0 30px #00ff00,
      0 0 45px #00ff00;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
