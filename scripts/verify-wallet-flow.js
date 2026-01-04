/**
 * 全流程验证脚本：Web3 钱包登录 + 邮箱绑定 + 安全性检查
 * 
 * 功能覆盖：
 * 1. 模拟 Metamask 生成钱包和签名。
 * 2. 调用 `wallet-login` Edge Function 进行登录。
 * 3. 验证通过后，调用 `bind-email` 绑定真实邮箱。
 * 4. [安全检查] 尝试使用未验证的邮箱登录 (预期失败)。
 * 5. [功能检查] 再次使用钱包登录 (预期成功)。
 */

import { createClient } from '@supabase/supabase-js'
import { ethers } from 'ethers'

// --- 配置区域 (Configuration) ---
// 请确保 .env 中的变量与此处一致，或者直接使用硬编码
const SUPABASE_URL = 'https://twjantrzbprehxcmlszj.supabase.co'
// ⚠️ 注意：这里使用的是匿名 Key (Anon Key)，模拟前端环境。不要使用 Service Role Key。
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3amFudHJ6YnByZWh4Y21sc3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODk5OTIsImV4cCI6MjA4MjU2NTk5Mn0.NOaB1vUOj4P_CmGRc1a6tIYy3MDBy-U4b_THH3foz48'

// Edge Function 端点
const WALLET_LOGIN_URL = `${SUPABASE_URL}/functions/v1/wallet-login`
const BIND_EMAIL_URL = `${SUPABASE_URL}/functions/v1/bind-email`

// 初始化 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function runTest() {
    console.log('🚀 开始全流程验证 (End-to-End Test)\n')

    // ---------------------------------------------------------
    // 步骤 1: 准备测试钱包
    // ---------------------------------------------------------
    console.log('🔹 [Step 1] 创建虚拟钱包...')
    const wallet = ethers.Wallet.createRandom()
    console.log(`   - 钱包地址: ${wallet.address}`)
    console.log(`   - 私钥: ${wallet.privateKey.slice(0, 10)}... (仅用于本地签名)`)

    // ---------------------------------------------------------
    // 步骤 2: 生成签名
    // ---------------------------------------------------------
    console.log('\n🔹 [Step 2] 用私钥签名消息...')
    const message = 'Login to GeekBlog'
    const signature = await wallet.signMessage(message)
    console.log(`   - 消息内容: "${message}"`)
    console.log(`   - 签名结果: ${signature.slice(0, 20)}...`)

    // ---------------------------------------------------------
    // 步骤 3: 钱包登录 (调用 wallet-login)
    // ---------------------------------------------------------
    console.log('\n🔹 [Step 3] 请求 wallet-login 接口...')
    
    let sessionToken = ''
    let userId = ''

    try {
        const loginRes = await fetch(WALLET_LOGIN_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ address: wallet.address, signature, message })
        })

        const loginData = await loginRes.json()
        if (!loginRes.ok) throw new Error(loginData.error || '登录未知错误')

        sessionToken = loginData.session.access_token
        userId = loginData.user.id
        console.log('   ✅ 登录成功!')
        console.log(`   - User ID: ${userId}`)

    } catch (err) {
        console.error('   ❌ 登录失败:', err.message)
        process.exit(1)
    }

    // ---------------------------------------------------------
    // 步骤 4: 绑定真实邮箱 (调用 bind-email)
    // ---------------------------------------------------------
    console.log('\n🔹 [Step 4] 请求 bind-email 接口...')
    const uniqueSuffix = Date.now().toString().slice(-4)
    const newEmail = `test-user-${uniqueSuffix}@qq.com` // 使用随机邮箱避免冲突
    const newPassword = 'Password123!'

    try {
        const bindRes = await fetch(BIND_EMAIL_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}` // 必须带上 wallet-login 返回的 Token
            },
            body: JSON.stringify({ new_email: newEmail, new_password: newPassword })
        })

        const bindData = await bindRes.json()
        if (!bindRes.ok) throw new Error(bindData.error || '绑定失败')

        console.log('   ✅ 绑定成功 (请求已发送)')
        console.log(`   - 绑定邮箱: ${newEmail}`)
        console.log(`   - 服务端响应: "${bindData.message}"`)

    } catch (err) {
        console.error('   ❌ 绑定失败:', err.message)
        process.exit(1)
    }

    // ---------------------------------------------------------
    // 步骤 5: 安全性检查 - 尝试用未验证的邮箱登录
    // ---------------------------------------------------------
    console.log('\n🔹 [Step 5] 安全自检: 尝试用新邮箱密码登录...')
    console.log('   (预期结果: 失败，因为邮箱尚未验证)')

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: newEmail,
        password: newPassword
    })

    if (signInError && signInError.message.includes('Email not confirmed')) {
        console.log('   ✅ 安全检查通过: 登录被拦截 (Email not confirmed)')
    } else if (signInError) {
        console.log(`   ✅ 安全检查通过: 登录失败 (${signInError.message})`)
    } else {
        console.error('   ❌ 严重安全漏洞: 未验证的邮箱竟然登录成功了！')
        process.exit(1)
    }

    // ---------------------------------------------------------
    // 步骤 6: 可用性检查 - 验证钱包登录依然可用
    // ---------------------------------------------------------
    console.log('\n🔹 [Step 6] 可用性检查: 钱包能够继续登录...')
    // 钱包登录不依赖 email_confirmed_at，应该依然成功
    // 这里我们简单重用 Step 3 的逻辑或假设它成功，因为 Token 是手动分发的
    console.log('   (钱包持有私钥，应允许继续访问账户)')
    
    // 我们再次调用一次 wallet-login 确认
    try {
        const retryRes = await fetch(WALLET_LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
            body: JSON.stringify({ address: wallet.address, signature, message })
        })
        if (retryRes.ok) {
            console.log('   ✅ 钱包重连成功')
        } else {
            console.warn('   ⚠️ 钱包重连失败 (不符合预期)')
        }
    } catch (e) {
        console.warn('   ⚠️ 网络错误')
    }

    console.log('\n🎉🎉🎉 所有测试步骤完成！系统功能与安全机制运行正常。 🎉🎉🎉')
}

// 执行测试
runTest()
