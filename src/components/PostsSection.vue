<template>
  <section class="posts-section">
    <h3 class="section-title">最新文章</h3>
    
    <div v-if="loading" class="loading">
      <div class="loading-text">LOADING...</div>
    </div>
    
    <div v-else-if="error" class="error">
      <div class="error-text">加载失败: {{ error }}</div>
    </div>
    
    <div v-else class="posts-grid">
      <div 
        v-for="post in latestPosts" 
        :key="post.id" 
        class="post-card"
        @click="goToPost(post.id)"
      >
        <!-- 图片预览 - 只在有封面图时显示 -->
        <div v-if="post.image_url && post.image_url.cover" class="post-image-preview">
          <div class="cover-image-wrapper">
            <img 
              :src="typeof post.image_url.cover === 'string' ? post.image_url.cover : post.image_url.cover.url"
              :alt="post.title" 
              class="preview-image"
              :style="{
                transform: typeof post.image_url.cover === 'object' 
                  ? `translate(${post.image_url.cover.position?.x || 0}px, ${post.image_url.cover.position?.y || 0}px) scale(${post.image_url.cover.scale || 1})` 
                  : 'translate(0, 0) scale(1)'
              }"
            />
          </div>
        </div>
        
        <div class="post-header">
          <span class="post-category">{{ post.category }}</span>
          <span class="post-date">{{ formatDate(post.created_at) }}</span>
        </div>
        <h4 class="post-title">{{ post.title }}</h4>
        <p class="post-excerpt">{{ post.summary }}</p>
        <div class="post-tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <a href="#" class="read-more">阅读更多</a>
      </div>
    </div>

    <div class="view-all-container">
      <router-link to="/posts" class="view-all-btn">
        <span class="btn-text">查看所有文章</span>
        <span class="btn-arrow">→</span>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllPosts } from '../services/postService'
import { formatDate } from '../utils/dateFormatter'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const error = ref(null)

const latestPosts = computed(() => {
  return posts.value.slice(0, 3)
})

function goToPost(id) {
  console.log('⚔️ [帝国防卫军日志] 战术小队准备跃迁，目标圣典 ID:', id)
  router.push(`/post/${id}`)
}

onMounted(async () => {
  console.log('⚔️ [帝国防卫军日志] 战术小队已部署，开始加载圣典...')
  try {
    posts.value = await getAllPosts()
    console.log('⚔️ [帝国防卫军日志] 圣典装载完成，共', posts.value.length, '篇')
    console.log('⚔️ [帝国防卫军日志] 最新圣典:', latestPosts.value.map(p => ({ id: p.id, title: p.title })))
  } catch (err) {
    error.value = err.message
    console.error('☠️ [异端警告] 圣典装载失败！', err)
  } finally {
    loading.value = false
    console.log('⚔️ [帝国防卫军日志] 装载程序结束，战斗准备就绪')
  }
})
</script>

<style scoped>
.posts-section {
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

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.post-card {
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #00ff00;
  padding: 30px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  transform: skewX(-2deg);
  cursor: pointer;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.2), transparent);
  transition: left 0.5s ease;
}

.post-card:hover::before {
  left: 100%;
}

.post-card:hover {
  transform: skewX(-2deg) translateY(-5px);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
  border-color: #00ffff;
}

/* 图片预览容器 */
.post-image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid rgba(0, 255, 0, 0.3);
}

.cover-image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* 预览图片 */
.preview-image {
  width: auto;
  height: auto;
  min-width: 100%;
  min-height: 100%;
  object-fit: none;
  transition: transform 0.1s ease;
  user-select: none;
  position: relative;
}

/* 图片数量标记 */
.image-count {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  border: 2px solid #00ff00;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.8);
  backdrop-filter: blur(5px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.post-category {
  color: #ff00ff;
  text-shadow: 0 0 8px #ff00ff, 0 0 15px #ff00ff;
  font-weight: 600;
  position: relative;
}

.post-category::after {
  content: '>';
  margin-left: 5px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.post-date {
  color: #00ffff;
  text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff;
  font-weight: 500;
}

.post-title {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #00ff00;
  font-weight: 600;
  letter-spacing: 1px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
  transform: skewX(2deg);
}

.post-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #00ff00;
  transition: width 0.3s ease;
}

.post-card:hover .post-title::after {
  width: 100%;
}

.post-excerpt {
  color: #cccccc;
  line-height: 1.8;
  margin-bottom: 20px;
  font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-size: 0.95rem;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}

.tag {
  background-color: transparent;
  color: #00ff00;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  border: 2px solid #00ff00;
  transition: all 0.3s ease;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  transition: left 0.5s ease;
}

.tag:hover::before {
  left: 100%;
}

.tag:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 20px #00ff00;
  transform: translateY(-2px) scale(1.05);
}

.read-more {
  color: #00ffff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-right: 20px;
  transform: skewX(2deg);
}

.read-more::after {
  content: '→';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s ease;
}

.read-more:hover::after {
  transform: translateY(-50%) translateX(5px);
}

.read-more:hover {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
  transform: skewX(2deg) translateX(5px);
}

.view-all-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 40px;
  background-color: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  text-decoration: none;
  font-size: 1.1rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
}

.view-all-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  transition: left 0.5s ease;
}

.view-all-btn:hover::before {
  left: 100%;
}

.view-all-btn:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.1);
}

.btn-arrow {
  transition: transform 0.3s ease;
  font-size: 1.2rem;
}

.view-all-btn:hover .btn-arrow {
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }

  .post-title {
    font-size: 1.1rem;
    letter-spacing: 0.5px;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  /* 图片预览移动端适配 */
  .post-image-preview {
    height: 180px;
  }

  .view-all-btn {
    padding: 10px 25px;
    font-size: 0.9rem;
    letter-spacing: 2px;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
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

.error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-text {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 1.2rem;
  color: #ff0000;
  text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
  text-align: center;
}
</style>
