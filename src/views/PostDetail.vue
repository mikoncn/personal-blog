<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { getPostById } from '../services/postService'
import { supabase } from '../utils/supabase'
import { formatDate } from '../utils/dateFormatter'
import { renderMarkdown } from '../utils/markdown'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const router = useRouter()
const props = defineProps(['id'])
const currentUser = inject('currentUser')

const post = ref(null)
const loading = ref(true)
const error = ref(null)
const deleting = ref(false)
const isLoggedIn = ref(false)

const formattedContent = ref('')

async function handleDelete() {
  if (!currentUser.value) {
    alert('请先登录以执行此操作')
    return
  }
  
  if (!confirm('⚠️ 确认要销毁这篇圣典吗？此操作不可逆！')) {
    return
  }

  deleting.value = true
  try {
    console.log('☠️ [异端审判] 准备销毁圣典，ID:', post.value.id)
    
    const filesToDelete = []
    
    if (post.value.image_url) {
      if (post.value.image_url.cover) {
        const fileName = post.value.image_url.cover.split('/').pop()
        filesToDelete.push(fileName)
        console.log('⚙️ [神圣机械日志] 准备删除封面图:', fileName)
      }
      
      if (post.value.image_url.images && Array.isArray(post.value.image_url.images)) {
        post.value.image_url.images.forEach(url => {
          const fileName = url.split('/').pop()
          filesToDelete.push(fileName)
          console.log('⚙️ [神圣机械日志] 准备删除图片:', fileName)
        })
      }
    }
    
    if (filesToDelete.length > 0) {
      console.log('⚙️ [神圣机械日志] 开始删除存储中的图片，共', filesToDelete.length, '张')
      const { error: storageError } = await supabase.storage
        .from('post-images')
        .remove(filesToDelete)
      
      if (storageError) {
        console.error('☠️ [异端警告] 删除图片失败！', storageError)
        throw storageError
      }
      console.log('✨ [神圣机械日志] 图片删除成功')
    }
    
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.value.id)

    if (deleteError) {
      console.error('☠️ [异端警告] 销毁圣典失败！', deleteError)
      throw deleteError
    }

    console.log('✨ [神圣机械日志] 圣典已成功销毁！')
    alert('✨ 机魂大悦，圣典已销毁！')
    router.push('/')
  } catch (err) {
    console.error('☠️ [异端警告] 销毁圣典失败！', err)
    alert('☠️ 销毁失败：' + err.message)
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  const postId = parseInt(props.id)
  console.log('⚔️ [帝国防卫军日志] 战术小队已部署，圣典 ID:', postId, '类型:', typeof postId)
  
  const { data: { user } } = await supabase.auth.getUser()
  isLoggedIn.value = !!user
  
  try {
    console.log('⚔️ [帝国防卫军日志] 开始检索圣典数据...')
    const foundPost = await getPostById(postId)
    if (foundPost) {
      post.value = foundPost
      formattedContent.value = renderMarkdown(foundPost.content)
      console.log('⚔️ [帝国防卫军日志] 圣典装载成功，标题:', foundPost.title)
    } else {
      error.value = '圣典未找到或已被异端摧毁'
      console.error('☠️ [异端警告] 圣典检索失败，ID:', postId)
    }
  } catch (err) {
    error.value = err.message
    console.error('☠️ [异端警告] 圣典装载失败！', err)
  } finally {
    loading.value = false
    console.log('⚔️ [帝国防卫军日志] 装载程序结束，战斗准备就绪')
  }

  setTimeout(() => {
    console.log('🎨 [颜色调试] 开始检查代码块样式...')
    const codeBlocks = document.querySelectorAll('.markdown-content pre code')
    console.log(`📦 [颜色调试] 找到 ${codeBlocks.length} 个代码块`)
    
    const allClasses = new Set()
    const classColors = new Map()
    
    codeBlocks.forEach((codeBlock, index) => {
      const spans = codeBlock.querySelectorAll('span')
      console.log(`📦 [颜色调试] 代码块 ${index + 1}: 找到 ${spans.length} 个 span 元素`)
      
      spans.forEach(span => {
        const classes = span.className.split(' ').filter(c => c)
        classes.forEach(cls => {
          allClasses.add(cls)
          const computedStyle = window.getComputedStyle(span)
          const color = computedStyle.color
          if (!classColors.has(cls)) {
            classColors.set(cls, color)
          }
        })
      })
    })
    
    console.log('\n🎨 [颜色调试] 所有检测到的类名和颜色:')
    const sortedClasses = Array.from(allClasses).sort()
    sortedClasses.forEach(cls => {
      const color = classColors.get(cls)
      console.log(`   .${cls} → ${color}`)
    })
    
    console.log(`\n📊 [颜色调试] 统计: 总类名数 ${allClasses.size}, 总代码块数 ${codeBlocks.length}`)
    
    console.log('\n⚠️ [颜色调试] 检查可能的颜色问题:')
    sortedClasses.forEach(cls => {
      const color = classColors.get(cls)
      if (color === 'rgb(171, 178, 191)' || color === '#abb2bf') {
        console.log(`   ⚠️ .${cls} 使用了默认灰色 (${color})`)
      }
    })
  }, 500)
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
        <!-- 返回按钮、删除按钮和修改按钮 -->
        <div class="action-buttons">
          <router-link to="/" class="back-button">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="#00ff00" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 19L5 12L12 5" stroke="#00ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="back-button-text">返回主页</span>
          </router-link>
          <div v-if="isLoggedIn" class="right-buttons">
            <button @click="handleDelete" class="delete-button" :disabled="deleting">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="#ff3333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="#ff3333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6" stroke="#ff3333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 11V17" stroke="#ff3333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11V17" stroke="#ff3333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="delete-button-text">{{ deleting ? '删除中...' : '删除文章' }}</span>
            </button>
            <router-link :to="`/edit-post/${post.id}`" class="edit-button">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="edit-button-text">修改文章</span>
            </router-link>
          </div>
        </div>
        
        <!-- 文章头部信息：分类和日期 -->
        <div class="post-header">
          <span class="post-category">{{ post.category }}</span>
          <span class="post-date">{{ formatDate(post.created_at) }}</span>
        </div>
        
        <!-- 封面图 -->
        <div v-if="post.image_url && post.image_url.cover" class="post-cover">
          <img :src="post.image_url.cover" :alt="post.title" class="cover-image" />
        </div>
        
        <!-- 文章标题 -->
        <h1 class="post-title">{{ post.title }}</h1>
        
        <!-- 图片画廊 -->
        <div v-if="post.image_url && post.image_url.images && post.image_url.images.length > 0" class="post-images">
          <div class="image-grid">
            <img 
              v-for="(url, index) in post.image_url.images" 
              :key="index" 
              :src="url" 
              :alt="`Image ${index + 1}`"
              class="post-image"
              loading="lazy"
            />
          </div>
        </div>
        
        <!-- 文章正文内容（HTML格式） -->
        <div class="post-body markdown-content" v-html="formattedContent"></div>
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

/* 返回按钮和修改按钮容器 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

/* 右侧按钮容器：删除和修改按钮 */
.right-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
}

