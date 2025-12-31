<template>
  <header class="header cyber-matrix">
    <div v-if="isLoggedIn" class="user-section-top-left">
      <span class="user-info">{{ userEmail }}</span>
      <button @click="handleLogout" class="cyber-btn logout-btn" data-text="退出">
        <span class="btn-inner">退出</span>
      </button>
    </div>
    <div class="header-content">
      <div class="logo-box">
        <h1 class="glitch-title" data-text="MIKON_BLOG">MIKON_BLOG</h1>
        <div class="decoration-bar">
          <span class="jap-text">接続確立</span>
          <span class="id-code">SYS.ROOT.ACCESS</span>
        </div>
      </div>

      <nav class="nav cyber-nav">
        <router-link to="/" class="cyber-btn" data-text="首页">
          <span class="btn-inner">首页</span>
        </router-link>
        <router-link to="/posts" class="cyber-btn" data-text="文章">
          <span class="btn-inner">文章</span>
        </router-link>
        <router-link v-if="isLoggedIn" to="/make-post" class="cyber-btn" data-text="发布">
          <span class="btn-inner">发布</span>
        </router-link>
        <router-link v-if="!isLoggedIn" to="/login" class="cyber-btn" data-text="登录">
          <span class="btn-inner">登录</span>
        </router-link>
        <router-link to="/about" class="cyber-btn" data-text="关于">
          <span class="btn-inner">关于</span>
        </router-link>
      </nav>
    </div>

    <div class="scan-line"></div>
  </header>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'

const router = useRouter()
const currentUser = inject('currentUser')
const isLoggedIn = ref(false)
const userEmail = ref('')

onMounted(async () => {
  await checkUser()
})

async function checkUser() {
  console.log('🔍 [Header] 使用 getUser() 验证身份...')
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('☠️ [Header] 身份验证失败', error)
    isLoggedIn.value = false
    userEmail.value = ''
    return
  }
  
  if (user) {
    console.log('✅ [Header] 身份验证通过', {
      id: user.id,
      email: user.email
    })
    isLoggedIn.value = true
    userEmail.value = user.email
  } else {
    console.log('🚪 [Header] 未检测到有效身份')
    isLoggedIn.value = false
    userEmail.value = ''
  }
}

async function handleLogout() {
  console.log('🔓 [Header] 正在退出登录...')
  const { error } = await supabase.auth.signOut()
  if (!error) {
    isLoggedIn.value = false
    userEmail.value = ''
    router.push('/')
  }
}
</script>

<style scoped>
.cyber-matrix {
  /* === 黑绿配色系统 === */
  --matrix-green: #00ff00;      /* 主荧光绿 */
  --matrix-dark: #003300;       /* 深绿 */
  --matrix-pale: #ccffcc;       /* 惨白绿（用于高亮） */
  --matrix-bg-trans: rgba(0, 10, 0, 0.6); /* 半透明黑底 */
  
  position: relative;
  padding: 40px 0 30px;
  /* 背景改为半透明，让代码雨透过来 */
  background: var(--matrix-bg-trans);
  /* 增加一个模糊滤镜，让背后的代码雨在 Header 区域稍微模糊一点，提升文字可读性 */
  backdrop-filter: blur(2px); 
  margin-bottom: 40px;
  overflow: visible; /* 允许光效溢出 */
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* === Logo: 绿色故障核心 === */
.logo-box {
  position: relative;
  transform: skewX(-10deg);
}

.glitch-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 4rem;
  color: var(--matrix-green);
  margin: 0;
  line-height: 1;
  position: relative;
  /* 绿色发光文字阴影 */
  text-shadow: 0 0 10px var(--matrix-green);
}

/* 故障层 1 (深绿错位) */
.glitch-title::before {
  content: attr(data-text);
  position: absolute;
  left: -2px; top: -2px;
  width: 100%;
  color: var(--matrix-dark);
  background: transparent;
  overflow: hidden;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
  opacity: 0.8;
}

/* 故障层 2 (惨白绿错位) */
.glitch-title::after {
  content: attr(data-text);
  position: absolute;
  left: 2px; top: 2px;
  width: 100%;
  color: var(--matrix-pale);
  background: transparent;
  overflow: hidden;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  animation: glitch-anim-2 3.5s infinite linear alternate-reverse;
  mix-blend-mode: color-dodge;
}

/* 装饰小字 */
.decoration-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--matrix-green);
  border-top: 1px solid var(--matrix-green);
  padding-top: 2px;
  opacity: 0.8;
}

.jap-text { letter-spacing: 2px; }

/* === 导航: 绿色晶体切片 === */
.cyber-nav {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.cyber-btn {
  position: relative;
  text-decoration: none;
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--matrix-green);
  font-size: 1.1rem;
  padding: 15px 40px;
  
  background-color: transparent;
  border: 2px solid var(--matrix-green);
  
  transform: skewX(-3deg);
  transition: all 0.3s ease;
  overflow: hidden;
  letter-spacing: 3px;
  border-radius: 6px;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.cyber-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

.cyber-btn:hover::before {
  left: 100%;
}

.cyber-btn:hover {
  background-color: var(--matrix-green);
  color: #000;
  box-shadow: 0 0 30px var(--matrix-green);
  transform: skewX(-3deg) scale(1.05);
  text-shadow: none;
}

.cyber-btn.router-link-active {
  background-color: var(--matrix-green);
  color: #000;
  box-shadow: 0 0 30px var(--matrix-green);
  text-shadow: none;
  transform: skewX(-3deg) scale(1.05);
}

/* === 底部扫描线 === */
.scan-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--matrix-green);
  box-shadow: 0 0 10px var(--matrix-green);
}

/* 增加一个流动的光点 */
.scan-line::after {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 100px;
  height: 4px;
  background: #fff;
  opacity: 0.5;
  filter: blur(3px);
  animation: scan-move 4s infinite ease-in-out;
}

@keyframes scan-move {
  0% { left: -10%; }
  100% { left: 110%; }
}

/* === 故障动画 === */
@keyframes glitch-anim-1 {
  0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
  20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
  40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
  60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
  80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
  100% { clip-path: inset(30% 0 20% 0); transform: translate(1px, -1px); }
}

@keyframes glitch-anim-2 {
  0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
  20% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 2px); }
  40% { clip-path: inset(30% 0 20% 0); transform: translate(2px, 1px); }
  60% { clip-path: inset(10% 0 80% 0); transform: translate(-1px, -2px); }
  80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, 2px); }
  100% { clip-path: inset(20% 0 70% 0); transform: translate(-2px, 1px); }
}

/* === 用户区域（右上角） === */
.user-section-top-left {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  font-family: 'Orbitron', sans-serif;
  font-weight: 600;
  color: var(--matrix-green);
  font-size: 0.85rem;
  letter-spacing: 1px;
  text-shadow: 0 0 5px var(--matrix-green);
}

/* === 退出按钮 === */
.logout-btn {
  cursor: pointer;
  padding: 10px 25px;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background-color: #ff0000;
  border-color: #ff0000;
  color: #fff;
  box-shadow: 0 0 30px #ff0000;
}

.logout-btn.router-link-active {
  background-color: transparent;
  border-color: var(--matrix-green);
  color: var(--matrix-green);
  box-shadow: none;
  transform: skewX(-3deg);
}

@media (max-width: 768px) {
  .glitch-title { font-size: 2.5rem; }
  .cyber-btn { padding: 8px 16px; font-size: 0.9rem; }
  .user-info { font-size: 0.7rem; }
  .logout-btn { padding: 6px 15px; font-size: 0.8rem; }
}
</style>
