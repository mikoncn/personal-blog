<script setup>
import { ref, computed, watch, nextTick, onMounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../utils/supabase'
import { renderMarkdown } from '../utils/markdown'

const router = useRouter()
const route = useRoute()
const currentUser = inject('currentUser')

const isEditMode = computed(() => !!route.params.id)

const formData = ref({
  title: '',
  category: '',
  summary: '',
  content: '',
  tags: ''
})

const submitting = ref(false)
const message = ref('')
const messageType = ref('')
const draftSaved = ref(false)
const draftSaving = ref(false)

const editorRef = ref(null)
const previewRef = ref(null)

const renderedContent = computed(() => {
  return renderMarkdown(formData.value.content)
})

const allTags = ref([])
const selectedTags = ref([])
const tagSearch = ref('')
const showTagDropdown = ref(false)
const addingNewTag = ref(false)

const categoryOptions = ['Dev', 'Life', 'Misc', 'Alpha']

const selectedFiles = ref([])
const imagePreviews = ref([])
const uploadingImages = ref(false)
const uploadedImageUrls = ref([])
const imageSizes = ref([])

const coverFile = ref(null)
const coverPreview = ref('')
const uploadingCover = ref(false)
const coverSize = ref('none')
const showCardPreview = ref(false)
const coverPosition = ref({ x: 0, y: 0 })
const coverScale = ref(1)
const isDraggingCover = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const copyNotifications = ref([])

function copyImageUrl(url, index) {
  console.log('⚙️ [神圣机械日志] 点击复制按钮，URL:', url, '索引:', index)
  if (url) {
    const size = imageSizes.value[index] || 'medium'
    let contentToCopy = url
    
    if (size !== 'none') {
      const widthMap = {
        'small': 300,
        'medium': 600,
        'large': 900
      }
      const width = widthMap[size] || 600
      contentToCopy = `<img src="${url}" width="${width}" />`
    }
    
    console.log('✨ [神圣机械日志] 复制内容:', contentToCopy)
    navigator.clipboard.writeText(contentToCopy).then(() => {
      console.log('✨ [神圣机械日志] 复制成功，准备显示通知')
      showCopyNotification(contentToCopy)
    }).catch(err => {
      console.error('☠️ [异端警告] 复制失败:', err)
      alert('复制失败，请手动复制')
    })
  } else {
    console.warn('⚠️ [警告] URL 为空，图片可能正在上传中')
    alert('图片正在上传中，请稍后再试')
  }
}

function copyCoverUrl(url) {
  console.log('⚙️ [神圣机械日志] 点击复制封面按钮，URL:', url)
  if (url) {
    const size = coverSize.value || 'none'
    let contentToCopy = url
    
    if (size !== 'none') {
      const widthMap = {
        'small': 300,
        'medium': 600,
        'large': 900
      }
      const width = widthMap[size] || 600
      contentToCopy = `<img src="${url}" width="${width}" />`
    }
    
    console.log('✨ [神圣机械日志] 复制内容:', contentToCopy)
    navigator.clipboard.writeText(contentToCopy).then(() => {
      console.log('✨ [神圣机械日志] 封面复制成功，准备显示通知')
      showCopyNotification(contentToCopy)
    }).catch(err => {
      console.error('☠️ [异端警告] 复制失败:', err)
      alert('复制失败，请手动复制')
    })
  } else {
    console.warn('⚠️ [警告] 封面 URL 为空，图片可能正在上传中')
    alert('图片正在上传中，请稍后再试')
  }
}

function showCopyNotification(content) {
  console.log('⚙️ [神圣机械日志] 创建通知，当前通知数量:', copyNotifications.value.length)
  const isHtmlTag = content.startsWith('<img')
  const notification = {
    id: Date.now(),
    url: content,
    message: isHtmlTag ? '图片标签已复制到剪贴板' : 'URL已复制到剪贴板'
  }
  copyNotifications.value.push(notification)
  console.log('✨ [神圣机械日志] 通知已添加，通知数量:', copyNotifications.value.length)
  
  setTimeout(() => {
    const index = copyNotifications.value.findIndex(n => n.id === notification.id)
    if (index > -1) {
      copyNotifications.value.splice(index, 1)
      console.log('⚙️ [神圣机械日志] 通知已移除')
    }
  }, 3000)
}

async function loadAllTags() {
  try {
    const { data, error } = await supabase
      .from('tag_usage_ranking')
      .select('name')

    if (error) throw error
    
    allTags.value = data.map(tag => tag.name)
    console.log('⚙️ [神圣机械日志] 标签库加载成功（按使用次数排序）:', allTags.value)
  } catch (error) {
    console.error('☠️ [异端警告] 加载标签库失败！', error)
  }
}

const filteredTags = computed(() => {
  const search = tagSearch.value.toLowerCase().trim()
  if (!search) {
    return allTags.value.filter(tag => !selectedTags.value.includes(tag))
  }
  return allTags.value
    .filter(tag => 
      tag.toLowerCase().includes(search) && 
      !selectedTags.value.includes(tag)
    )
})

const canAddNewTag = computed(() => {
  const search = tagSearch.value.trim()
  return search.length > 0 && 
         !allTags.value.includes(search) && 
         !selectedTags.value.includes(search)
})

function toggleTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  tagSearch.value = ''
}

async function addNewTag() {
  const newTag = tagSearch.value.trim()
  if (!newTag || allTags.value.includes(newTag)) return

  addingNewTag.value = true
  try {
    const { error } = await supabase
      .from('tags')
      .insert([{ name: newTag }])

    if (error) throw error

    allTags.value.push(newTag)
    selectedTags.value.push(newTag)
    tagSearch.value = ''
    console.log('✨ [神圣机械日志] 新标签已注入:', newTag)
  } catch (error) {
    console.error('☠️ [异端警告] 添加新标签失败！', error)
    alert('添加标签失败：' + error.message)
  } finally {
    addingNewTag.value = false
  }
}

function removeTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

function handleTagInputFocus() {
  showTagDropdown.value = true
}

function handleTagInputBlur() {
  setTimeout(() => {
    showTagDropdown.value = false
  }, 200)
}

watch(selectedTags, (newTags) => {
  formData.value.tags = newTags.join(', ')
}, { deep: true })

const draftKey = computed(() => {
  return isEditMode.value ? `post_draft_edit_${route.params.id}` : 'post_draft_new'
})

function saveDraft() {
  try {
    draftSaving.value = true
    const draftData = {
      title: formData.value.title,
      category: formData.value.category,
      summary: formData.value.summary,
      content: formData.value.content,
      tags: formData.value.tags,
      selectedTags: selectedTags.value,
      timestamp: Date.now()
    }
    localStorage.setItem(draftKey.value, JSON.stringify(draftData))
    draftSaved.value = true
    setTimeout(() => {
      draftSaved.value = false
    }, 2000)
    console.log('💾 [草稿系统] 草稿已保存')
  } catch (error) {
    console.error('☠️ [草稿系统] 保存草稿失败！', error)
  } finally {
    draftSaving.value = false
  }
}

function loadDraft() {
  try {
    const draftData = localStorage.getItem(draftKey.value)
    if (!draftData) return false

    const parsed = JSON.parse(draftData)
    const timeDiff = Date.now() - parsed.timestamp
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      localStorage.removeItem(draftKey.value)
      console.log('🗑️ [草稿系统] 草稿已过期（超过24小时）')
      return false
    }

    formData.value = {
      title: parsed.title || '',
      category: parsed.category || '',
      summary: parsed.summary || '',
      content: parsed.content || '',
      tags: parsed.tags || ''
    }
    selectedTags.value = parsed.selectedTags || []
    console.log('📂 [草稿系统] 草稿已恢复，保存时间:', new Date(parsed.timestamp).toLocaleString())
    return true
  } catch (error) {
    console.error('☠️ [草稿系统] 加载草稿失败！', error)
    return false
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(draftKey.value)
    console.log('🗑️ [草稿系统] 草稿已清除')
  } catch (error) {
    console.error('☠️ [草稿系统] 清除草稿失败！', error)
  }
}

watch(formData, () => {
  saveDraft()
}, { deep: true })

watch(selectedTags, () => {
  saveDraft()
}, { deep: true })

onMounted(() => {
  loadPostData()
  loadAllTags()
  if (!isEditMode.value) {
    loadDraft()
  }
})

async function loadPostData() {
  if (!isEditMode.value) return

  try {
    const postId = parseInt(route.params.id)
    console.log('⚙️ [神圣机械日志] 开始加载圣典，ID:', postId, '类型:', typeof postId)
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    console.log('⚙️ [神圣机械日志] 查询结果:', data, '错误:', error)

    if (error) throw error

    if (data) {
      formData.value = {
        title: data.title || '',
        category: data.category || '',
        summary: data.summary || '',
        content: data.content || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : ''
      }
      selectedTags.value = Array.isArray(data.tags) ? [...data.tags] : []
      
      if (data.image_url) {
        if (data.image_url.cover) {
          const coverData = typeof data.image_url.cover === 'string' 
            ? { url: data.image_url.cover, position: { x: 0, y: 0 }, scale: 1 }
            : data.image_url.cover
          coverPreview.value = coverData.url
          coverPosition.value = coverData.position || { x: 0, y: 0 }
          coverScale.value = coverData.scale || 1
        }
        if (data.image_url.images && Array.isArray(data.image_url.images)) {
          data.image_url.images.forEach(imageData => {
            const url = typeof imageData === 'string' ? imageData : imageData.url
            const size = typeof imageData === 'string' ? 'medium' : imageData.size
            
            imagePreviews.value.push(url)
            uploadedImageUrls.value.push(url)
            selectedFiles.value.push(null)
            imageSizes.value.push(size)
          })
        }
      }
      
      console.log('✨ [神圣机械日志] 圣典加载成功:', formData.value)
    }
  } catch (error) {
    console.error('☠️ [异端警告] 加载圣典失败！', error)
    console.error('错误详情:', error.message, error.code, error.hint)
    message.value = '加载圣典失败：' + error.message
    messageType.value = 'error'
  }
}

watch(() => formData.value.content, () => {
  syncScroll()
})

function syncScroll() {
  if (editorRef.value && previewRef.value) {
    const editor = editorRef.value
    const preview = previewRef.value
    const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
  }
}

function insertMarkdown(pattern, placeholder = '') {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = formData.value.content
  const selectedText = text.substring(start, end)

  const before = text.substring(0, start)
  const after = text.substring(end)

  let newText
  let cursorPos

  if (selectedText) {
    newText = before + pattern.replace('$$', selectedText) + after
    cursorPos = start + pattern.replace('$$', selectedText).length
  } else {
    newText = before + pattern.replace('$$', placeholder) + after
    cursorPos = start + pattern.replace('$$', placeholder).length
  }

  formData.value.content = newText

  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(cursorPos, cursorPos)
  })
}

function insertBold() {
  insertMarkdown('**$$**', '粗体文本')
}

function insertItalic() {
  insertMarkdown('*$$*', '斜体文本')
}

function insertCode() {
  insertMarkdown('`$$`', '代码')
}

function insertCodeBlock() {
  insertMarkdown('```\n$$\n```', '代码块')
}

function insertLink() {
  insertMarkdown('[$$](url)', '链接文本')
}

function insertImage() {
  insertMarkdown('![$$](url)', '图片描述')
}

function insertQuote() {
  insertMarkdown('> $$', '引用内容')
}

function insertList() {
  insertMarkdown('- $$', '列表项')
}

function insertHeading() {
  insertMarkdown('## $$', '标题')
}

