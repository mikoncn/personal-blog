<template>
  <div class="all-posts-page">
    <!-- 返回主页按钮 -->
    <div class="back-button-container">
      <router-link to="/" class="back-button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="#00ff00" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 19L5 12L12 5" stroke="#00ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-button-text">返回主页</span>
      </router-link>
    </div>

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
            @keyup.enter="performSearch"
          />
          <button class="search-btn" @click="performSearch">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="#00ff00" stroke-width="2"/>
              <line x1="17" y1="17" x2="22" y2="22" stroke="#00ff00" stroke-width="2" stroke-linecap="round"/>
              <circle cx="11" cy="11" r="6" stroke="#00ff00" stroke-width="0.5" opacity="0.5"/>
            </svg>
            <span class="search-btn-text">搜索</span>
          </button>
        </div>
        
        <!-- 标签筛选 -->
        <div class="tag-filter">
          <button 
            v-for="tag in visibleTags" 
            :key="tag"
            :class="['tag-filter-btn', { active: selectedTag === tag }]"
            @click="selectedTag = tag"
          >
            {{ tag === 'All' ? 'ALL' : tag }}
          </button>
          <button 
            v-if="allTags.length > 5 && !showAllTags"
            class="tag-filter-btn more-tags-btn"
            @click="showAllTags = true"
          >
            更多标签
          </button>
          <button 
            v-if="showAllTags"
            class="tag-filter-btn more-tags-btn"
            @click="showAllTags = false"
          >
            收起
          </button>
        </div>
      </div>

      <!-- 文章卡片网格 -->
      <div v-if="loading" class="loading">
        <div class="loading-text">LOADING...</div>
      </div>
      
      <div v-else-if="error" class="error">
        <div class="error-text">加载失败: {{ error }}</div>
      </div>
      
      <div v-else class="posts-grid">
        <div 
          v-for="post in paginatedPosts" 
          :key="post.id" 
          class="post-card"
          @click="goToPost(post.id)"
        >
          <!-- 文章头部：分类和日期 -->
          <div class="post-header">
            <span class="post-category">{{ post.category }}</span>
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
          </div>
          <!-- 文章标题 -->
          <h4 class="post-title">{{ post.title }}</h4>
          <!-- 文章摘要 -->
          <p class="post-excerpt">{{ post.summary }}</p>
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

      <!-- 分页导航 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="pagination-btn prev-btn" 
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          ← 上一页
        </button>
        
        <div class="pagination-numbers">
          <button 
            v-for="page in totalPages" 
            :key="page"
            :class="['pagination-number', { active: page === currentPage }]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="pagination-btn next-btn" 
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          下一页 →
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
// 导入Vue核心功能：响应式引用和计算属性
import { ref, computed, watch, onMounted } from 'vue'
// 导入Vue Router用于页面导航
import { useRouter } from 'vue-router'
// 导入数据服务
import { getAllPosts, getAllTags } from '../services/postService'
import { formatDate } from '../utils/dateFormatter'

// 初始化路由实例
const router = useRouter()
// 存储所有文章数据
const posts = ref([])
// 搜索输入框的关键词
const searchQuery = ref('')
// 实际用于搜索的关键词
const activeSearchQuery = ref('')
// 当前选中的分类
const selectedCategory = ref('All')
// 当前页码
const currentPage = ref(1)
// 每页显示的文章数量
const itemsPerPage = 9
// 加载状态
const loading = ref(true)
// 错误信息
const error = ref(null)

// 所有可用的分类选项
const allTags = ref([])
const selectedTag = ref('All')
const showAllTags = ref(false)

const visibleTags = computed(() => {
  if (showAllTags.value) {
    return ['All', ...allTags.value]
  }
  return ['All', ...allTags.value.slice(0, 5)]
})

// 计算属性：根据搜索关键词和分类筛选文章
const filteredPosts = computed(() => {
  let result = posts.value
  
  if (selectedTag.value !== 'All') {
    result = result.filter(post => 
      post.tags && post.tags.includes(selectedTag.value)
    )
  }
  
  if (activeSearchQuery.value.trim()) {
    const query = activeSearchQuery.value.toLowerCase()
    result = result.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.summary.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }
  
  return result
})

