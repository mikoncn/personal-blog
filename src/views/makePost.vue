<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'

const router = useRouter()

const formData = ref({
  title: '',
  category: '',
  summary: '',
  content: '',
  tags: ''
})

const submitting = ref(false)
const message = ref('')
const messageType = ref('')

async function handleSubmit() {
  console.log('⚙️ [神圣机械日志] 机魂注魔仪式启动...')
  submitting.value = true
  message.value = ''

  try {
    const tagsArray = formData.value.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    console.log('⚙️ [神圣机械日志] 正在查询圣典库中的最大编号...')
    const { data: existingPosts, error: queryError } = await supabase
      .from('posts')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    if (queryError) throw queryError

    let newId = 1
    if (existingPosts && existingPosts.length > 0) {
      const maxId = existingPosts[0].id
      newId = maxId + 1
    }

    console.log('⚙️ [神圣机械日志] 新圣典编号已确定:', newId)

    const postData = {
      id: newId,
      title: formData.value.title,
      category: formData.value.category,
      summary: formData.value.summary,
      content: formData.value.content,
      tags: tagsArray
    }

    console.log('⚙️ [神圣机械日志] 准备注入数据:', postData)

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()

    if (error) throw error

    console.log('✨ [神圣机械日志] 机魂大悦，数据已注入！')
    console.log('📖 [神圣机械日志] 新圣典已创建:', data[0])

    message.value = '机魂大悦，数据已注入'
    messageType.value = 'success'

    setTimeout(() => {
      router.push('/')
    }, 1500)

  } catch (error) {
    console.error('☠️ [异端警告] 注魔仪式失败！异端入侵！', error)
    message.value = '注魔失败：' + error.message
    messageType.value = 'error'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="make-post-page">
    <div class="back-button-container">
      <router-link to="/" class="back-button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="#00ff00" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 19L5 12L12 5" stroke="#00ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-button-text">返回主页</span>
      </router-link>
    </div>

    <section class="page-header">
      <h1 class="page-title">
        <span class="title-text">神圣注魔仪式</span>
        <span class="title-glow"></span>
      </h1>
      <p class="page-subtitle">将你的智慧注入机械神殿</p>
    </section>

    <section class="form-section">
      <form @submit.prevent="handleSubmit" class="sacred-form">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">⚔️</span>
            标题
          </label>
          <input 
            v-model="formData.title" 
            type="text" 
            class="form-input" 
            placeholder="输入圣典标题..."
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📜</span>
            分类
          </label>
          <input 
            v-model="formData.category" 
            type="text" 
            class="form-input" 
            placeholder="输入分类（如：技术、教程、思考）..."
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📝</span>
            摘要
          </label>
          <textarea 
            v-model="formData.summary" 
            class="form-input form-textarea" 
            placeholder="简要描述圣典内容..."
            rows="3"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📖</span>
            正文
          </label>
          <textarea 
            v-model="formData.content" 
            class="form-input form-textarea" 
            placeholder="输入圣典正文内容..."
            rows="15"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🏷️</span>
            标签
          </label>
          <input 
            v-model="formData.tags" 
            type="text" 
            class="form-input" 
            placeholder="输入标签，用逗号分隔（如：Vue3, Supabase, Web3）..."
          />
          <p class="form-hint">多个标签请用逗号分隔</p>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="submitting"
          >
            <span v-if="!submitting">⚡ 注魔仪式</span>
            <span v-else>⚙️ 注魔中...</span>
          </button>
        </div>

        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.make-post-page {
  min-height: 100vh;
  padding: 40px 20px;
  position: relative;
  background: linear-gradient(135deg, rgba(0, 20, 0, 0.95) 0%, rgba(0, 40, 0, 0.9) 100%);
}

.back-button-container {
  margin-bottom: 40px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  color: #00ff00;
  text-decoration: none;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.4);
  transform: translateX(-5px);
}

.back-button:hover svg {
  stroke: #000;
}

.back-button-text {
  position: relative;
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

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

.title-text {
  position: relative;
  z-index: 2;
  color: #00ff00;
  text-shadow: 
    0 0 10px #00ff00,
    0 0 20px #00ff00,
    0 0 40px #00ff00,
    0 0 80px #00ff00;
}

.title-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(0, 255, 0, 0.3) 0%, transparent 70%);
  z-index: 1;
  filter: blur(20px);
  animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(0, 255, 0, 0.7);
  font-family: 'Rajdhani', sans-serif;
  letter-spacing: 2px;
  margin-top: 10px;
}

.form-section {
  max-width: 800px;
  margin: 0 auto;
}

.sacred-form {
  background: rgba(0, 20, 0, 0.8);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 10px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.1);
}

.form-group {
  margin-bottom: 30px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.label-icon {
  font-size: 18px;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  background: rgba(0, 40, 0, 0.6);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 5px;
  color: #00ff00;
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input::placeholder {
  color: rgba(0, 255, 0, 0.4);
}

.form-input:focus {
  border-color: #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  background: rgba(0, 40, 0, 0.8);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.form-hint {
  font-size: 12px;
  color: rgba(0, 255, 0, 0.5);
  margin-top: 5px;
  font-family: 'Rajdhani', sans-serif;
}

.form-actions {
  margin-top: 40px;
}

.submit-btn {
  width: 100%;
  padding: 18px 40px;
  background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 255, 0, 0.1) 100%);
  border: 2px solid #00ff00;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 255, 0, 0.3) 0%, rgba(0, 255, 0, 0.2) 100%);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
  transform: translateY(-2px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  margin-top: 20px;
  padding: 15px 20px;
  border-radius: 5px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  text-align: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background: rgba(0, 255, 0, 0.2);
  border: 2px solid #00ff00;
  color: #00ff00;
}

.message.error {
  background: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff0000;
  color: #ff0000;
}
</style>