function insertTable() {
  const table = '| 标题1 | 标题2 | 标题3 |\n|-------|-------|-------|\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |'
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const text = formData.value.content
  const before = text.substring(0, start)
  const after = text.substring(start)

  formData.value.content = before + table + after

  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + table.length, start + table.length)
  })
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
    
    const index = selectedFiles.value.length
    selectedFiles.value.push(file)
    uploadedImageUrls.value.push(null)
    imageSizes.value.push('none')
    
    uploadSingleImage(file, index)
  })
  
  event.target.value = ''
}

async function uploadSingleImage(file, index) {
  uploadingImages.value = true
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const filePath = `${fileName}`

    console.log('⚙️ [神圣机械日志] 正在上传图片:', fileName)

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file)

    if (error) {
      console.error('☠️ [异端警告] 图片上传失败！', error)
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    uploadedImageUrls.value[index] = publicUrl
    console.log('✨ [神圣机械日志] 图片上传成功:', publicUrl)
    
    return publicUrl
  } catch (error) {
    console.error('☠️ [异端警告] 图片上传失败！', error)
    message.value = '图片上传失败：' + error.message
    messageType.value = 'error'
    throw error
  } finally {
    uploadingImages.value = false
  }
}

async function removeImage(index) {
  const url = uploadedImageUrls.value[index]
  
  if (url && isEditMode.value) {
    try {
      const fileName = url.split('/').pop()
      const { error } = await supabase.storage
        .from('post-images')
        .remove([fileName])
      
      if (error) {
        console.error('☠️ [异端警告] 删除图片失败！', error)
      } else {
        console.log('✨ [神圣机械日志] 图片已删除:', fileName)
      }
    } catch (error) {
      console.error('☠️ [异端警告] 删除图片失败！', error)
    }
  }
  
  selectedFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
  uploadedImageUrls.value.splice(index, 1)
  imageSizes.value.splice(index, 1)
}

async function handleCoverSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  coverFile.value = file
  uploadingCover.value = true
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `temp-cover-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const filePath = `${fileName}`

    console.log('⚙️ [神圣机械日志] 正在上传封面:', fileName)

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file)

    if (error) {
      console.error('☠️ [异端警告] 封面上传失败！', error)
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    coverPreview.value = publicUrl
    console.log('✨ [神圣机械日志] 封面上传成功:', publicUrl)
  } catch (error) {
    console.error('☠️ [异端警告] 封面上传失败！', error)
    message.value = '封面上传失败：' + error.message
    messageType.value = 'error'
  } finally {
    uploadingCover.value = false
  }
}

async function removeCover() {
  if (coverPreview.value && isEditMode.value) {
    try {
      const coverUrl = typeof coverPreview.value === 'string' ? coverPreview.value : coverPreview.value.url
      const fileName = coverUrl.split('/').pop()
      const { error } = await supabase.storage
        .from('post-images')
        .remove([fileName])
      
      if (error) {
        console.error('☠️ [异端警告] 删除封面失败！', error)
      } else {
        console.log('✨ [神圣机械日志] 封面已删除:', fileName)
      }
    } catch (error) {
      console.error('☠️ [异端警告] 删除封面失败！', error)
    }
  }
  
  coverFile.value = null
  coverPreview.value = ''
  coverPosition.value = { x: 0, y: 0 }
  event.target.value = ''
}

function startDragCover(event) {
  isDraggingCover.value = true
  dragStart.value = {
    x: event.clientX - coverPosition.value.x,
    y: event.clientY - coverPosition.value.y
  }
  event.preventDefault()
}

function onDragCover(event) {
  if (!isDraggingCover.value) return
  
  coverPosition.value = {
    x: event.clientX - dragStart.value.x,
    y: event.clientY - dragStart.value.y
  }
}

function stopDragCover() {
  isDraggingCover.value = false
}

function resetCoverPosition() {
  coverPosition.value = { x: 0, y: 0 }
  coverScale.value = 1
}

function zoomCover(delta) {
  const newScale = coverScale.value + delta
  if (newScale >= 0.5 && newScale <= 3) {
    coverScale.value = newScale
  }
}

async function uploadCover(postId) {
  if (!coverFile.value) {
    return null
  }

  uploadingCover.value = true
  try {
    const fileExt = coverFile.value.name.split('.').pop()
    const fileName = `post-${postId}-cover-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    console.log('⚙️ [神圣机械日志] 正在上传封面图:', fileName)

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, coverFile.value)

    if (error) {
      console.error('☠️ [异端警告] 封面上传失败！', error)
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    console.log('✨ [神圣机械日志] 封面上传成功:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('☠️ [异端警告] 封面上传失败！', error)
    message.value = '封面上传失败：' + error.message
    messageType.value = 'error'
    throw error
  } finally {
    uploadingCover.value = false
  }
}

