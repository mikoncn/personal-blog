<script setup>
// 导入Vue核心功能：响应式引用、生命周期钩子、计算属性
import { ref, onMounted, computed } from 'vue'
// 导入Vue Router用于页面导航
import { useRouter } from 'vue-router'
// 导入数据服务
import { getPostById } from '../services/postService'
// 导入日期格式化工具
import { formatDate } from '../utils/dateFormatter'
// 导入页面组件
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

// 初始化路由实例
const router = useRouter()
// 接收路由参数中的文章ID
const props = defineProps(['id'])

// 存储当前文章数据
const post = ref(null)
// 加载状态标记
const loading = ref(true)
// 错误信息
const error = ref(null)

// 计算属性：将Markdown格式的内容转换为HTML格式
// 支持标题（#、##、###）、粗体（**）、代码（`）和换行符
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

// 组件挂载时根据ID查找文章
onMounted(async () => {
  console.log('⚔️ [帝国防卫军日志] 战术小队已部署，圣典 ID:', props.id)
  try {
    console.log('⚔️ [帝国防卫军日志] 开始检索圣典数据...')
    const foundPost = await getPostById(props.id)
    if (foundPost) {
      post.value = foundPost
      console.log('⚔️ [帝国防卫军日志] 圣典装载成功，标题:', foundPost.title)
    } else {
      error.value = '圣典未找到或已被异端摧毁'
      console.error('☠️ [异端警告] 圣典检索失败，ID:', props.id)
    }
  } catch (err) {
    error.value = err.message
    console.error('☠️ [异端警告] 圣典装载失败！', err)
  } finally {
    loading.value = false
    console.log('⚔️ [帝国防卫军日志] 装载程序结束，战斗准备就绪')
  }
})
</script>

<template>
  <div class="post-detail">
    <!-- 网站头部导航 -->
    <Header />
    
    <div class="container">
      <!-- 加载状态显示 -->
      <div v-if="loading" class="loading">
        <div class="loading-text">LOADING...</div>
      </div>
      
      <!-- 错误状态显示 -->
      <div v-else-if="error" class="error">
        <div class="error-text">{{ error }}</div>
      </div>
      
      <!-- 文章内容显示 -->
      <div v-else-if="post" class="post-content">
        <!-- 返回按钮 -->
        <router-link to="/" class="back-button">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="#00ff00" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 19L5 12L12 5" stroke="#00ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="back-button-text">返回主页</span>
        </router-link>
        
        <!-- 文章头部信息：分类和日期 -->
        <div class="post-header">
          <span class="post-category">{{ post.category }}</span>
          <span class="post-date">{{ formatDate(post.created_at) }}</span>
        </div>
        
        <!-- 文章标题 -->
        <h1 class="post-title">{{ post.title }}</h1>
        
        <!-- 文章正文内容（HTML格式） -->
        <div class="post-body" v-html="formattedContent"></div>
      </div>
      
      <!-- 文章未找到状态 -->
      <div v-else class="not-found">
        <h2 class="not-found-title">404</h2>
        <p class="not-found-text">文章未找到</p>
        <button class="back-button" @click="goBack">返回首页</button>
      </div>
    </div>
    
    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<style scoped>
/* 文章详情页主容器：深绿色渐变背景 */
.post-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(0, 20, 0, 0.95), rgba(0, 40, 0, 0.95));
  position: relative;
  z-index: 1;
}

/* 内容容器：限制最大宽度并居中 */
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 加载状态容器：居中显示 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 加载文字样式：带脉冲动画的霓虹效果 */
.loading-text {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 1.5rem;
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 脉冲动画：透明度变化 */
@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 文章内容淡入动画 */
.post-content {
  animation: fadeIn 0.5s ease-in;
}

/* 淡入动画：从下往上移动并渐显 */
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

/* 返回按钮样式：赛博朋克风格 */
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
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
  margin-bottom: 30px;
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

/* 返回按钮悬停效果：增强发光和左移 */
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

/* 文章头部信息容器 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
}

/* 文章分类标签：洋红色霓虹效果 */
.post-category {
  color: #ff00ff;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 8px #ff00ff, 0 0 15px #ff00ff;
  font-weight: 600;
}

/* 文章日期：青色霓虹效果 */
.post-date {
  color: #00ffff;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff;
}

/* 文章标题：大号绿色霓虹效果 */
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

/* 文章正文样式 */
.post-body {
  color: #cccccc;
  font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  font-size: 1.1rem;
  line-height: 2;
  letter-spacing: 0.5px;
}

/* 一级标题样式 */
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

/* 二级标题样式 */
.post-body :deep(h2) {
  font-size: 1.6rem;
  color: #00ffff;
  margin: 35px 0 15px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* 三级标题样式 */
.post-body :deep(h3) {
  font-size: 1.3rem;
  color: #ff00ff;
  margin: 30px 0 12px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* 粗体文字样式 */
.post-body :deep(strong) {
  color: #00ff00;
  font-weight: 700;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

/* 行内代码样式 */
.post-body :deep(code) {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 2px 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  border-radius: 3px;
}

/* 换行符间距 */
.post-body :deep(br) {
  margin-bottom: 10px;
}

/* 404页面容器：居中显示 */
.not-found {
  text-align: center;
  padding: 100px 20px;
}

/* 404标题：超大号霓虹效果 */
.not-found-title {
  font-size: 6rem;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 900;
  text-shadow: 0 0 30px #00ff00, 0 0 60px #00ff00;
  margin-bottom: 20px;
}

/* 404说明文字 */
.not-found-text {
  font-size: 1.5rem;
  color: #cccccc;
  font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  margin-bottom: 40px;
}

/* 响应式设计：移动端适配 */
@media (max-width: 768px) {
  /* 返回按钮移动端样式 */
  .back-button {
    padding: 8px 20px;
    font-size: 0.85rem;
    letter-spacing: 1px;
  }

  .back-button svg {
    width: 16px;
    height: 16px;
  }

  /* 缩小文章标题 */
  .post-title {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }

  /* 缩小正文字号 */
  .post-body {
    font-size: 1rem;
  }

  /* 缩小各级标题 */
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

.error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-text {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 1.5rem;
  color: #ff0000;
  text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
  text-align: center;
}
</style>