/* 删除按钮样式：红色警告风格 */
.delete-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  background-color: #0a0a0a;
  border: 2px solid #ff3333;
  color: #ff3333;
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
  text-shadow: 0 0 5px rgba(255, 51, 51, 0.5);
  transform: skewX(-3deg);
  cursor: pointer;
}

/* 删除按钮扫描效果 */
.delete-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 51, 51, 0.4), transparent);
  transition: left 0.5s ease;
}

/* 悬停时扫描线移动 */
.delete-button:hover::before {
  left: 100%;
}

/* 删除按钮悬停效果：增强发光 */
.delete-button:hover:not(:disabled) {
  background-color: #ff3333;
  color: #0a0a0a;
  box-shadow: 0 0 30px #ff3333;
  transform: skewX(-3deg) scale(1.05);
}

/* 删除按钮禁用状态 */
.delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-button-text {
  font-weight: 600;
}

.delete-button svg {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.delete-button:hover:not(:disabled) svg {
  transform: scale(1.1);
}

.delete-button:hover:not(:disabled) svg path {
  stroke: #0a0a0a;
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

/* 修改按钮样式：与返回按钮对称 */
.edit-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  background-color: #0a0a0a;
  border: 2px solid #00ffff;
  color: #00ffff;
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
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  transform: skewX(-3deg);
}

/* 修改按钮扫描效果 */
.edit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

/* 悬停时扫描线移动 */
.edit-button:hover::before {
  left: 100%;
}

/* 修改按钮悬停效果：增强发光 */
.edit-button:hover {
  background-color: #00ffff;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ffff;
  transform: skewX(-3deg) scale(1.05);
}

/* 修改按钮文字 */
.edit-button-text {
  font-weight: 600;
}

/* 修改按钮 SVG 图标 */
.edit-button svg {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

/* 悬停时图标移动并变黑 */
.edit-button:hover svg path {
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

/* 封面图容器 */
.post-cover {
  margin-bottom: 40px;
  border: 3px solid rgba(0, 255, 0, 0.5);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
  position: relative;
}

/* 封面图样式 */
.cover-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  min-height: 400px;
  transition: all 0.3s ease;
}

/* 封面图悬停效果 */
.cover-image:hover {
  transform: scale(1.02);
  box-shadow: 0 0 40px rgba(0, 255, 0, 0.5);
}

/* 文章正文样式 */
.post-body {
  color: #cccccc;
  font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

/* 图片画廊容器 */
.post-images {
  margin: 30px 0;
  padding: 20px;
  background: rgba(0, 20, 0, 0.5);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.1);
}

/* 图片网格布局 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* 单张图片样式 */
.post-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 2px solid rgba(0, 255, 0, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
  object-fit: cover;
}

/* 图片悬停效果 */
.post-image:hover {
  border-color: #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
  transform: scale(1.02);
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

  /* 图片画廊移动端适配 */
  .post-images {
    padding: 15px;
    margin: 20px 0;
  }

  .image-grid {
    grid-template-columns: 1fr;
    gap: 15px;
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