// 计算属性：总页数
const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / itemsPerPage)
})

// 计算属性：当前页显示的文章
const paginatedPosts = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredPosts.value.slice(startIndex, endIndex)
})

// 监听分类变化，重置到第一页
watch(selectedTag, () => {
  console.log('⚔️ [帝国防卫军日志] 战术标签切换:', selectedTag.value)
  currentPage.value = 1
  console.log('⚔️ [帝国防卫军日志] 战术坐标重置为 1')
})

// 执行搜索
function performSearch() {
  console.log('⚔️ [帝国防卫军日志] 发起神圣搜寻，关键词:', searchQuery.value)
  activeSearchQuery.value = searchQuery.value
  currentPage.value = 1
  console.log('⚔️ [帝国防卫军日志] 搜寻完成，发现', filteredPosts.value.length, '个目标')
}

// 跳转到文章详情页
function goToPost(id) {
  console.log('⚔️ [帝国防卫军日志] 战术小队准备跃迁，目标圣典 ID:', id)
  router.push(`/post/${id}`)
}

// 切换到指定页码
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    console.log('⚔️ [帝国防卫军日志] 战术小队跃迁至第', page, '扇区')
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    console.log('⚔️ [帝国防卫军日志] 战术小队撤退至上一扇区，当前扇区:', currentPage.value)
    goToPage(currentPage.value - 1)
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    console.log('⚔️ [帝国防卫军日志] 战术小队推进至下一扇区，当前扇区:', currentPage.value)
    goToPage(currentPage.value + 1)
  }
}

// 加载数据
onMounted(async () => {
  console.log('⚔️ [帝国防卫军日志] 战术小队已部署，开始加载数据...')
  try {
    console.log('⚔️ [帝国防卫军日志] 并行请求圣典目录和标签目录...')
    const [postsData, tagsData] = await Promise.all([
      getAllPosts(),
      getAllTags()
    ])
    posts.value = postsData
    allTags.value = tagsData
    console.log('⚔️ [帝国防卫军日志] 数据装载完成，圣典数:', posts.value.length, '标签数:', allTags.value.length)
    console.log('⚔️ [帝国防卫军日志] 标签目录:', allTags.value)
  } catch (err) {
    error.value = err.message
    console.error('☠️ [异端警告] 数据装载失败！', err)
  } finally {
    loading.value = false
    console.log('⚔️ [帝国防卫军日志] 装载程序结束，战斗准备就绪')
  }
})
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

/* 返回按钮容器 */
.back-button-container {
  max-width: 1400px;
  margin: 0 auto 20px auto;
  padding: 0 20px;
}

/* 返回按钮样式 */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
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
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
  white-space: nowrap;
}

/* 返回按钮扫描效果 */
.back-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

/* 悬停时扫描线移动 */
.back-button:hover::before {
  left: 100%;
}

/* 返回按钮悬停效果 */
.back-button:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.05);
}

/* 返回按钮文字 */
.back-button-text {
  font-weight: 600;
}

/* 返回按钮 SVG 图标 */
.back-button svg {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

/* 悬停时图标向左移动并变黑 */
.back-button:hover svg {
  transform: translateX(-3px);
}

.back-button:hover svg path {
  stroke: #0a0a0a;
}

/* 文章列表区域 */
.posts-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 筛选器容器：搜索框和分类标签 */
.filter-container {
  background: rgba(0, 0, 0, 0.95);
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
  display: flex;
  gap: 10px;
}

/* 搜索输入框样式 */
.search-input {
  flex: 1;
  padding: 15px 20px;
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

/* 搜索按钮样式 */
.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 15px 40px;
  background-color: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  font-size: 1rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
}

/* 搜索按钮扫描效果 */
.search-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

/* 悬停时扫描线移动 */
.search-btn:hover::before {
  left: 100%;
}

/* 搜索按钮悬停效果 */
.search-btn:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.05);
}

/* 搜索按钮文字 */
.search-btn-text {
  font-weight: 600;
}

