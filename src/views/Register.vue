<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'

const router = useRouter()

const formData = ref({
  nickname: '',
  password: '',
  confirmPassword: '',
  email: ''
})

const loading = ref(false)
const message = ref('')
const messageType = ref('')

async function handleRegister() {
  loading.value = true
  message.value = ''

  try {
    if (!formData.value.nickname || formData.value.nickname.trim() === '') {
      message.value = '昵称不能为空'
      messageType.value = 'error'
      loading.value = false
      return
    }

    if (formData.value.password !== formData.value.confirmPassword) {
      message.value = '两次输入的密码不一致'
      messageType.value = 'error'
      loading.value = false
      return
    }

    console.log('⚙️ [注册系统] 正在创建新用户...')
    console.log('📧 [注册系统] 邮箱:', formData.value.email)
    console.log('👤 [注册系统] 昵称:', formData.value.nickname)

    const { data, error } = await supabase.auth.signUp({
      email: formData.value.email,
      password: formData.value.password,
      options: {
        data: {
          display_name: formData.value.nickname
        }
      }
    })

    console.log('⚙️ [注册系统] 响应数据:', data)
    console.log('⚙️ [注册系统] 错误信息:', error)

    if (error) {
      console.log('☠️ [注册系统] 注册失败', error)
      console.log('☠️ [注册系统] 错误详情:', JSON.stringify(error, null, 2))
      
      let errorMessage = '注册失败'
      
      if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
        errorMessage = '该邮箱已被注册，请直接登录或使用其他邮箱'
      } else if (error.message.includes('Invalid email')) {
        errorMessage = '邮箱格式不正确'
      } else if (error.message.includes('Password should be')) {
        errorMessage = '密码长度至少需要6位'
      } else {
        errorMessage = error.message || '注册失败'
      }
      
      message.value = errorMessage
      messageType.value = 'error'
    } else if (data && data.user) {
      console.log('✨ [注册系统] 用户创建成功')
      console.log('取得用户ID:', data.user.id)
      console.log('取得用户Email:', data.user.email)
      console.log('取得用户昵称:', formData.value.nickname)
      console.log('用户邮箱确认状态:', data.user.email_confirmed_at)
      console.log('用户创建时间:', data.user.created_at)
      console.log('用户身份信息:', data.user.identities)
      
      if (data.user.identities && data.user.identities.length === 0) {
        console.log('⚠️ [注册系统] 该邮箱已注册')
        message.value = '该邮箱已被注册，请直接登录或使用其他邮箱'
        messageType.value = 'error'
      } else {
        if (data.session) {
          message.value = '注册成功！正在跳转到登录页面...'
          messageType.value = 'success'
          
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          message.value = '注册成功！请查收确认邮件后登录'
          messageType.value = 'success'
          
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
      }
    } else {
      console.log('⚠️ [注册系统] 注册未完成，可能邮箱已存在')
      message.value = '该邮箱已被注册，请直接登录或使用其他邮箱'
      messageType.value = 'error'
    }
  } catch (error) {
    console.error('☠️ [注册系统] 系统异常！', error)
    message.value = '系统异常：' + error.message
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
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
        <span class="title-text">创建新账户</span>
        <span class="title-glow"></span>
      </h1>
      <p class="page-subtitle">输入信息以创建新的系统账户</p>
    </section>

    <section class="form-section">
      <form @submit.prevent="handleRegister" class="sacred-form">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">👤</span>
            昵称
          </label>
          <input 
            v-model="formData.nickname" 
            type="text" 
            class="form-input" 
            placeholder="输入昵称..."
            required
          />
        </div>

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
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🔒</span>
            确认密码
          </label>
          <input 
            v-model="formData.confirmPassword" 
            type="password" 
            class="form-input" 
            placeholder="再次输入密码..."
            required
            minlength="6"
          />
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="loading"
          >
            <span v-if="!loading">⚡ 创建账户</span>
            <span v-else>⚙️ 创建中...</span>
          </button>
        </div>

        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <div class="login-link">
          <router-link to="/login" class="link-text">
            已有账号？立即登录
          </router-link>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.register-page {
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

.login-link {
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