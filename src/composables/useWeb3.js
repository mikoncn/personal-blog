import { ref, computed } from 'vue'

export function useWeb3() {
  const isConnected = ref(false)
  const account = ref(null)
  const chainId = ref(null)
  const balance = ref('0')
  const usdcBalance = ref('0')
  const isConnecting = ref(false)
  const error = ref(null)

  const supportedWallets = ['metamask', 'okxwallet']

  const walletName = computed(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      if (window.ethereum.isMetaMask) return 'MetaMask'
      if (window.ethereum.isOkxWallet) return 'OKX Wallet'
      return 'Unknown Wallet'
    }
    return null
  })

  const hasWallet = computed(() => {
    return typeof window !== 'undefined' && !!window.ethereum
  })

  const isMetaMask = computed(() => {
    return typeof window !== 'undefined' && window.ethereum?.isMetaMask
  })

  const isOkxWallet = computed(() => {
    return typeof window !== 'undefined' && window.ethereum?.isOkxWallet
  })

  function formatAddress(address) {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  function formatBalance(balance, decimals = 4) {
    if (!balance) return '0'
    const num = parseFloat(balance)
    if (isNaN(num)) return '0'
    return num.toFixed(decimals)
  }

  function getChainName(chainId) {
    const chains = {
      '0x1': 'Ethereum',
      '0x89': 'Polygon',
      '0xa4b1': 'Arbitrum',
      '0xa86a': 'Avalanche',
      '0x38': 'BSC',
      '0xa': 'Optimism'
    }
    return chains[chainId] || 'Unknown'
  }

  async function connectWallet() {
    if (!hasWallet.value) {
      error.value = '未检测到钱包插件，请安装 MetaMask 或 OKX Wallet'
      console.error('☠️ [Web3] 未检测到钱包插件')
      return false
    }

    isConnecting.value = true
    error.value = null

    try {
      console.log('⚙️ [Web3] 请求钱包连接...')

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts && accounts.length > 0) {
        account.value = accounts[0]
        isConnected.value = true

        const chainIdHex = await window.ethereum.request({
          method: 'eth_chainId'
        })
        chainId.value = chainIdHex

        await updateBalance()

        console.log('✅ [Web3] 钱包连接成功', {
          account: account.value,
          chainId: chainId.value,
          wallet: walletName.value
        })

        return true
      }
    } catch (err) {
      console.error('☠️ [Web3] 钱包连接失败', err)
      
      if (err.code === 4001) {
        error.value = '用户拒绝了连接请求'
      } else if (err.code === -32002) {
        error.value = '请先在钱包中确认之前的连接请求'
      } else {
        error.value = '连接失败：' + err.message
      }
      
      return false
    } finally {
      isConnecting.value = false
    }
  }

  async function disconnectWallet() {
    account.value = null
    chainId.value = null
    balance.value = '0'
    usdcBalance.value = '0'
    isConnected.value = false
    error.value = null

    console.log('🚪 [Web3] 钱包已断开连接')
  }

  async function updateBalance() {
    if (!account.value || !hasWallet.value) return

    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account.value, 'latest']
      })

      const balanceWei = parseInt(balanceHex, 16)
      const balanceEth = balanceWei / 1e18
      balance.value = balanceEth.toString()

      console.log('💰 [Web3] 余额更新', {
        address: account.value,
        balance: balance.value
      })
    } catch (err) {
      console.error('☠️ [Web3] 获取余额失败', err)
    }
  }

  async function getUSDCBalance() {
    if (!account.value || !hasWallet.value) {
      usdcBalance.value = '0'
      return '0'
    }

    try {
      const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
      const usdcAbi = [
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function'
        }
      ]

      const contract = new window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: usdcAddress,
            data: '0x70a08231' + account.value.slice(2).padStart(64, '0')
          },
          'latest'
        ]
      })

      const balanceHex = await contract
      const balanceWei = parseInt(balanceHex, 16)
      const balanceUSDC = balanceWei / 1e6

      usdcBalance.value = balanceUSDC.toString()

      console.log('💰 [Web3] USDC 余额更新', {
        address: account.value,
        usdcBalance: usdcBalance.value
      })

      return usdcBalance.value
    } catch (err) {
      console.error('☠️ [Web3] 获取 USDC 余额失败', err)
      usdcBalance.value = '0'
      return '0'
    }
  }

  function setupEventListeners() {
    if (!hasWallet.value) return

    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('🔄 [Web3] 账户变更', accounts)
      if (accounts && accounts.length > 0) {
        account.value = accounts[0]
        updateBalance()
      } else {
        disconnectWallet()
      }
    })

    window.ethereum.on('chainChanged', (newChainId) => {
      console.log('🔄 [Web3] 链变更', newChainId)
      chainId.value = newChainId
      updateBalance()
    })

    window.ethereum.on('disconnect', (error) => {
      console.log('🚪 [Web3] 钱包断开连接', error)
      disconnectWallet()
    })
  }

  function removeEventListeners() {
    if (!hasWallet.value) return

    window.ethereum.removeAllListeners('accountsChanged')
    window.ethereum.removeAllListeners('chainChanged')
    window.ethereum.removeAllListeners('disconnect')
  }

  function switchChain(targetChainId) {
    if (!hasWallet.value || !isConnected.value) {
      error.value = '请先连接钱包'
      return false
    }

    return window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }]
    }).catch((error) => {
      console.error('☠️ [Web3] 切换链失败', error)
      error.value = '切换链失败：' + error.message
      return false
    })
  }

  async function sendTransaction(to, value) {
    if (!hasWallet.value || !isConnected.value) {
      error.value = '请先连接钱包'
      return null
    }

    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.value,
          to: to,
          value: '0x' + parseInt(value * 1e18).toString(16)
        }]
      })

      console.log('✅ [Web3] 交易已发送', txHash)
      return txHash
    } catch (err) {
      console.error('☠️ [Web3] 发送交易失败', err)
      error.value = '发送交易失败：' + err.message
      return null
    }
  }

  return {
    isConnected,
    account,
    chainId,
    balance,
    usdcBalance,
    isConnecting,
    error,
    walletName,
    hasWallet,
    isMetaMask,
    isOkxWallet,
    formatAddress,
    formatBalance,
    getChainName,
    connectWallet,
    disconnectWallet,
    updateBalance,
    getUSDCBalance,
    setupEventListeners,
    removeEventListeners,
    switchChain,
    sendTransaction
  }
}