/* 搜索按钮 SVG 图标 */
.search-btn svg {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

/* 悬停时搜索图标变黑 */
.search-btn:hover svg circle,
.search-btn:hover svg line {
  stroke: #0a0a0a;
}

/* 标签筛选容器 */
.tag-filter {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 255, 0, 0.3);
}

/* 标签筛选按钮样式 */
.tag-filter-btn {
  padding: 15px 40px;
  background-color: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  font-size: 1.1rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
}

/* 标签筛选按钮扫描效果 */
.tag-filter-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

/* 悬停时扫描线移动 */
.tag-filter-btn:hover::before {
  left: 100%;
}

/* 标签筛选按钮悬停效果 */
.tag-filter-btn:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.1);
}

/* 激活的标签筛选按钮样式 */
.tag-filter-btn.active {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  text-shadow: none;
  transform: skewX(-3deg) scale(1.1);
}

/* 更多标签按钮样式 */
.more-tags-btn {
  border-color: #00ffff !important;
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5) !important;
}

/* 更多标签按钮悬停效果 */
.more-tags-btn:hover {
  background-color: #00ffff !important;
  color: #0a0a0a !important;
  box-shadow: 0 0 30px #00ffff !important;
  text-shadow: none !important;
}

/* 更多标签按钮激活效果 */
.more-tags-btn.active {
  background-color: #00ffff !important;
  color: #0a0a0a !important;
  box-shadow: 0 0 30px #00ffff !important;
  text-shadow: none !important;
}

/* 文章卡片网格布局 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

/* 文章卡片样式 */
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

/* 标签扫描效果 */
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
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 20px #00ff00;
  transform: translateY(-2px) scale(1.05);
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
  /* 所有文章页面主容器移动端样式 */
  .all-posts-page {
    padding: 20px 15px;
  }

  /* 返回按钮容器移动端样式 */
  .back-button-container {
    padding: 0;
  }

  /* 返回按钮移动端样式 */
  .back-button {
    padding: 12px 20px;
    font-size: 0.9rem;
    letter-spacing: 1px;
    justify-content: center;
  }

  .back-button svg {
    width: 18px;
    height: 18px;
  }

  /* 文章列表区域移动端样式 */
  .posts-section {
    padding: 0;
  }

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

  /* 移动端分类标签按钮 */
  .tab-button {
    padding: 8px 20px;
    font-size: 0.85rem;
    letter-spacing: 1px;
  }

  /* 移动端搜索框 */
  .search-box {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
    padding: 10px 15px;
    font-size: 0.9rem;
  }

  .search-btn {
    width: 100%;
    padding: 10px 20px;
    font-size: 0.9rem;
    justify-content: center;
  }
}

/* 分页导航容器 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 50px;
  padding: 30px 20px;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #00ff00;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}

/* 分页按钮样式 */
.pagination-btn {
  padding: 15px 40px;
  background-color: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  font-size: 1.1rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
}

/* 分页按钮扫描效果 */
.pagination-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

.pagination-btn:hover::before {
  left: 100%;
}

/* 分页按钮悬停效果 */
.pagination-btn:hover:not(:disabled) {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.1);
}

/* 禁用状态的分页按钮 */
.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: #333;
  color: #666;
  text-shadow: none;
  transform: skewX(-3deg);
}

/* 页码数字容器 */
.pagination-numbers {
  display: flex;
  gap: 8px;
}

/* 单个页码按钮样式 */
.pagination-number {
  width: 60px;
  height: 60px;
  background-color: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  font-size: 1.1rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
}

/* 页码按钮扫描效果 */
.pagination-number::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

.pagination-number:hover::before {
  left: 100%;
}

/* 页码按钮悬停效果 */
.pagination-number:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.1);
}

/* 激活状态的页码按钮 */
.pagination-number.active {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  text-shadow: none;
  transform: skewX(-3deg) scale(1.1);
}

/* 移动端分页适配 */
@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }

  .pagination-numbers {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-number {
    width: 45px;
    height: 45px;
    font-size: 0.9rem;
  }

  .pagination-btn {
    padding: 10px 25px;
    font-size: 0.9rem;
  }
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

.error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-text {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 1.2rem;
  color: #ff0000;
  text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
  text-align: center;
}
</style>
