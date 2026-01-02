<template>
  <div class="wallet-wrapper">
    <button
      v-if="!isConnected"
      @click="handleConnect"
      class="cyber-btn connect-btn"
      :disabled="isConnecting"
    >
      <span class="btn-icon">🔗</span>
      <span class="btn-text">{{ isConnecting ? '连接中...' : '接入 Web3 接口' }}</span>
    </button>

    <div v-else class="wallet-status">
      <div class="status-indicator"></div>
      <span class="wallet-type">{{ walletName }}</span>
      <span class="address-display" @click="copyAddress" title="点击复制">
        {{ formatAddress(account) }}
      </span>
      <button class="disconnect-btn" @click="handleDisconnect">×</button>
    </div>

    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWeb3 } from '../composables/useWeb3'
import { supabase } from '../utils/supabase'

const {
  account,
  isConnected,
  walletName,
  isConnecting,
  error,
  connectWallet,
  disconnectWallet,
  formatAddress,
  setupEventListeners
} = useWeb3()

const currentUser = ref(null)

onMounted(async () => {
  await loadCurrentUser()
  setupEventListeners()
})

async function loadCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) {
      currentUser.value = user
      console.log('✅ [WalletConnect] 当前用户已加载', user.id)
    }
  } catch (err) {
    console.error('☠️ [WalletConnect] 加载用户失败', err)
  }
}

async function handleConnect() {
  console.log('🔍 [WalletConnect] 开始处理连接请求')
  console.log('🔍 [WalletConnect] 当前用户状态:', currentUser.value)
  
  const success = await connectWallet()
  
  console.log('🔍 [WalletConnect] 连接结果:', success)
  console.log('🔍 [WalletConnect] 钱包账户:', account.value)
  console.log('🔍 [WalletConnect] 当前用户:', currentUser.value)
  
  if (success && account.value) {
    if (currentUser.value) {
      console.log('✅ [WalletConnect] 用户已登录，准备保存钱包地址')
      await saveWalletAddress()
    } else {
      console.warn('⚠️ [WalletConnect] 用户未登录，钱包地址未保存到数据库')
      alert('⚠️ 请先登录以保存钱包地址')
    }
  } else {
    console.error('❌ [WalletConnect] 连接失败或账户为空')
  }
}

async function saveWalletAddress() {
  console.log('🔍 [WalletConnect] saveWalletAddress 开始执行')
  console.log('🔍 [WalletConnect] 账户地址:', account.value)
  console.log('🔍 [WalletConnect] 当前用户:', currentUser.value)
  
  if (!account.value || !currentUser.value) {
    console.error('❌ [WalletConnect] 缺少必要参数，无法保存')
    return
  }

  try {
    console.log('⚙️ [WalletConnect] 准备保存钱包地址到 profiles 表', {
      userId: currentUser.value.id,
      walletAddress: account.value
    })

    console.log('🔍 [WalletConnect] 发送 Supabase 更新请求...')
    const { data, error } = await supabase
      .from('profiles')
      .update({ wallet_address: account.value })
      .eq('id', currentUser.value.id)
      .select()

    console.log('🔍 [WalletConnect] Supabase 响应:', { data, error })

    if (error) {
      console.error('❌ [WalletConnect] Supabase 错误:', error)
      throw error
    }

    console.log('✅ [WalletConnect] 钱包地址保存成功', data)
  } catch (err) {
    console.error('☠️ [WalletConnect] 保存钱包地址失败', err)
  }
}

async function clearWalletAddress() {
  if (!currentUser.value) return

  try {
    console.log('⚙️ [WalletConnect] 清空 profiles 表中的钱包地址', {
      userId: currentUser.value.id
    })

    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: null })
      .eq('id', currentUser.value.id)

    if (error) throw error

    console.log('✅ [WalletConnect] 钱包地址已清空')
  } catch (err) {
    console.error('☠️ [WalletConnect] 清空钱包地址失败', err)
  }
}

async function handleDisconnect() {
  await clearWalletAddress()
  disconnectWallet()
}

function copyAddress() {
  if (account.value) {
    navigator.clipboard.writeText(account.value).then(() => {
      alert('地址已复制到剪贴板')
    }).catch(err => {
      console.error('复制失败', err)
      alert('复制失败，请手动复制')
    })
  }
}
</script>

<style scoped>
.wallet-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.cyber-btn {
  background: rgba(0, 20, 0, 0.8);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 8px 16px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
}

.cyber-btn:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
  text-shadow: 0 0 5px #00ff00;
}

.cyber-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-status {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background-color: #00ff00;
  border-radius: 50%;
  box-shadow: 0 0 5px #00ff00;
  animation: pulse 2s infinite;
}

.wallet-type {
  color: #00ffff;
  font-weight: bold;
  font-size: 12px;
  border-right: 1px solid rgba(0, 255, 255, 0.3);
  padding-right: 8px;
}

.address-display {
  color: #e0e0e0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.address-display:hover {
  color: #ffffff;
  text-decoration: underline;
}

.disconnect-btn {
  background: none;
  border: none;
  color: #ff0000;
  cursor: pointer;
  font-size: 16px;
  margin-left: 5px;
  padding: 0 5px;
  transition: all 0.2s ease;
}

.disconnect-btn:hover {
  color: #ff6666;
  text-shadow: 0 0 5px #ff0000;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
  color: #ff6666;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
