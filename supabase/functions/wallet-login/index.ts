// Setup: https://deno.land/manual/getting_started/setup_your_environment
/**
 * Wallet Login Edge Function
 * 
 * 核心功能：
 * 1. 验证以太坊钱包签名 (使用 ethers.js)。
 * 2. 检查 database.profiles 中是否存在该钱包地址。
 * 3. 如果不存在，自动创建新用户 (User + Profile)。
 * 4. 生成自定义 JWT Token (包含 `iss: 'supabase'` Claim)，允许客户端以 Authenticated 身份访问 Supabase。
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"
import { ethers } from "https://esm.sh/ethers@5.7.2"
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { address, signature, message } = await req.json()

    if (!address || !signature || !message) {
      throw new Error('Missing required fields: address, signature, message')
    }

    console.log(`Verifying login for address: ${address}`)

    // 1. 验证签名 (Verify Signature)
    // 使用 ethers.js 恢复签名者地址，确保持有私钥的一方发起了请求
    const recoveredAddress = ethers.utils.verifyMessage(message, signature)
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Invalid signature')
    }

    console.log('Signature verified successfully')

    // 2. 初始化 Supabase Admin Client
    // 用于执行创建用户、查询 Profile 等高权限操作
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 3. 在 profiles 表中查找用户
    // 我们通过 wallet_address 来关联用户，而不是 email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('wallet_address', address)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw new Error('Database error checking profile')
    }

    let userId

    if (profile) {
      // 用户已存在，直接获取 ID
      console.log(`Found existing user linked to wallet: ${profile.id}`)
      userId = profile.id
    } else {
      // 4. 处理新用户注册
      console.log('No user found with this wallet. Creating new user...')
      
      // 生成虚拟邮箱，格式: address@wallet.geekblog.io
      const email = `${address.toLowerCase()}@wallet.geekblog.io`
      const password = crypto.randomUUID() // 生成强随机密码

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // 钱包用户自动确认邮箱
        user_metadata: {
          display_name: `WalletUser_${address.slice(0, 6)}`,
          wallet_address: address
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      userId = newUser.user.id
      
      // 确保 profiles 表中有记录
      await supabaseAdmin.from('profiles').upsert({
         id: userId,
         wallet_address: address,
         display_name: `User_${address.slice(2,8)}`
      })
    }

    // 5. 生成 Session Token (JWT)
    // 这里的关键是使用项目配置的 `JWT_SECRET` 进行签名
    const jwtSecret = Deno.env.get('JWT_SECRET') ?? Deno.env.get('SUPABASE_JWT_SECRET')
    if (!jwtSecret) throw new Error('JWT_SECRET is missing - system configuration error')

    // 构造 Payload
    // 必须包含 `iss: 'supabase'` 才能被 Supabase GoTrue 认证通过
    const payload = {
      iss: 'supabase',
      aud: 'authenticated',
      exp: getNumericDate(60 * 60 * 24), // 24 hours
      sub: userId,
      email: profile?.email || `${address}@wallet.geekblog.io`,
      role: 'authenticated',
      app_metadata: {
        provider: 'wallet',
        providers: ['wallet']
      },
      user_metadata: {
         wallet_address: address
      }
    }

    // 6. 签名 Token
    const encoder = new TextEncoder()
    const keyData = encoder.encode(jwtSecret)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )

    const accessToken = await create({ alg: "HS256", typ: "JWT" }, payload, cryptoKey)

    // 返回标准 Auth 响应结构
    return new Response(
      JSON.stringify({ 
        user: { id: userId, aud: 'authenticated' }, 
        session: { 
           access_token: accessToken,
           token_type: 'bearer',
           expires_in: 3600 * 24,
           refresh_token: accessToken,
           user: { id: userId }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
