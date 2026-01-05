<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { supabase } from '../utils/supabase'
import { formatDateTime } from '../utils/dateFormatter'
import { useRouter } from 'vue-router'

const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
})

const router = useRouter()
const currentUser = inject('currentUser')
const comments = ref([])
const newComment = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref(null)

// 回复相关状态
const replyTarget = ref(null) // { id, username, parentId }

// 折叠状态管理 (使用 Set 存储已展开的评论 ID, 默认全部折叠)
const expandedIds = ref(new Set())

function isCollapsed(comment) {
  // 如果没有子评论，则始终显示（不折叠）
  const hasChildren = (comment.flattenedChildren && comment.flattenedChildren.length > 0) || 
                      (comment.children && comment.children.length > 0)
  
  if (!hasChildren) return false
  
  // 有子评论时，检查是否在展开集合中
  return !expandedIds.value.has(comment.id)
}

function toggleCollapse(comment) {
  if (expandedIds.value.has(comment.id)) {
    expandedIds.value.delete(comment.id)
  } else {
    expandedIds.value.add(comment.id)
  }
}

// 辅助：检查节点是否可见（即所有祖先都未折叠）
function isVisible(comment) {
  let p = comment.parent
  while (p) {
    if (isCollapsed(p)) return false
    p = p.parent
  }
  return true
}

// 计算属性：构建树形结构的评论列表
const nestedComments = computed(() => {
  if (!comments.value) return []
  
  // Clone to avoid mutation of reactive source
  // We attach extra properties (children, parent, depth) to these clones
  const processedComments = comments.value.map(c => ({ 
    ...c, 
    children: []
  }))
  
  const commentMap = new Map()
  const roots = []

  // 1. Map all comments
  processedComments.forEach(comment => {
    commentMap.set(comment.id, comment)
  })

  // 2. Build Tree
  processedComments.forEach(comment => {
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      const parent = commentMap.get(comment.parent_id)
      parent.children.push(comment)
    } else {
      roots.push(comment)
    }
  })
  
  // 3. Sort Roots by Date (Newest First)
  roots.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // 4. Process each root: Sort children recursively and flatten
  roots.forEach(root => {
    sortChildren(root)
    // Root has depth 0
    root.depth = 0
    root.parent = null
    root.flattenedChildren = flatten(root, 1)
  })

  return roots
})

// Recursive sort (Oldest First for conversation flow)
function sortChildren(comment) {
  if (comment.children && comment.children.length > 0) {
    comment.children.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    comment.children.forEach(sortChildren)
  }
}

// DFS Flattening to preserve conversation thread
function flatten(root, startDepth) {
  let result = []
  
  function traverse(cursor, depth, parent) {
    if (cursor.children && cursor.children.length > 0) {
      cursor.children.forEach(child => {
        child.depth = depth
        child.parent = parent // Link for collapse check
        child.replyToUser = cursor.profiles?.display_name
        
        result.push(child)
        traverse(child, depth + 1, child)
      })
    }
  }
  
  traverse(root, startDepth, root)
  return result
}

