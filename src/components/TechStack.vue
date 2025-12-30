<template>
  <section class="tech-stack">
    <h3 class="section-title">技术栈</h3>
    <div class="tech-tags">
      <span 
        v-for="(tech, index) in technologies" 
        :key="index" 
        class="tech-tag"
      >
        {{ tech }}
      </span>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const technologies = ref([
  'Vue 3',
  'Vite',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Python',
  'React',
  'Docker',
  'Kubernetes',
  'AWS',
  'Git',
  'Linux'
])
</script>

<style scoped>
.tech-stack {
  margin-bottom: 60px;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
  border-left: 4px solid #00ffff;
  padding-left: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  position: relative;
  transform: skewX(-3deg);
}

.section-title::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #00ffff, transparent);
  animation: title-glow 2s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.tech-tag {
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #00ff00;
  padding: 12px 24px;
  color: #00ff00;
  transition: all 0.3s ease;
  cursor: pointer;
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

.tech-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  transition: left 0.4s ease;
}

.tech-tag:hover::before {
  left: 100%;
}

.tech-tag:hover {
  background: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 20px #00ff00;
  transform: skewX(-2deg) scale(1.1);
}
</style>