async function uploadImages(postId) {
  const urls = uploadedImageUrls.value.filter(url => url !== null)
  console.log('✨ [神圣机械日志] 开始转换临时图片为正式图片，共', urls.length, '张')
  
  const finalUrls = []
  
  for (let i = 0; i < urls.length; i++) {
    const tempUrl = urls[i]
    const oldFileName = tempUrl.split('/').pop()
    
    if (oldFileName.startsWith('temp-')) {
      const fileExt = oldFileName.split('.').pop()
      const newFileName = `post-${postId}-image-${i + 1}-${Date.now()}.${fileExt}`
      
      console.log('⚙️ [神圣机械日志] 转换图片:', oldFileName, '->', newFileName)
      
      try {
        const { data, error } = await supabase.storage
          .from('post-images')
          .move(oldFileName, newFileName)
        
        if (error) {
          console.error('☠️ [异端警告] 图片转换失败！', error)
          throw error
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(newFileName)
        
        finalUrls.push(publicUrl)
        console.log('✨ [神圣机械日志] 图片转换成功:', publicUrl)
      } catch (error) {
        console.error('☠️ [异端警告] 图片转换失败，使用临时URL:', error)
        finalUrls.push(tempUrl)
      }
    } else {
      finalUrls.push(tempUrl)
    }
  }
  
  console.log('✨ [神圣机械日志] 图片转换完成，共', finalUrls.length, '张')
  return finalUrls
}

async function handleSubmit() {
  console.log('⚙️ [神圣机械日志] 机魂注魔仪式启动...')
  
  if (!currentUser.value) {
    message.value = '请先登录以执行此操作'
    messageType.value = 'error'
    return
  }
  
  submitting.value = true
  message.value = ''

  try {
    const tagsArray = [...selectedTags.value]
    
    let postId
    if (isEditMode.value) {
      postId = parseInt(route.params.id)
    } else {
      console.log('⚙️ [神圣机械日志] 正在查询圣典库中的最大编号...')
      const { data: existingPosts, error: queryError } = await supabase
        .from('posts')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)

      if (queryError) throw queryError

      postId = 1
      if (existingPosts && existingPosts.length > 0) {
        const maxId = existingPosts[0].id
        postId = maxId + 1
      }
      console.log('⚙️ [神圣机械日志] 新圣典编号已确定:', postId)
    }
    
    console.log('⚙️ [神圣机械日志] 开始上传封面图...')
    const coverUrl = await uploadCover(postId)
    console.log('✨ [神圣机械日志] 封面上传完成:', coverUrl)
    
    console.log('⚙️ [神圣机械日志] 开始上传图片...')
    const imageUrls = await uploadImages(postId)
    console.log('✨ [神圣机械日志] 图片上传完成，共', imageUrls.length, '张')

    const imageData = {}
    if (coverUrl) {
      imageData.cover = {
        url: coverUrl,
        position: coverPosition.value,
        scale: coverScale.value
      }
    } else if (isEditMode.value && coverPreview.value) {
      imageData.cover = {
        url: coverPreview.value,
        position: coverPosition.value,
        scale: coverScale.value
      }
    }
    
    const imagesWithSizes = []
    
    uploadedImageUrls.value.forEach((url, index) => {
      if (url) {
        const finalUrl = imageUrls.find(finalUrl => {
          const oldFileName = url.split('/').pop()
          const newFileName = finalUrl.split('/').pop()
          return oldFileName.startsWith('temp-') && newFileName.includes(`post-${postId}-image-${index + 1}`)
        }) || url
        
        imagesWithSizes.push({
          url: finalUrl,
          size: imageSizes.value[index] || 'medium'
        })
      }
    })
    
    if (imagesWithSizes.length > 0) {
      imageData.images = imagesWithSizes
    }
    
    let content = formData.value.content
    uploadedImageUrls.value.forEach((tempUrl, index) => {
      if (tempUrl && tempUrl.includes('temp-')) {
        const finalUrl = imageUrls[index]
        if (finalUrl) {
          content = content.replace(new RegExp(tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), finalUrl)
          console.log('⚙️ [神圣机械日志] 替换文章内容中的图片 URL:', tempUrl, '->', finalUrl)
        }
      }
    })

    if (isEditMode.value) {
      const updateData = {
        title: formData.value.title,
        category: formData.value.category,
        summary: formData.value.summary,
        content: content,
        tags: tagsArray,
        user_id: currentUser.value.id,
        image_url: Object.keys(imageData).length > 0 ? imageData : null
      }

      console.log('⚙️ [神圣机械日志] 准备更新圣典')
      console.log('⚙️ [神圣机械日志] 圣典 ID:', postId, '类型:', typeof postId)
      console.log('⚙️ [神圣机械日志] 更新数据:', updateData)

      const { data: existingData, error: queryError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      console.log('⚙️ [神圣机械日志] 查询现有记录:', existingData, '错误:', queryError)

      if (queryError) {
        console.error('☠️ [异端警告] 查询现有记录失败！')
        console.error('错误详情:', queryError.message, queryError.code, queryError.hint)
        throw queryError
      }

      if (!existingData) {
        console.error('☠️ [异端警告] 未找到要更新的圣典记录！')
        throw new Error('未找到要更新的圣典记录')
      }

      console.log('⚙️ [神圣机械日志] 开始执行更新操作...')
      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)

      console.log('⚙️ [神圣机械日志] 更新错误:', updateError)

      if (updateError) {
        console.error('☠️ [异端警告] 更新失败！')
        console.error('错误详情:', updateError.message, updateError.code, updateError.hint, updateError.details)
        throw updateError
      }

      console.log('⚙️ [神圣机械日志] 更新完成，重新查询数据...')
      const { data: updatedData, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      console.log('⚙️ [神圣机械日志] 重新查询结果:', updatedData, '错误:', fetchError)

      if (fetchError) {
        console.error('☠️ [异端警告] 重新查询失败！')
        console.error('错误详情:', fetchError.message, fetchError.code, fetchError.hint)
        throw fetchError
      }

      console.log('✨ [神圣机械日志] 机魂大悦，圣典已更新！')
      console.log('📖 [神圣机械日志] 圣典更新成功:', updatedData)

      clearDraft()
      message.value = '机魂大悦，圣典已更新'
      messageType.value = 'success'

      setTimeout(() => {
        router.push(`/post/${postId}`)
      }, 1500)
    } else {
      const postData = {
        id: postId,
        title: formData.value.title,
        category: formData.value.category,
        summary: formData.value.summary,
        content: content,
        tags: tagsArray,
        user_id: currentUser.value.id,
        image_url: Object.keys(imageData).length > 0 ? imageData : null
      }

      console.log('⚙️ [神圣机械日志] 准备注入数据:', postData)

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()

      if (error) throw error

      console.log('✨ [神圣机械日志] 机魂大悦，数据已注入！')
      console.log('📖 [神圣机械日志] 新圣典已创建:', data[0])

      clearDraft()
      message.value = '机魂大悦，数据已注入'
      messageType.value = 'success'

      setTimeout(() => {
        router.push('/')
      }, 1500)
    }

  } catch (error) {
    console.error('☠️ [异端警告] 注魔仪式失败！异端入侵！', error)
    message.value = '注魔失败：' + error.message
    messageType.value = 'error'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="make-post-page">
    <div class="back-button-container">
      <router-link to="/" class="back-button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="#00ff00" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 19L5 12L12 5" stroke="#00ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-button-text">返回主页</span>
      </router-link>
    </div>

    <section class="page-header">
      <h1 class="page-title">
        <span class="title-text">{{ isEditMode ? '圣典重铸仪式' : '神圣注魔仪式' }}</span>
        <span class="title-glow"></span>
      </h1>
      <p class="page-subtitle">{{ isEditMode ? '重塑你的智慧于机械神殿' : '将你的智慧注入机械神殿' }}</p>
      <div class="draft-status">
        <span v-if="draftSaving" class="draft-saving">💾 保存中...</span>
        <span v-else-if="draftSaved" class="draft-saved">✓ 草稿已保存</span>
        <span v-else class="draft-auto">⚡ 自动保存草稿</span>
      </div>
    </section>

    <section class="form-section">
      <form @submit.prevent="handleSubmit" class="sacred-form">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">⚔️</span>
            标题
          </label>
          <input 
            v-model="formData.title" 
            type="text" 
            class="form-input" 
            placeholder="输入圣典标题..."
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📜</span>
            分类
          </label>
          <select 
            v-model="formData.category" 
            class="form-input"
            required
          >
            <option value="" disabled>选择分类...</option>
            <option v-for="option in categoryOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📝</span>
            摘要
          </label>
          <textarea 
            v-model="formData.summary" 
            class="form-input form-textarea" 
            placeholder="简要描述圣典内容..."
            rows="3"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🖼️</span>
            封面图
          </label>
          
          <div class="cover-upload-section">
            <input 
              type="file" 
              ref="coverInput"
              accept="image/*" 
              @change="handleCoverSelect"
              style="display: none"
            />
            
            <button 
              type="button" 
              class="upload-btn"
              @click="$refs.coverInput.click()"
              :disabled="uploadingCover"
            >
              <span v-if="!uploadingCover">📷 选择封面</span>
              <span v-else>⏳ 上传中...</span>
            </button>
            
            <button 
              type="button" 
              class="preview-card-btn"
              @click="showCardPreview = true"
              :disabled="!formData.title"
            >
              👁️ 预览卡片
            </button>
            
            <div v-if="coverPreview" class="cover-preview-item">
              <img :src="coverPreview" alt="封面预览" />
              <div class="cover-controls">
                <select 
                  v-model="coverSize" 
                  class="cover-size-selector"
                >
                  <option value="none">无</option>
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
                <button 
                  type="button" 
                  class="copy-cover-url-btn"
                  @click="copyCoverUrl(coverPreview)"
                  title="复制封面URL"
                >
                  🔗
                </button>
                <button 
                  type="button" 
                  class="remove-cover-btn"
                  @click="removeCover"
                  title="删除封面"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🖼️</span>
            图片
          </label>
          
          <div class="image-upload-section">
            <input 
              type="file" 
              ref="fileInput"
              accept="image/*" 
              multiple
              @change="handleFileSelect"
              style="display: none"
            />
            
            <button 
              type="button" 
              class="upload-btn"
              @click="$refs.fileInput.click()"
              :disabled="uploadingImages"
            >
              <span v-if="!uploadingImages">📁 选择图片</span>
              <span v-else>⏳ 上传中...</span>
            </button>
            
            <div v-if="imagePreviews.length > 0" class="image-previews">
              <div 
                v-for="(preview, index) in imagePreviews" 
                :key="index"
                class="image-preview-item"
              >
                <img :src="preview" alt="预览" />
                <div class="image-controls">
                  <select 
                    v-model="imageSizes[index]" 
                    class="image-size-selector"
                  >
                    <option value="none">无</option>
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                  </select>
                  <button 
                    type="button" 
                    class="copy-image-url-btn"
                    @click="copyImageUrl(uploadedImageUrls[index], index)"
                    title="复制图片URL"
                  >
                    🔗
                  </button>
                  <button 
                    type="button" 
                    class="remove-image-btn"
                    @click="removeImage(index)"
                    title="删除图片"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">�</span>
            正文
          </label>
          
          <div class="toolbar">
            <button type="button" class="toolbar-btn" @click="insertBold" title="粗体">
              <strong>B</strong>
            </button>
            <button type="button" class="toolbar-btn" @click="insertItalic" title="斜体">
              <em>I</em>
            </button>
            <button type="button" class="toolbar-btn" @click="insertCode" title="行内代码">
              &lt;/&gt;
            </button>
            <button type="button" class="toolbar-btn" @click="insertCodeBlock" title="代码块">
              { }
            </button>
            <button type="button" class="toolbar-btn" @click="insertLink" title="链接">
              🔗
            </button>
            <button type="button" class="toolbar-btn" @click="insertImage" title="图片">
              🖼️
            </button>
            <button type="button" class="toolbar-btn" @click="insertQuote" title="引用">
              ❝
            </button>
            <button type="button" class="toolbar-btn" @click="insertList" title="列表">
              ☰
            </button>
            <button type="button" class="toolbar-btn" @click="insertHeading" title="标题">
              H
            </button>
            <button type="button" class="toolbar-btn" @click="insertTable" title="表格">
              ⊞
            </button>
          </div>

          <div class="split-container">
            <div class="editor-pane">
              <textarea 
                ref="editorRef"
                v-model="formData.content" 
                class="form-input editor-textarea" 
                placeholder="输入圣典正文内容..."
                rows="20"
                required
                @scroll="syncScroll"
              ></textarea>
            </div>
            <div class="preview-pane">
              <div 
                ref="previewRef"
                class="markdown-preview"
                v-html="renderedContent"
              ></div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🏷️</span>
            标签
          </label>
          
          <div class="tag-selector">
            <div class="selected-tags">
              <span 
                v-for="tag in selectedTags" 
                :key="tag" 
                class="tag-chip"
                @click="removeTag(tag)"
              >
                {{ tag }}
                <span class="tag-remove">×</span>
              </span>
            </div>
            
            <div class="tag-input-container">
              <input 
                v-model="tagSearch" 
                type="text" 
                class="tag-input"
                placeholder="搜索或输入新标签..."
                @focus="handleTagInputFocus"
                @blur="handleTagInputBlur"
              />
              <button 
                v-if="canAddNewTag && !addingNewTag"
                @click="addNewTag"
                class="add-tag-btn"
                type="button"
              >
                + 添加
              </button>
              <span v-else-if="addingNewTag" class="adding-tag-text">添加中...</span>
            </div>
            
            <div v-if="showTagDropdown && (filteredTags.length > 0 || canAddNewTag)" class="tag-dropdown">
              <div 
                v-for="tag in filteredTags" 
                :key="tag" 
                class="tag-option"
                @mousedown="toggleTag(tag)"
              >
                {{ tag }}
              </div>
              <div 
                v-if="canAddNewTag" 
                class="tag-option tag-option-new"
                @mousedown="addNewTag"
              >
                + 创建新标签 "{{ tagSearch }}"
              </div>
            </div>
          </div>
          <p class="form-hint">点击标签选择，或输入新标签后点击"添加"</p>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="submitting"
          >
            <span v-if="!submitting">{{ isEditMode ? '⚡ 重铸仪式' : '⚡ 注魔仪式' }}</span>
            <span v-else>⚙️ {{ isEditMode ? '重铸中...' : '注魔中...' }}</span>
          </button>
        </div>

        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>
      </form>
      
      <div v-for="notification in copyNotifications" :key="notification.id" class="copy-notification">
        <p>{{ notification.message }}</p>
        <p class="url-preview">{{ notification.url }}</p>
      </div>
    </section>
    
    <div v-if="showCardPreview" class="card-preview-overlay" @click.self="showCardPreview = false">
      <div class="card-preview-container">
        <div class="card-preview-header">
          <h3>文章卡片预览</h3>
          <button class="close-preview-btn" @click="showCardPreview = false">×</button>
        </div>
        
        <div class="post-card-preview">
          <div v-if="coverPreview" class="post-image-preview">
            <div 
              class="cover-image-wrapper"
              @mousedown="startDragCover"
              @mousemove="onDragCover"
              @mouseup="stopDragCover"
              @mouseleave="stopDragCover"
            >
              <img 
                :src="coverPreview" 
                alt="封面预览" 
                class="preview-image"
                :style="{ 
                  transform: `translate(${coverPosition.x}px, ${coverPosition.y}px) scale(${coverScale})` 
                }"
              />
            </div>
            <div class="cover-controls">
              <button class="zoom-btn" @click="zoomCover(-0.1)">➖</button>
              <span class="zoom-level">{{ Math.round(coverScale * 100) }}%</span>
              <button class="zoom-btn" @click="zoomCover(0.1)">➕</button>
              <button class="reset-position-btn" @click="resetCoverPosition">↺ 重置</button>
            </div>
          </div>
          
          <div class="post-header">
            <span class="post-category">{{ formData.category || '未分类' }}</span>
            <span class="post-date">{{ new Date().toLocaleDateString('zh-CN') }}</span>
          </div>
          
          <h4 class="post-title">{{ formData.title || '文章标题' }}</h4>
          <p class="post-excerpt">{{ formData.summary || '文章摘要...' }}</p>
          
          <div class="post-tags">
            <span v-for="tag in selectedTags" :key="tag" class="tag">{{ tag }}</span>
            <span v-if="selectedTags.length === 0" class="tag">暂无标签</span>
          </div>
          
          <a href="#" class="read-more">阅读更多</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.make-post-page {
  min-height: 100vh;
  padding: 40px 20px;
  position: relative;
  background: linear-gradient(135deg, rgba(0, 20, 0, 0.95) 0%, rgba(0, 40, 0, 0.9) 100%);
}

.back-button-container {
  margin-bottom: 40px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  background-color: #0a0a0a;
  border: 2px solid #00ff00;
  color: #00ff00;
  text-decoration: none;
  font-size: 1rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
}

.back-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

.back-button:hover::before {
  left: 100%;
}

.back-button:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.05);
}