// 获取评论列表
async function fetchComments() {
  try {
    loading.value = true
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        parent_id,
        profiles:user_id (
          display_name
        )
      `)
      .eq('post_id', props.postId)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError
    comments.value = data
  } catch (err) {
    console.error('获取评论失败:', err)
  } finally {
    loading.value = false
  }
}

// 设置回复目标
function handleReply(comment) {
  // 检查用户是否已登录，未登录则跳转登录页
  if (!currentUser.value) {
    router.push('/login')
    return
  }
  
  // 设置回复的目标信息：ID、用户名和父评论ID
  // 这里的 parentId 指向该评论本身，作为新评论的 parent_id
  replyTarget.value = {
    id: comment.id,
    username: comment.profiles?.display_name || '匿名',
    parentId: comment.id 
  }
  
  // 滚动页面到评论输入框位置，以便用户直接输入
  const form = document.querySelector('.comment-form')
  if (form) form.scrollIntoView({ behavior: 'smooth' })
}

// 取消回复
function cancelReply() {
  replyTarget.value = null
}

// 提交评论
async function handleSubmit() {
  // 校验内容是否为空
  if (!newComment.value.trim()) return
  // 再次校验登录状态
  if (!currentUser.value) {
    router.push('/login')
    return
  }

  try {
    submitting.value = true
    error.value = null

    // 构建提交给后端的载荷
    const payload = {
      post_id: props.postId,
      user_id: currentUser.value.id,
      content: newComment.value.trim()
    }
    
    // 如果是回复现有评论，添加 parent_id 字段
    if (replyTarget.value) {
      payload.parent_id = replyTarget.value.parentId
    }

    const { data, error: insertError } = await supabase
      .from('comments')
      .insert(payload)
      .select()

    if (insertError) throw insertError

    await fetchComments()
    
    // 自动展开刚回复的评论（如果是回复的某个评论）
    if (replyTarget.value) {
       // Find the ancestor root or parent to expand?
       // For now, simpler to just ensure we can see it. But expandedIds takes ID.
       // Maybe we don't auto-expand for now based on strict user req.
    }
    
    newComment.value = ''
    replyTarget.value = null 
    
  } catch (err) {
    console.error('发布评论失败:', err)
    error.value = `发布失败: ${err.message}`
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (props.postId) {
    fetchComments()
  }
})
</script>

<template>
  <div class="comment-section">
    <h3 class="section-title">
      <span class="icon">💬</span> 
      <span class="text">加密通讯频道 ({{ comments.length }})</span>
    </h3>

    <!-- 评论输入框 -->
    <div class="comment-form">
      <div v-if="currentUser" class="input-area">
        <transition name="fade">
          <div v-if="replyTarget" class="reply-badge">
            <span>回复 @{{ replyTarget.username }}</span>
            <button @click="cancelReply" class="close-btn">×</button>
          </div>
        </transition>
        
        <textarea 
          v-model="newComment" 
          :placeholder="replyTarget ? `回复 @${replyTarget.username}...` : '输入传输数据...'"
          :disabled="submitting"
          rows="3"
        ></textarea>
        <div class="form-footer">
          <button @click="handleSubmit" :disabled="submitting || !newComment.trim()" class="submit-btn">
            {{ submitting ? '传输中...' : (replyTarget ? '回复信号' : '发送信号') }}
          </button>
        </div>
        <div v-if="error" class="error-msg">{{ error }}</div>
      </div>
      <div v-else class="login-prompt">
        <p>需要接入神经链路才能发送消息。</p>
        <button @click="router.push('/login')" class="login-btn">接入系统</button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-if="loading" class="loading-state">
        <div class="scanner"></div>
        <p>正在解密通讯数据...</p>
      </div>

      <div v-else-if="comments.length === 0" class="empty-state">
        <p>尚无通讯记录。成为第一个建立连接的人吧。</p>
      </div>

      <div v-else class="comment-threads">
        <div v-for="rootComment in nestedComments" :key="rootComment.id" class="thread-group">
          
          <!-- Root Comment -->
          <div class="comment-row root-row">
            <div class="comment-main">
              <!-- Collapse Toggle for Root -->
              <button 
                class="collapse-btn" 
                v-if="rootComment.flattenedChildren && rootComment.flattenedChildren.length > 0"
                @click="toggleCollapse(rootComment)"
              >
                {{ isCollapsed(rootComment) ? '[+]' : '[-]' }}
              </button>
              <div v-else class="collapse-spacer"></div>
              
              <div class="comment-avatar">
                <div class="avatar-placeholder">{{ (rootComment.profiles?.display_name || 'U')[0].toUpperCase() }}</div>
              </div>
              
              <div class="comment-content">
                <div class="comment-header">
                  <span class="username">{{ rootComment.profiles?.display_name || '匿名黑客' }}</span>
                  <span class="time">{{ formatDateTime(rootComment.created_at) }}</span>
                </div>
                
                <div v-if="!isCollapsed(rootComment)" class="comment-body">
                  {{ rootComment.content }}
                </div>
                <div v-else class="comment-collapsed-msg">
                  (已折叠 {{ rootComment.flattenedChildren.length }} 条回复)
                </div>

                <div v-if="!isCollapsed(rootComment)" class="comment-actions">
                  <button @click="handleReply(rootComment)" class="reply-link">回复</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Flattened Children -->
          <template v-if="!isCollapsed(rootComment)">
            <div 
              v-for="child in rootComment.flattenedChildren" 
              :key="child.id" 
              class="comment-row child-row"
              v-show="isVisible(child)"
            >
              <!-- Thread Guide Lines -->
              <div class="thread-lines">
                 <div class="line" v-for="n in child.depth" :key="n"></div>
              </div>

              <div class="comment-main indented">
                 <!-- Collapse Toggle for Child -->
                 <button 
                  class="collapse-btn small" 
                  @click="toggleCollapse(child)" 
                  v-if="child.children && child.children.length > 0"
                >
                  {{ isCollapsed(child) ? '[+]' : '[-]' }}
                </button>
                <!-- Spacer if no children to align avatar -->
                <div v-else class="collapse-spacer"></div>

                <div class="comment-avatar small">
                  <div class="avatar-placeholder small">{{ (child.profiles?.display_name || 'U')[0].toUpperCase() }}</div>
                </div>

                <div class="comment-content">
                  <div class="comment-header">
                    <span class="username">{{ child.profiles?.display_name || '匿名黑客' }}</span>
                    <!-- Optional: Show who they replied to if it's not the immediate parent in tree (but in our tree it is) -->
                    <!-- <span class="reply-target"> ► {{ child.replyToUser }}</span> -->
                    <span class="time">{{ formatDateTime(child.created_at) }}</span>
                  </div>

                  <div v-if="!isCollapsed(child)" class="comment-body">
                    {{ child.content }}
                  </div>
                  <div v-else class="comment-collapsed-msg">
                    (已折叠)
                  </div>

                  <div v-if="!isCollapsed(child)" class="comment-actions">
                    <button @click="handleReply(child)" class="reply-link">回复</button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-section {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid rgba(0, 255, 0, 0.2);
  font-family: 'Rajdhani', sans-serif;
  color: #ccc;
}

.section-title {
  color: #00ff00;
  font-size: 1.5rem;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

/* Form Styles */
.comment-form {
  margin-bottom: 40px;
  background: rgba(0, 20, 0, 0.5);
  border: 1px solid rgba(0, 255, 0, 0.3);
  padding: 20px;
  border-radius: 4px;
}

.input-area textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 0, 0.2);
  color: #00ff00;
  padding: 15px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  border-radius: 4px;
  margin-bottom: 15px;
}

.input-area textarea:focus {
  outline: none;
  border-color: #00ff00;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background: #00ff00;
  color: #000;
  border: none;
  padding: 8px 25px;
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.submit-btn:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

.reply-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 5px 10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.close-btn {
  background: none;
  border: none;
  color: #00ff00;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

/* Thread Styles */
.comment-threads {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Gap between root threads */
}

/* .thread-group { */
  /* Container for a full conversation tree */
/* } */

.comment-row {
  display: flex;
  margin-bottom: 0px; /* Compact rows */
}

.root-row {
  margin-bottom: 10px;
}

/* .child-row { */
  /* No margin bottom for children to keep lines connected */
/* } */

.thread-lines {
  display: flex;
  flex-shrink: 0;
}

.line {
  width: 20px; /* Width of each indentation level */
  border-right: 1px solid rgba(0, 255, 0, 0.1); /* The strict vertical guide line */
  height: 100%;
  flex-shrink: 0;
}

.line:hover {
  border-right-color: #00ff00; /* Highlight on hover */
}

.comment-main {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 4px;
  transition: background 0.2s;
}

.comment-main.indented {
  padding-left: 10px;
  /* Add a subtle highlight to distinguish from background */
  background: rgba(0, 255, 0, 0.02); 
}

.comment-main:hover {
  background: rgba(0, 255, 0, 0.05);
}

.collapse-btn {
  background: none;
  border: none;
  color: #666;
  font-family: monospace;
  cursor: pointer;
  padding: 0;
  margin-top: 5px;
  width: 20px;
  text-align: center;
}

.collapse-btn:hover {
  color: #00ff00;
}

.collapse-spacer {
  width: 20px;
}

.comment-avatar img, .avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 20, 0, 1);
  color: #00ff00;
  font-weight: bold;
}

.avatar-placeholder.small {
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
  border-color: rgba(0, 255, 255, 0.3);
  color: #00ffff;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.username {
  color: #00ff00;
  font-weight: bold;
}

.child-row .username {
  color: #00ffff; /* Different color for replies */
}

.time {
  color: #666;
  font-size: 0.8rem;
}

.comment-body {
  color: #ccc;
  line-height: 1.4;
  font-size: 0.95rem;
  white-space: pre-wrap;
  margin-bottom: 6px;
}

.comment-collapsed-msg {
  color: #666;
  font-style: italic;
  font-size: 0.85rem;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.reply-link {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  text-transform: uppercase;
}

.reply-link:hover {
  color: #00ff00;
  text-decoration: underline;
}

.loading-state, .empty-state, .login-prompt {
  text-align: center;
  padding: 20px;
  color: #666;
}

.login-btn {
  background: transparent;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 5px 15px;
  margin-top: 10px;
  cursor: pointer;
}

.scanner {
  height: 2px;
  width: 100px;
  background: #00ff00;
  margin: 0 auto 10px;
  animation: scan 1s infinite linear;
}

@keyframes scan {
  from { width: 0; opacity: 1; }
  to { width: 100px; opacity: 0; }
}

/* Responsive */
@media (max-width: 600px) {
  .line {
    width: 10px; /* Thinner lines on mobile */
  }
}
</style>
