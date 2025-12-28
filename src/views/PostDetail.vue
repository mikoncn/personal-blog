<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import postsData from '../data/posts.json'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const router = useRouter()
const props = defineProps(['id'])

const post = ref(null)
const loading = ref(true)

const formattedContent = computed(() => {
  if (!post.value) return ''
  return post.value.content
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br>')
})

onMounted(() => {
  const foundPost = postsData.find(p => p.id === props.id)
  if (foundPost) {
    post.value = foundPost
  }
  loading.value = false
})

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="post-detail">
    <Header />
    <div class="container">
      <div v-if="loading" class="loading">
        <div class="loading-text">LOADING...</div>
      </div>
      
      <div v-else-if="post" class="post-content">
        <button class="back-button" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">返回首页</span>
        </button>
        
        <div class="post-header">
          <span class="post-category">{{ post.category }}</span>
          <span class="post-date">{{ post.date }}</span>
        </div>
        
        <h1 class="post-title">{{ post.title }}</h1>
        
        <div class="post-body" v-html="formattedContent"></div>
      </div>
      
      <div v-else class="not-found">
        <h2 class="not-found-title">404</h2>
        <p class="not-found-text">文章未找到</p>
        <button class="back-button" @click="goBack">返回首页</button>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.post-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(0, 20, 0, 0.95), rgba(0, 40, 0, 0.95));
  position: relative;
  z-index: 1;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-text {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 1.5rem;
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.post-content {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-button {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 12px 24px;
  cursor: pointer;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 30px;
  border-radius: 4px;
}

.back-button:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  transform: translateX(-5px);
}

.back-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.back-button:hover .back-icon {
  transform: translateX(-3px);
}

.back-text {
  font-weight: 600;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
}

.post-category {
  color: #ff00ff;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 8px #ff00ff, 0 0 15px #ff00ff;
  font-weight: 600;
}

.post-date {
  color: #00ffff;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff;
}

.post-title {
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  line-height: 1.3;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.5), 0 0 40px rgba(0, 255, 0, 0.3);
}

.post-body {
  color: #cccccc;
  font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  font-size: 1.1rem;
  line-height: 2;
  letter-spacing: 0.5px;
}

.post-body :deep(h1) {
  font-size: 2rem;
  color: #00ff00;
  margin: 40px 0 20px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 2px solid #00ff00;
  padding-bottom: 10px;
}

.post-body :deep(h2) {
  font-size: 1.6rem;
  color: #00ffff;
  margin: 35px 0 15px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.post-body :deep(h3) {
  font-size: 1.3rem;
  color: #ff00ff;
  margin: 30px 0 12px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.post-body :deep(strong) {
  color: #00ff00;
  font-weight: 700;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.post-body :deep(code) {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 2px 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  border-radius: 3px;
}

.post-body :deep(br) {
  margin-bottom: 10px;
}

.not-found {
  text-align: center;
  padding: 100px 20px;
}

.not-found-title {
  font-size: 6rem;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 900;
  text-shadow: 0 0 30px #00ff00, 0 0 60px #00ff00;
  margin-bottom: 20px;
}

.not-found-text {
  font-size: 1.5rem;
  color: #cccccc;
  font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }

  .post-body {
    font-size: 1rem;
  }

  .post-body :deep(h1) {
    font-size: 1.5rem;
  }

  .post-body :deep(h2) {
    font-size: 1.3rem;
  }

  .post-body :deep(h3) {
    font-size: 1.1rem;
  }
}
</style>
