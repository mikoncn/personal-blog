// 导入 Supabase 客户端
import { supabase } from '../utils/supabase'

// 清理临时图片
export async function cleanupTemporaryImages() {
  console.log('⚙️ [神圣机械日志] 发起神圣净化：清理临时图片...')
  
  try {
    // 列出所有文件
    const { data: files, error: listError } = await supabase.storage
      .from('post-images')
      .list('', {
        sortBy: { column: 'name', order: 'asc' }
      })
    
    if (listError) {
      console.error('☠️ [异端警告] 获取文件列表失败！', listError)
      return { success: false, error: listError }
    }
    
    console.log('📜 [神圣机械日志] 文件列表:', files)
    
    // 筛选出临时文件（以 temp- 开头的文件）
    const tempFiles = files.filter(file => file.name.startsWith('temp-'))
    console.log('🔍 [神圣机械日志] 发现临时文件:', tempFiles.length, '个')
    
    if (tempFiles.length === 0) {
      console.log('✨ [神圣机械日志] 未发现临时文件，净化完成')
      return { success: true, deletedCount: 0 }
    }
    
    // 删除所有临时文件
    const fileNames = tempFiles.map(file => file.name)
    const { error: deleteError } = await supabase.storage
      .from('post-images')
      .remove(fileNames)
    
    if (deleteError) {
      console.error('☠️ [异端警告] 删除临时文件失败！', deleteError)
      return { success: false, error: deleteError }
    }
    
    console.log('✨ [神圣机械日志] 荣耀归于机械之神！成功净化', tempFiles.length, '个临时文件')
    return { success: true, deletedCount: tempFiles.length }
    
  } catch (error) {
    console.error('☠️ [异端警告] 清理临时图片失败！', error)
    return { success: false, error }
  }
}