.back-button-text {
  font-weight: 600;
}

.back-button svg {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.back-button:hover svg {
  transform: translateX(-3px);
}

.back-button:hover svg path {
  stroke: #0a0a0a;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

.page-title {
  font-size: 3rem;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 4px;
  font-weight: 700;
}

.title-text {
  position: relative;
  z-index: 2;
  color: #00ff00;
  text-shadow: 
    0 0 10px #00ff00,
    0 0 20px #00ff00,
    0 0 40px #00ff00,
    0 0 80px #00ff00;
}

.title-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(0, 255, 0, 0.3) 0%, transparent 70%);
  z-index: 1;
  filter: blur(20px);
  animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(0, 255, 0, 0.7);
  font-family: 'Rajdhani', sans-serif;
  letter-spacing: 2px;
  margin-top: 10px;
}

.draft-status {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.draft-saving,
.draft-saved,
.draft-auto {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: 'Rajdhani', sans-serif;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.draft-saving {
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  animation: pulse 1s ease-in-out infinite;
}

.draft-saved {
  color: #00ff00;
  background: rgba(0, 255, 0, 0.15);
  border: 1px solid #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.draft-auto {
  color: rgba(0, 255, 0, 0.5);
  background: rgba(0, 255, 0, 0.05);
  border: 1px dashed rgba(0, 255, 0, 0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.form-section {
  max-width: 1400px;
  margin: 0 auto;
}

.sacred-form {
  background: rgba(20, 15, 0, 0.8);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 10px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.1);
}

.form-group {
  margin-bottom: 30px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.label-icon {
  font-size: 18px;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  background: rgba(0, 40, 0, 0.6);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 5px;
  color: #00ff00;
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input::placeholder {
  color: rgba(0, 255, 0, 0.4);
}

.form-input:focus {
  border-color: #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  background: rgba(0, 40, 0, 0.8);
}

.form-input option {
  background: rgba(0, 40, 0, 0.95);
  color: #00ff00;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.toolbar-btn {
  padding: 8px 12px;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.toolbar-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  border-color: #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 500px;
}

.editor-pane,
.preview-pane {
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 5px;
  overflow: hidden;
  background: rgba(0, 20, 0, 0.6);
}

.editor-textarea {
  width: 100%;
  height: 500px;
  padding: 15px;
  background: rgba(0, 20, 0, 0.8);
  border: none;
  color: #00ff00;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.editor-textarea::placeholder {
  color: rgba(0, 255, 0, 0.3);
}

.markdown-preview {
  height: 500px;
  padding: 20px;
  overflow-y: auto;
  background: rgba(0, 20, 0, 0.8);
}

@media (max-width: 768px) {
  .split-container {
    grid-template-columns: 1fr;
  }
  
  .editor-textarea,
  .markdown-preview {
    height: 300px;
  }
}

.form-hint {
  font-size: 12px;
  color: rgba(0, 255, 0, 0.5);
  margin-top: 5px;
  font-family: 'Rajdhani', sans-serif;
}

.tag-selector {
  position: relative;
  width: 100%;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  min-height: 32px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(0, 255, 0, 0.15);
  border: 1px solid #00ff00;
  border-radius: 4px;
  color: #00ff00;
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  animation: tagGlow 2s ease-in-out infinite alternate;
}

@keyframes tagGlow {
  0% {
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
  }
}

.tag-chip:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: #ff3333;
  color: #ff3333;
  box-shadow: 0 0 15px rgba(255, 51, 51, 0.5);
}

.tag-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  transition: left 0.5s ease;
}

.tag-chip:hover::before {
  left: 100%;
}

.tag-remove {
  font-size: 18px;
  line-height: 1;
  font-weight: bold;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.tag-chip:hover .tag-remove {
  opacity: 1;
  transform: scale(1.2);
}

.tag-input-container {
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative;
}

.tag-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 6px;
  color: #00ff00;
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
  transition: all 0.3s ease;
  outline: none;
}

.tag-input:focus {
  border-color: #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
}

.tag-input::placeholder {
  color: rgba(0, 255, 0, 0.4);
}

.add-tag-btn {
  padding: 12px 20px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  border-radius: 6px;
  color: #00ff00;
  font-size: 14px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.add-tag-btn:hover {
  background: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
}

.adding-tag-text {
  color: rgba(0, 255, 0, 0.6);
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
  white-space: nowrap;
}

.tag-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00ff00;
  border-radius: 6px;
  margin-top: 8px;
  z-index: 100;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
  backdrop-filter: blur(10px);
}

.tag-dropdown::-webkit-scrollbar {
  width: 8px;
}

.tag-dropdown::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.5);
}

.tag-dropdown::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 0, 0.5);
  border-radius: 4px;
}

