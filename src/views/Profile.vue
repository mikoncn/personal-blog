<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../utils/supabase'
import WalletConnect from '../components/WalletConnect.vue'

const formData = ref({
  display_name: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const message = ref('')
const messageType = ref('')
const currentUser = ref(null)
const showPasswordForm = ref(false)

onMounted(async () => {
  await loadUserData()
})

async function loadUserData() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    
    if (user) {
      currentUser.value = user
      formData.value.display_name = user.user_metadata?.display_name || ''
      console.log('✨ [个人中心] 用户数据加载成功', {
        email: user.email,
        display_name: user.user_metadata?.display_name
      })
    }
  } catch (error) {
    console.error('☠️ [个人中心] 加载用户数据失败', error)
    message.value = '加载用户数据失败'
    messageType.value = 'error'
  }
}

async function handleUpdateProfile() {
  loading.value = true
  message.value = ''

  try {
    if (!formData.value.display_name || formData.value.display_name.trim() === '') {
      message.value = '昵称不能为空'
      messageType.value = 'error'
      loading.value = false
      return
    }

    console.log('⚙️ [个人中心] 正在更新用户信息...')
    console.log('👤 [个人中心] 新昵称:', formData.value.display_name)

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: formData.value.display_name
      }
    })

    if (error) throw error

    console.log('✨ [个人中心] 用户信息更新成功')
    message.value = '个人信息更新成功！'
    messageType.value = 'success'
    
    await loadUserData()
  } catch (error) {
    console.error('☠️ [个人中心] 更新失败', error)
    message.value = '更新失败：' + error.message
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function handleChangePassword() {
  loading.value = true
  message.value = ''

  try {
    if (!formData.value.currentPassword) {
      message.value = '请输入当前密码'
      messageType.value = 'error'
      loading.value = false
      return
    }

    if (!formData.value.newPassword || formData.value.newPassword.length < 6) {
      message.value = '新密码长度至少需要6位'
      messageType.value = 'error'
      loading.value = false
      return
    }

    if (formData.value.newPassword !== formData.value.confirmPassword) {
      message.value = '两次输入的新密码不一致'
      messageType.value = 'error'
      loading.value = false
      return
    }

    console.log('⚙️ [个人中心] 正在验证当前密码...')

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('获取用户信息失败')
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: formData.value.currentPassword
    })

    if (signInError) {
      console.error('☠️ [个人中心] 当前密码验证失败', signInError)
      message.value = '当前密码错误，请重新输入'
      messageType.value = 'error'
      loading.value = false
      return
    }

    console.log('✅ [个人中心] 当前密码验证通过，正在更新新密码...')

    const { error } = await supabase.auth.updateUser({
      password: formData.value.newPassword
    })

    if (error) throw error

    console.log('✨ [个人中心] 密码更新成功')
    message.value = '密码更新成功！'
    messageType.value = 'success'
    
    formData.value.currentPassword = ''
    formData.value.newPassword = ''
    formData.value.confirmPassword = ''
  } catch (error) {
    console.error('☠️ [个人中心] 密码更新失败', error)
    message.value = '密码更新失败：' + error.message
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="profile-page">
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
        <span class="title-text">个人中心</span>
        <span class="title-glow"></span>
      </h1>
      <p class="page-subtitle">管理你的个人信息和账户设置</p>
    </section>

    <section class="profile-sections">
      <div class="profile-card">
        <h2 class="section-title">
          <span class="title-icon">👤</span>
          基本信息
        </h2>
        
        <form @submit.prevent="handleUpdateProfile" class="sacred-form">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📧</span>
              邮箱
            </label>
            <input 
              :value="currentUser?.email || ''"
              type="email" 
              class="form-input" 
              disabled
            />
            <span class="input-hint">邮箱不可修改</span>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🏷️</span>
              昵称
            </label>
            <input 
              v-model="formData.display_name" 
              type="text" 
              class="form-input" 
              placeholder="输入昵称..."
              required
            />
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="loading"
            >
              <span v-if="!loading">⚡ 更新昵称</span>
              <span v-else>⚙️ 更新中...</span>
            </button>
          </div>
        </form>
      </div>

      <div class="profile-card">
        <h2 class="section-title">
          <span class="title-icon">🔒</span>
          修改密码
        </h2>
        
        <div v-if="!showPasswordForm" class="password-toggle">
          <button 
            @click="showPasswordForm = true"
            class="toggle-password-btn"
          >
            <span>🔐 修改密码</span>
          </button>
        </div>
        
        <form v-else @submit.prevent="handleChangePassword" class="sacred-form">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔑</span>
              当前密码
            </label>
            <input 
              v-model="formData.currentPassword" 
              type="password" 
              class="form-input" 
              placeholder="输入当前密码..."
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔐</span>
              新密码
            </label>
            <input 
              v-model="formData.newPassword" 
              type="password" 
              class="form-input" 
              placeholder="输入新密码..."
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔓</span>
              确认新密码
            </label>
            <input 
              v-model="formData.confirmPassword" 
              type="password" 
              class="form-input" 
              placeholder="再次输入新密码..."
              required
              minlength="6"
            />
          </div>

          <div class="form-actions">
            <button 
              type="button"
              @click="showPasswordForm = false"
              class="cancel-btn"
            >
              <span>❌ 取消</span>
            </button>
            <button 
              type="submit" 
              class="submit-btn password-btn"
              :disabled="loading"
            >
              <span v-if="!loading">⚡ 更新密码</span>
              <span v-else>⚙️ 更新中...</span>
            </button>
          </div>
        </form>
      </div>

      <div class="profile-card">
        <h2 class="section-title">
          <span class="title-icon">🔗</span>
          Web3 钱包
        </h2>
        
        <div class="wallet-section">
          <p class="wallet-description">连接您的 Web3 钱包以访问区块链功能</p>
          <WalletConnect />
        </div>
      </div>
    </section>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.profile-page {
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

.profile-sections {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.profile-card {
  background: rgba(20, 15, 0, 0.8);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 10px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.1);
}

.section-title {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 1.5rem;
  color: #00ff00;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(0, 255, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.title-icon {
  font-size: 1.8rem;
}

.sacred-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 25px;
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

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(0, 20, 0, 0.4);
}

.input-hint {
  display: block;
  font-size: 0.85rem;
  color: rgba(0, 255, 0, 0.5);
  margin-top: 5px;
  font-family: 'Rajdhani', sans-serif;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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

.wallet-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.wallet-description {
  color: #a0a0a0;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.95rem;
  text-align: center;
  margin-bottom: 10px;
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

.password-btn:hover {
  background-color: #ff9900;
  border-color: #ff9900;
  box-shadow: 0 0 30px #ff9900;
  color: #0a0a0a;
}

.toggle-password-btn {
  padding: 15px 50px;
  background-color: transparent;
  border: 2px solid #ff9900;
  color: #ff9900;
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
  text-shadow: 0 0 5px rgba(255, 153, 0, 0.5);
  transform: skewX(-3deg);
}

.toggle-password-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 153, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

.toggle-password-btn:hover::before {
  left: 100%;
}

.toggle-password-btn:hover {
  background-color: #ff9900;
  color: #0a0a0a;
  box-shadow: 0 0 30px #ff9900;
  transform: skewX(-3deg) scale(1.05);
  text-shadow: none;
}

.cancel-btn {
  padding: 15px 50px;
  background-color: transparent;
  border: 2px solid #ff0000;
  color: #ff0000;
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
  text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  transform: skewX(-3deg);
  margin-right: 15px;
}

.cancel-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

.cancel-btn:hover::before {
  left: 100%;
}

.cancel-btn:hover {
  background-color: #ff0000;
  color: #fff;
  box-shadow: 0 0 30px #ff0000;
  transform: skewX(-3deg) scale(1.05);
  text-shadow: none;
}

.message {
  margin-top: 40px;
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

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .profile-card {
    padding: 30px 20px;
  }
  
  .submit-btn {
    padding: 12px 30px;
    font-size: 1rem;
  }
}
</style>
