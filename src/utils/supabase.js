// 导入 Supabase 客户端库
import { createClient } from '@supabase/supabase-js'

// 从环境变量中获取 Supabase 配置
// 1. 如果是开发环境 (localhost)，直接连 supabase (前提是你开梯子开发)
// 2. 如果是生产环境 (Vercel)，连我们配置的 '/supa-proxy'
const isDev = import.meta.env.DEV
const supabaseUrl = isDev 
  ? import.meta.env.VITE_SUPABASE_URL 
  : window.location.origin + '/supa-proxy'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建并导出 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
