<template>
  <div class="all-posts-page">
    <!-- 页面标题区域 -->
    <section class="page-header">
      <h1 class="page-title">
        <span class="title-text">所有文章</span>
        <span class="title-glow"></span>
      </h1>
      <p class="page-subtitle">探索技术前沿，分享开发心得</p>
    </section>

    <!-- 文章列表区域 -->
    <section class="posts-section">
      <!-- 筛选器容器：搜索框和分类标签 -->
      <div class="filter-container">
        <!-- 搜索框 -->
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索文章..." 
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <!-- 分类标签切换 -->
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category"
            :class="['tab-button', { active: selectedCategory === category }]"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <!-- 文章卡片网格 -->
      <div class="posts-grid">
        <div 
          v-for="post in filteredPosts" 
          :key="post.id" 
          class="post-card"
          @click="goToPost(post.id)"
        >
          <!-- 文章头部：分类和日期 -->
          <div class="post-header">
            <span class="post-category">{{ post.category }}</span>
            <span class="post-date">{{ post.date }}</span>
          </div>
          <!-- 文章标题 -->
          <h4 class="post-title">{{ post.title }}</h4>
          <!-- 文章摘要 -->
          <p class="post-excerpt">{{ post.excerpt }}</p>
          <!-- 文章标签 -->
          <div class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <!-- 阅读更多链接 -->
          <a href="#" class="read-more">阅读更多</a>
        </div>
      </div>

      <!-- 无结果提示 -->
      <div v-if="filteredPosts.length === 0" class="no-results">
        <p>没有找到匹配的文章</p>
      </div>
    </section>
  </div>
</template>

<script setup>
// 导入Vue核心功能：响应式引用和计算属性
import { ref, computed } from 'vue'
// 导入Vue Router用于页面导航
import { useRouter } from 'vue-router'
// 导入文章数据
import postsData from '../data/posts.json'

// 初始化路由实例
const router = useRouter()
// 存储所有文章数据
const posts = ref(postsData)
// 搜索查询关键词
const searchQuery = ref('')
// 当前选中的分类
const selectedCategory = ref('All')

// 所有可用的分类选项
const categories = ['All', 'Web3', 'Dev', 'Life', 'Arbitrage']

// 计算属性：根据搜索关键词和分类筛选文章
const filteredPosts = computed(() => {
  let result = posts.value
  
  // 按分类筛选
  if (selectedCategory.value !== 'All') {
    result = result.filter(post => post.category === selectedCategory.value)
  }
  
  // 按搜索关键词筛选（匹配标题、摘要、分类和标签）
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }
  
  return result
})

// 跳转到文章详情页
function goToPost(id) {
  router.push(`/post/${id}`)
}
</script>

<style scoped>
/* 所有文章页面主容器 */
.all-posts-page {
  min-height: 100vh;
  padding: 40px 20px;
  position: relative;
}

/* 页面头部容器 */
.page-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

/* 页面标题样式 */
.page-title {
  font-size: 3rem;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 4px;
  font-weight: 700;
}

/* 标题文字：带霓虹发光效果 */
.title-text {
  position: relative;
  z-index: 2;
  color: #00ff00;
  text-shadow: 
    0 0 10px #00ff00,
    0 0 20px #00ff00,
    0 0 40px #00ff00;
  animation: title-glow 2s ease-in-out infinite;
}

/* 标题发光动画 */
@keyframes title-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 标题扫描线效果 */
.title-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  animation: title-scan 3s linear infinite;
  z-index: 1;
}

/* 扫描线移动动画 */
@keyframes title-scan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 页面副标题 */
.page-subtitle {
  color: #00ffff;
  font-size: 1.2rem;
  letter-spacing: 2px;
  font-family: 'Rajdhani', sans-serif;
  text-shadow: 0 0 10px #00ffff;
}

/* 文章列表区域 */
.posts-section {
  max-width: 1400px;
  margin: 0 auto;
}

/* 筛选器容器：搜索框和分类标签 */
.filter-container {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #00ff00;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  position: relative;
  overflow: hidden;
}

/* 筛选器顶部扫描线 */
.filter-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff00, transparent);
  animation: scanline 2s linear infinite;
}