.tag-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 0, 0.8);
}

.tag-option {
  padding: 12px 16px;
  color: #00ff00;
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 255, 0, 0.1);
}

.tag-option:last-child {
  border-bottom: none;
}

.tag-option:hover {
  background: rgba(0, 255, 0, 0.2);
  padding-left: 20px;
  box-shadow: inset 3px 0 0 #00ff00;
}

.tag-option-new {
  color: #00ffff;
  font-weight: 600;
  border-top: 2px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 255, 255, 0.05);
}

.tag-option-new:hover {
  background: rgba(0, 255, 255, 0.2);
  box-shadow: inset 3px 0 0 #00ffff;
}

.form-actions {
  margin-top: 40px;
}

.submit-btn {
  width: 100%;
  padding: 18px 40px;
  background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 255, 0, 0.1) 100%);
  border: 2px solid #00ff00;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 255, 0, 0.3) 0%, rgba(0, 255, 0, 0.2) 100%);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
  transform: translateY(-2px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  margin-top: 20px;
  padding: 15px 20px;
  border-radius: 5px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  text-align: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background: rgba(0, 255, 0, 0.2);
  border: 2px solid #00ff00;
  color: #00ff00;
}

.message.error {
  background: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff0000;
  color: #ff0000;
}

.image-upload-section {
  margin-top: 10px;
}

