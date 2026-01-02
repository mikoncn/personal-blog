<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'
import { cleanupTemporaryImages } from '../services/cleanupService'

const router = useRouter()

const formData = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const message = ref('')
const messageType = ref('')

async function handleLogin() {
  loading.value = true
  message.value = ''

  try {
    console.log('⚙️ [登录系统] 正在验证身份...')
    console.log('⚙️ [登录系统] Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('⚙️ [登录系统] 邮箱:', formData.value.email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.value.email,
      password: formData.value.password
    })

    console.log('⚙️ [登录系统] 响应数据:', data)
    console.log('⚙️ [登录系统] 错误信息:', error)

    if (error) {
      console.log('☠️ [登录系统] 身份验证失败，访问被拒绝', error)
      
      let errorMessage = '身份验证失败，访问被拒绝'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = '账号或密码错误，请检查后重试'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '邮箱尚未确认，请先查收确认邮件'
      } else if (error.status === 400) {
        errorMessage = '请求参数错误，请检查输入'
      } else if (error.status === 422) {
        errorMessage = '账号或密码格式不正确'
      } else {
        errorMessage = error.message || '身份验证失败，访问被拒绝'
      }
      
      message.value = errorMessage
      messageType.value = 'error'
    } else {
      console.log('✨ [登录系统] 身份验证通过，访问权限已授予')
      console.log('取得用户ID:', data.user.id)
      console.log('取得用户Email:', data.user.email)
      
      message.value = '访问权限已授予'
      messageType.value = 'success'
      
      // 清理临时图片
      try {
        console.log('⚙️ [登录系统] 正在清理临时图片...')
        const cleanupResult = await cleanupTemporaryImages()
        if (cleanupResult.success) {
          console.log('✨ [登录系统] 临时图片清理完成，删除了', cleanupResult.deletedCount, '个文件')
        } else {
          console.warn('⚠️ [登录系统] 临时图片清理失败，但不影响登录', cleanupResult.error)
        }
      } catch (cleanupError) {
        console.warn('⚠️ [登录系统] 临时图片清理异常，但不影响登录', cleanupError)
      }
      
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  } catch (error) {
    console.error('☠️ [登录系统] 系统异常！', error)
    console.error('☠️ [登录系统] 错误堆栈:', error.stack)
    message.value = '系统异常：' + error.message
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
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
        <span class="title-text">系统访问验证</span>
        <span class="title-glow"></span>
      </h1>
      <p class="page-subtitle">输入凭证以获取系统访问权限</p>
    </section>

    <section class="form-section">
      <form @submit.prevent="handleLogin" class="sacred-form">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📧</span>
            邮箱
          </label>
          <input 
            v-model="formData.email" 
            type="email" 
            class="form-input" 
            placeholder="输入邮箱..."
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🔑</span>
            密码
          </label>
          <input 
            v-model="formData.password" 
            type="password" 
            class="form-input" 
            placeholder="输入密码..."
            required
          />
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="loading"
          >
            <span v-if="!loading">⚡ 验证身份</span>
            <span v-else>⚙️ 验证中...</span>
          </button>
        </div>

        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <div class="register-link">
          <router-link to="/register" class="link-text">
            还没有账号？立即注册
          </router-link>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.login-page {
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

.back-button:hover::before {
  left: 100%;
}

.back-button:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.05);
}

.back-button-text {
  font-weight: 600;
}

.back-button svg {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.back-button:hover svg {
  transform: translateX(-3px);
}

.back-button:hover svg path {
  stroke: #0a0a0a;
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
  max-width: 600px;
  margin: 0 auto;
}

.sacred-form {
  background: rgba(20, 15, 0, 0.8);
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

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.submit-btn {
  padding: 15px 50px;
  background-color: transparent;
  border: 2px solid #00ff00;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.05);
  text-shadow: none;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:disabled:hover {
  background-color: transparent;
  color: #00ff00;
  box-shadow: none;
  transform: skewX(-3deg);
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.message {
  margin-top: 20px;
  padding: 15px 20px;
  border-radius: 5px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
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
  background: rgba(0, 255, 0, 0.15);
  border: 1px solid #00ff00;
  color: #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
}

.message.error {
  background: rgba(255, 0, 0, 0.15);
  border: 1px solid #ff0000;
  color: #ff0000;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.2);
}

.register-link {
  margin-top: 20px;
  text-align: center;
}

.link-text {
  color: rgba(0, 255, 0, 0.7);
  text-decoration: none;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.link-text:hover {
  color: #00ff00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .sacred-form {
    padding: 30px 20px;
  }
  
  .submit-btn {
    padding: 12px 30px;
    font-size: 1rem;
  }
}
</style>
