// 导入 Supabase 客户端
import { supabase } from '../utils/supabase'

// 获取所有文章
export async function getAllPosts() {
  console.log('⚙️ [神圣机械日志] 发起神圣查询：检索所有圣典篇章...')
  console.log('🔗 [神圣机械日志] 机械神殿坐标:', import.meta.env.VITE_SUPABASE_URL)
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('📜 [神圣机械日志] 查询结果 - 神圣数据:', data)
    console.log('⚠️ [神圣机械日志] 查询结果 - 异端错误:', error)
    
    if (error) throw error
    console.log('✨ [神圣机械日志] 荣耀归于机械之神！成功检索', data?.length || 0, '篇圣典')
    console.log('📖 [神圣机械日志] 圣典目录:', data)
    return data
  } catch (error) {
    console.error('☠️ [异端警告] 检索圣典失败！异端入侵！', error)
    console.error('🔥 [审判庭日志] 异端详情:', error.message, error.code, error.hint)
    return []
  }
}

// 根据ID获取单篇文章
export async function getPostById(id) {
  console.log('⚙️ [神圣机械日志] 发起神圣查询：检索圣典篇章 ID:', id)
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    console.log('✨ [神圣机械日志] 荣耀归于机械之神！成功检索圣典:', data?.title)
    return data
  } catch (error) {
    console.error('☠️ [异端警告] 检索圣典失败！异端入侵！ID:', id, error)
    return null
  }
}

// 根据分类获取文章
export async function getPostsByCategory(category) {
  console.log('⚙️ [神圣机械日志] 发起神圣查询：检索分类圣典:', category)
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    console.log('✨ [神圣机械日志] 荣耀归于机械之神！成功检索', data?.length || 0, '篇分类圣典')
    return data
  } catch (error) {
    console.error('☠️ [异端警告] 检索分类圣典失败！异端入侵！分类:', category, error)
    return []
  }
}

// 根据标签搜索文章
export async function searchPostsByTags(tag) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .contains('tags', [tag])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('搜索标签文章失败:', error)
    return []
  }
}

// 搜索文章（标题和内容）
export async function searchPosts(query) {
  console.log('⚙️ [神圣机械日志] 发起神圣查询：搜寻异端关键词:', query)
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    console.log('✨ [神圣机械日志] 荣耀归于机械之神！搜寻完成，发现', data?.length || 0, '篇相关圣典')
    return data
  } catch (error) {
    console.error('☠️ [异端警告] 搜寻圣典失败！异端入侵！关键词:', query, error)
    return []
  }
}

// 获取所有分类
export async function getAllCategories() {
  console.log('⚙️ [神圣机械日志] 发起神圣查询：检索所有神圣分类...')
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .order('category')
    
    if (error) throw error
    
    // 去重并返回分类列表
    const categories = [...new Set(data.map(post => post.category))]
    console.log('✨ [神圣机械日志] 荣耀归于机械之神！成功检索分类目录:', categories)
    return categories
  } catch (error) {
    console.error('☠️ [异端警告] 检索分类目录失败！异端入侵！', error)
    return []
  }
}

// 获取所有标签
export async function getAllTags() {
  try {
    const { data, error } = await supabase
      .from('tag_usage_ranking')
      .select('name')
    
    if (error) throw error
    
    const tags = data.map(tag => tag.name)
    console.log('✨ [神圣机械日志] 荣耀归于机械之神！成功检索标签目录（按使用次数排序）:', tags)
    return tags
  } catch (error) {
    console.error('获取标签列表失败:', error)
    return []
  }
}