.upload-btn {
  padding: 12px 30px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  color: #00ff00;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
}

.upload-btn:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.4);
  transform: translateY(-2px);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.image-preview-item {
  position: relative;
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background: rgba(0, 20, 0, 0.6);
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preview-item:hover img {
  transform: scale(1.05);
}

.copy-image-url-btn {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 28px;
  height: 28px;
  background: rgba(0, 255, 0, 0.8);
  border: 2px solid #00ff00;
  color: #0a0a0a;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.copy-image-url-btn:hover {
  background: #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
  transform: scale(1.1);
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 28px;
  height: 28px;
  background: rgba(255, 0, 0, 0.8);
  border: 2px solid #ff0000;
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.remove-image-btn:hover {
  background: #ff0000;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.6);
  transform: scale(1.1);
}

.image-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.85);
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-top: 1px solid rgba(0, 255, 0, 0.3);
}

.image-size-selector {
  background: rgba(0, 20, 0, 0.9);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.image-size-selector:hover {
  background: rgba(0, 40, 0, 0.9);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.image-size-selector:focus {
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
}

.image-size-selector option {
  background: #0a0a0a;
  color: #00ff00;
}

.copy-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  background: rgba(0, 40, 0, 0.95);
  border: 2px solid #00ff00;
  border-radius: 8px;
  color: #00ff00;
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  backdrop-filter: blur(10px);
  animation: slideInRight 0.3s ease;
  z-index: 2000;
  min-width: 300px;
  pointer-events: auto;
  display: block;
}

.copy-notification p {
  margin: 5px 0;
}

.copy-notification .url-preview {
  font-size: 12px;
  color: rgba(0, 255, 0, 0.7);
  word-break: break-all;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 255, 0, 0.2);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.cover-upload-section {
  margin-top: 10px;
}

.cover-preview-item {
  position: relative;
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background: rgba(0, 20, 0, 0.6);
  width: 150px;
  margin-top: 15px;
}

.cover-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-preview-item:hover img {
  transform: scale(1.05);
}

.cover-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.85);
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-top: 1px solid rgba(0, 255, 0, 0.3);
}

