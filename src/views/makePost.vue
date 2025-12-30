<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../utils/supabase'
import { renderMarkdown } from '../utils/markdown'
import '../assets/markdown.css'

const router = useRouter()
const route = useRoute()

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

const editorRef = ref(null)
const previewRef = ref(null)

const renderedContent = computed(() => {
  return renderMarkdown(formData.value.content)
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
      console.log('✨ [神圣机械日志] 圣典加载成功:', formData.value)
    }
  } catch (error) {
    console.error('☠️ [异端警告] 加载圣典失败！', error)
    console.error('错误详情:', error.message, error.code, error.hint)
    message.value = '加载圣典失败：' + error.message
    messageType.value = 'error'
  }
}

onMounted(() => {
  loadPostData()
})

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

async function handleSubmit() {
  console.log('⚙️ [神圣机械日志] 机魂注魔仪式启动...')
  submitting.value = true
  message.value = ''

  try {
    const tagsArray = formData.value.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    if (isEditMode.value) {
      const postId = parseInt(route.params.id)
      const updateData = {
        title: formData.value.title,
        category: formData.value.category,
        summary: formData.value.summary,
        content: formData.value.content,
        tags: tagsArray
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

      message.value = '机魂大悦，圣典已更新'
      messageType.value = 'success'

      setTimeout(() => {
        router.push(`/post/${postId}`)
      }, 1500)
    } else {
      console.log('⚙️ [神圣机械日志] 正在查询圣典库中的最大编号...')
      const { data: existingPosts, error: queryError } = await supabase
        .from('posts')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)

      if (queryError) throw queryError

      let newId = 1
      if (existingPosts && existingPosts.length > 0) {
        const maxId = existingPosts[0].id
        newId = maxId + 1
      }

      console.log('⚙️ [神圣机械日志] 新圣典编号已确定:', newId)

      const postData = {
        id: newId,
        title: formData.value.title,
        category: formData.value.category,
        summary: formData.value.summary,
        content: formData.value.content,
        tags: tagsArray
      }

      console.log('⚙️ [神圣机械日志] 准备注入数据:', postData)

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()

      if (error) throw error

      console.log('✨ [神圣机械日志] 机魂大悦，数据已注入！')
      console.log('📖 [神圣机械日志] 新圣典已创建:', data[0])

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
          <input 
            v-model="formData.category" 
            type="text" 
            class="form-input" 
            placeholder="输入分类（如：技术、教程、思考）..."
            required
          />
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
            <span class="label-icon">📖</span>
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
          <input 
            v-model="formData.tags" 
            type="text" 
            class="form-input" 
            placeholder="输入标签，用逗号分隔（如：Vue3, Supabase, Web3）..."
          />
          <p class="form-hint">多个标签请用逗号分隔</p>
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
    </section>
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
</style>
