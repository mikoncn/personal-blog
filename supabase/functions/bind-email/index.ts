// Setup: https://deno.land/manual/getting_started/setup_your_environment
/**
 * Bind Email Edge Function
 * 
 * 核心功能：
 * 允许使用钱包登录的用户 ("@wallet.geekblog.io") 绑定真实的邮箱和密码。
 * 
 * 安全机制 (Trusted Auth + Force Unverify):
 * 1. 手动验证 JWT 签名: 由于 Supabase 标准 Auth 可能不认自定义 Token，我们使用 `djwt` 手动验证。
 * 2. 信任 Payload: 签名验证通过后，信任 Token 中的 `sub` (User ID)。
 * 3. 强制未验证 (Security Critical): 修改邮箱后，立即调用 RPC `unverify_user` 将验证状态重置为空，并强制设置 `email_confirm: false`。
 * 4. 触发验证邮件: 手动发送 `signup` 类型邮件，用户必须点击链接才能恢复登录权限。
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { new_email, new_password } = await req.json()
    
    // 2. Validate Input
    if (!new_email || !new_password) {
      throw new Error('Email and password are required')
    }
    if (new_password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    // 3. Authenticate User (Verify Valid Session)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header passed')
    }

    // --- DEBUG: Manual JWT Verification ---
    try {
        const token = authHeader.replace('Bearer ', '')
        const jwtSecret = Deno.env.get('JWT_SECRET') ?? Deno.env.get('SUPABASE_JWT_SECRET')
        if (!jwtSecret) throw new Error('Server Config Error: Missing JWT_SECRET')

        const encoder = new TextEncoder()
        const keyData = encoder.encode(jwtSecret)
        const cryptoKey = await crypto.subtle.importKey(
          'raw', 
          keyData, 
          { name: 'HMAC', hash: 'SHA-256' }, 
          false, 
          ['verify']
        )
        
        await verify(token, cryptoKey)
        console.log('✅ DEBUG: Manual JWT Verification SUCCEEDED! Secret is correct.')
    } catch (verifyError) {
        console.error('❌ DEBUG: Manual JWT Verification FAILED:', verifyError.message)
        throw new Error(`Critical Auth Error: ${verifyError.message}`)
    }
    // --------------------------------------

    // --- TRUSTED AUTHENTICATION ---
    // Since manual verification confirmed the signature, we can trust the payload.
    // This bypasses `getUser()` errors which are happening despite valid tokens.
    let userPayload;
    try {
        const token = authHeader.replace('Bearer ', '')
        const jwtSecret = Deno.env.get('JWT_SECRET') ?? Deno.env.get('SUPABASE_JWT_SECRET')
        if (!jwtSecret) throw new Error('Server Config Error: Missing JWT_SECRET')

        const encoder = new TextEncoder()
        const keyData = encoder.encode(jwtSecret)
        const cryptoKey = await crypto.subtle.importKey(
          'raw', 
          keyData, 
          { name: 'HMAC', hash: 'SHA-256' }, 
          false, 
          ['verify']
        )
        
        userPayload = await verify(token, cryptoKey)
        console.log('✅ Trusted Auth: Token verified for user', userPayload.sub)
    } catch (verifyError: any) {
        console.error('❌ Trusted Auth FAILED:', verifyError.message)
        throw new Error(`Critical Auth Error: ${verifyError.message}`)
    }

    // Construct a user object compatible with the rest of the code
    const user = {
        id: userPayload.sub,
        email: userPayload.email,
        user_metadata: userPayload.user_metadata || {}
    }
    // --------------------------------------

    // 4. Verify Context (Only for Wallet Users)
    // Check if the current email matches the wallet placeholder format
    if (!user.email?.endsWith('@wallet.geekblog.io')) {
       throw new Error('Only wallet-created accounts can bind an email this way.')
    }

    console.log(`[Bind Email] User ${user.id} (${user.email}) requesting bind to ${new_email}`)

    // 5. Upgrade Permissions (Service Role Admin)
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

    // 6. Perform Administrative Update
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email: new_email,
        password: new_password,
        email_confirm: false, 
        user_metadata: {
           ...user.user_metadata,
           email_bind_time: new Date().toISOString(),
           is_wallet_user: true
        }
      }
    )

    if (updateError) {
      console.error('[Bind Email] Update failed:', updateError)
      throw updateError
    }

    // 7. Force Unverify (Security Critical)
    // Call the RPC function to nullify email_confirmed_at
    const { error: rpcError } = await supabaseAdmin.rpc('unverify_user', { user_id: user.id })
    if (rpcError) {
        console.error('[Bind Email] Failed to force unverify:', rpcError)
        // We arguably should revert changes or throw, but for now log critical error
        throw new Error('Security enforcement failed. Please contact support.')
    }

    // 8. Send Verification Email
    // Since we are Admin, we might need to trigger this manually if updateUserById didn't.
    // Using 'signup' type ensures it sets them to confirmed upon clicking.
    const { error: resendError } = await supabaseAdmin.auth.resend({
        type: 'signup',
        email: new_email
    })
    if (resendError) {
        console.error('[Bind Email] Failed to send verification email:', resendError)
        // Inform user checking email might fail, but account is secured (locked)
    }
    
    // 9. Sync to Profiles Table
    await supabaseAdmin
        .from('profiles')
        .update({ email: new_email })
        .eq('id', user.id)

    console.log('[Bind Email] Success - User Unverified & Email Sent')

    return new Response(
      JSON.stringify({ 
        message: 'Verification email sent. Please check your inbox and verify your email to complete the binding.', 
        user: updatedUser 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[Bind Email] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