.copy-cover-url-btn {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 28px;
  height: 28px;
  background: rgba(0, 255, 0, 0.8);
  border: 2px solid #00ff00;
  color: #0a0a0a;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.copy-cover-url-btn:hover {
  background: #00ff00;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
  transform: scale(1.1);
}

.remove-cover-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 28px;
  height: 28px;
  background: rgba(255, 0, 0, 0.8);
  border: 2px solid #ff0000;
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.remove-cover-btn:hover {
  background: #ff0000;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.6);
  transform: scale(1.1);
}

.cover-size-selector {
  background: rgba(0, 20, 0, 0.9);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.cover-size-selector:hover {
  background: rgba(0, 40, 0, 0.9);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.cover-size-selector:focus {
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
}

.cover-size-selector option {
  background: #0a0a0a;
  color: #00ff00;
}

.cover-preview-container {
  position: relative;
  margin-top: 15px;
  display: inline-block;
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 20, 0, 0.6);
}

.cover-preview {
  max-width: 400px;
  max-height: 300px;
  display: block;
  object-fit: cover;
}

@media (max-width: 768px) {
  .image-previews {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .upload-btn {
    padding: 10px 20px;
    font-size: 12px;
  }
}

.preview-card-btn {
  padding: 10px 20px;
  background: rgba(0, 40, 0, 0.9);
  border: 2px solid #00ffff;
  color: #00ffff;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 10px;
}

.preview-card-btn:hover:not(:disabled) {
  background: rgba(0, 60, 0, 0.9);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  transform: translateY(-2px);
}

.preview-card-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.card-preview-container {
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00ff00;
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.3s ease;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.card-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
}

.card-preview-header h3 {
  margin: 0;
  color: #00ff00;
  font-size: 1.2rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.close-preview-btn {
  background: transparent;
  border: 2px solid #ff0000;
  color: #ff0000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.close-preview-btn:hover {
  background: #ff0000;
  color: #000;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
  transform: rotate(90deg);
}

.post-card-preview {
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #00ff00;
  padding: 30px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  transform: skewX(-2deg);
  transition: all 0.3s ease;
  cursor: pointer;
}

.post-card-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.2), transparent);
  transition: left 0.5s ease;
}

.post-card-preview:hover::before {
  left: 100%;
}

.post-card-preview:hover {
  transform: skewX(-2deg) translateY(-5px);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
  border-color: #00ffff;
}

.post-card-preview .post-image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid rgba(0, 255, 0, 0.3);
}

.post-card-preview .cover-image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: move;
  position: relative;
}

.post-card-preview .cover-image-wrapper:active {
  cursor: grabbing;
}

.post-card-preview .preview-image {
  width: auto;
  height: auto;
  min-width: 100%;
  min-height: 100%;
  object-fit: none;
  transition: transform 0.1s ease;
  user-select: none;
  pointer-events: none;
  position: relative;
}

.post-card-preview .cover-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-card-preview .zoom-btn {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff00;
  color: #00ff00;
  width: 28px;
  height: 28px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-card-preview .zoom-btn:hover {
  background: #00ff00;
  color: #000;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.post-card-preview .zoom-level {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 4px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  min-width: 45px;
  text-align: center;
}

.post-card-preview .reset-position-btn {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
}

.post-card-preview .reset-position-btn:hover {
  background: #00ff00;
  color: #000;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.post-card-preview .post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.post-card-preview .post-category {
  color: #ff00ff;
  text-shadow: 0 0 8px #ff00ff, 0 0 15px #ff00ff;
  font-weight: 600;
  position: relative;
}

.post-card-preview .post-category::after {
  content: '>';
  margin-left: 5px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.post-card-preview .post-date {
  color: #00ffff;
  text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff;
  font-weight: 500;
}

.post-card-preview .post-title {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #00ff00;
  font-weight: 600;
  letter-spacing: 1px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
  transform: skewX(2deg);
}

.post-card-preview .post-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #00ff00;
  transition: width 0.3s ease;
}

.post-card-preview:hover .post-title::after {
  width: 100%;
}

.post-card-preview .post-excerpt {
  color: #cccccc;
  line-height: 1.8;
  margin-bottom: 20px;
  font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-size: 0.95rem;
}

.post-card-preview .post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}

.post-card-preview .tag {
  background-color: transparent;
  color: #00ff00;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  border: 2px solid #00ff00;
  transition: all 0.3s ease;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.post-card-preview .tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  transition: left 0.5s ease;
}

.post-card-preview .tag:hover::before {
  left: 100%;
}

.post-card-preview .tag:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 20px #00ff00;
  transform: translateY(-2px) scale(1.05);
}

.post-card-preview .read-more {
  color: #00ffff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-right: 20px;
  transform: skewX(2deg);
}

.post-card-preview .read-more::after {
  content: '→';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s ease;
}

.post-card-preview .read-more:hover {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
  transform: skewX(2deg) translateX(5px);
}

.post-card-preview .read-more:hover::after {
  transform: translateY(-50%) translateX(5px);
}
</style>