/* 扫描线动画 */
@keyframes scanline {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 搜索框容器 */
.search-box {
  position: relative;
  margin-bottom: 20px;
}

/* 搜索输入框样式 */
.search-input {
  width: 100%;
  padding: 15px 50px 15px 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff00;
  color: #00ff00;
  font-size: 1rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  letter-spacing: 1px;
  border-radius: 4px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
}

/* 搜索框占位符颜色 */
.search-input::placeholder {
  color: rgba(0, 255, 0, 0.5);
}

/* 搜索框聚焦效果 */
.search-input:focus {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
}

/* 搜索图标 */
.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  pointer-events: none;
}

/* 分类标签容器 */
.category-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 分类标签按钮样式 */
.tab-button {
  padding: 10px 25px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff00;
  color: #00ff00;
  font-size: 0.9rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

/* 标签按钮悬停扫描效果 */
.tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.2), transparent);
  transition: left 0.5s ease;
}

/* 悬停时扫描线移动 */
.tab-button:hover::before {
  left: 100%;
}

/* 标签按钮悬停效果 */
.tab-button:hover {
  border-color: #00ffff;
  color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
  transform: translateY(-2px);
}

/* 激活的标签按钮样式 */
.tab-button.active {
  background: rgba(0, 255, 0, 0.2);
  border-color: #00ffff;
  color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  text-shadow: 0 0 10px #00ffff;
}

/* 文章卡片网格布局 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

/* 文章卡片样式 */
.post-card {
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid #00ff00;
  padding: 30px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  transform: skewX(-2deg);
  cursor: pointer;
}

/* 卡片悬停扫描效果 */
.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.2), transparent);
  transition: left 0.5s ease;
  pointer-events: none;
}

/* 悬停时扫描线移动 */
.post-card:hover::before {
  left: 100%;
}

/* 卡片悬停效果 */
.post-card:hover {
  transform: skewX(-2deg) translateY(-5px);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
  border-color: #00ffff;
}

/* 文章头部信息容器 */
.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 文章分类标签 */
.post-category {
  color: #ff00ff;
  text-shadow: 0 0 8px #ff00ff, 0 0 15px #ff00ff;
  font-weight: 600;
  position: relative;
}

/* 分类标签后的闪烁箭头 */
.post-category::after {
  content: '>';
  margin-left: 5px;
  animation: blink 1s infinite;
}

/* 闪烁动画 */
@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 文章日期 */
.post-date {
  color: #00ffff;
  text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff;
  font-weight: 500;
}

/* 文章标题 */
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

/* 标题下划线效果 */
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

/* 悬停时显示下划线 */
.post-card:hover .post-title::after {
  width: 100%;
}

/* 文章摘要 */
.post-excerpt {
  color: #cccccc;
  line-height: 1.8;
  margin-bottom: 20px;
  font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-size: 0.95rem;
}

/* 文章标签容器 */
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}

/* 单个标签样式 */
.tag {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  border: 1px solid rgba(0, 255, 0, 0.3);
  transition: all 0.3s ease;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* 标签悬停扫描效果 */
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

/* 悬停时扫描线移动 */
.tag:hover::before {
  left: 100%;
}

/* 标签悬停效果 */
.tag:hover {
  background: rgba(0, 255, 0, 0.2);
  border-color: #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
  transform: translateY(-2px);
  text-shadow: 0 0 8px #00ff00;
}

/* 阅读更多链接 */
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

/* 阅读更多箭头 */
.read-more::after {
  content: '→';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s ease;
}

/* 悬停时箭头移动 */
.read-more:hover::after {
  transform: translateY(-50%) translateX(5px);
}

/* 阅读更多悬停效果 */
.read-more:hover {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
  transform: skewX(2deg) translateX(5px);
}

/* 无结果提示 */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 1.2rem;
  text-shadow: 0 0 10px #00ff00;
}

/* 响应式设计：移动端适配 */
@media (max-width: 768px) {
  /* 缩小页面标题 */
  .page-title {
    font-size: 2rem;
    letter-spacing: 2px;
  }

  /* 缩小副标题 */
  .page-subtitle {
    font-size: 1rem;
    letter-spacing: 1px;
  }

  /* 文章卡片单列显示 */
  .posts-grid {
    grid-template-columns: 1fr;
  }

  /* 缩小文章标题 */
  .post-title {
    font-size: 1.1rem;
    letter-spacing: 0.5px;
  }
}
</style>
