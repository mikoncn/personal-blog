import { supabase } from './src/utils/supabase.js'

async function testSupabaseConnection() {
  console.log('=== Supabase 连接测试 ===')
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('Supabase Key 存在:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
  
  try {
    // 测试 1: 检查表是否存在
    console.log('\n测试 1: 查询 posts 表...')
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1)
    
    console.log('查询结果 - data:', data)
    console.log('查询结果 - error:', error)
    
    if (error) {
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      })
    } else {
      console.log('✅ 查询成功！返回数据:', data)
    }
    
    // 测试 2: 检查表结构
    console.log('\n测试 2: 检查 posts 表结构...')
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_structure', { table_name: 'posts' })
    
    console.log('表结构:', tableInfo)
    console.log('表结构错误:', tableError)
    
  } catch (err) {
    console.error('测试失败:', err)
  }
}

testSupabaseConnection()
