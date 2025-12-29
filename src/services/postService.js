// 导入 Supabase 客户端
import { supabase } from '../utils/supabase'

// 获取所有文章
export async function getAllPosts() {
  console.log('[DEBUG] 开始获取所有文章...')
  console.log('[DEBUG] Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('[DEBUG] 查询结果 - data:', data)
    console.log('[DEBUG] 查询结果 - error:', error)
    
    if (error) throw error
    console.log('[DEBUG] 成功获取文章列表，共', data?.length || 0, '篇')
    console.log('[DEBUG] 文章列表:', data)
    return data
  } catch (error) {
    console.error('[ERROR] 获取文章列表失败:', error)
    console.error('[ERROR] 错误详情:', error.message, error.code, error.hint)
    return []
  }
}

// 根据ID获取单篇文章
export async function getPostById(id) {
  console.log('[DEBUG] 开始获取文章详情，ID:', id)
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    console.log('[DEBUG] 成功获取文章详情:', data?.title)
    return data
  } catch (error) {
    console.error('[ERROR] 获取文章详情失败，ID:', id, error)
    return null
  }
}

// 根据分类获取文章
export async function getPostsByCategory(category) {
  console.log('[DEBUG] 开始获取分类文章，分类:', category)
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    console.log('[DEBUG] 成功获取分类文章，共', data?.length || 0, '篇')
    return data
  } catch (error) {
    console.error('[ERROR] 获取分类文章失败，分类:', category, error)
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
  console.log('[DEBUG] 开始搜索文章，关键词:', query)
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    console.log('[DEBUG] 搜索完成，找到', data?.length || 0, '篇相关文章')
    return data
  } catch (error) {
    console.error('[ERROR] 搜索文章失败，关键词:', query, error)
    return []
  }
}

// 获取所有分类
export async function getAllCategories() {
  console.log('[DEBUG] 开始获取所有分类...')
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .order('category')
    
    if (error) throw error
    
    // 去重并返回分类列表
    const categories = [...new Set(data.map(post => post.category))]
    console.log('[DEBUG] 成功获取分类列表:', categories)
    return categories
  } catch (error) {
    console.error('[ERROR] 获取分类列表失败:', error)
    return []
  }
}

// 获取所有标签
export async function getAllTags() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('tags')
    
    if (error) throw error
    
    // 提取所有标签并去重
    const allTags = data.flatMap(post => post.tags || [])
    const uniqueTags = [...new Set(allTags)].sort()
    return uniqueTags
  } catch (error) {
    console.error('获取标签列表失败:', error)
    return []
  }
}
