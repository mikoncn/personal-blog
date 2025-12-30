import { createApp } from 'vue'
import './style.css'
import './assets/markdown.css'
import App from './App.vue'
import router from './router'

window.copyCode = async function(button) {
  const codeBlock = button.parentElement.querySelector('code')
  const codeText = codeBlock.textContent
  
  try {
    await navigator.clipboard.writeText(codeText)
    button.textContent = 'COPIED!'
    button.classList.add('copied')
    
    setTimeout(() => {
      button.textContent = 'COPY'
      button.classList.remove('copied')
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    button.textContent = 'FAILED'
    setTimeout(() => {
      button.textContent = 'COPY'
    }, 2000)
  }
}

window.checkHighlightStyles = function() {
  const testElement = document.createElement('div')
  testElement.className = 'markdown-content'
  testElement.innerHTML = '<span class="hljs-keyword">test</span>'
  document.body.appendChild(testElement)
  
  const computedStyle = window.getComputedStyle(testElement.querySelector('.hljs-keyword'))
  console.log('🎨 [Style Check] hljs-keyword color:', computedStyle.color)
  console.log('🎨 [Style Check] Expected: rgb(198, 120, 221) (#c678dd)')
  
  document.body.removeChild(testElement)
}

window.checkCodeBlockStyles = function() {
  const codeBlocks = document.querySelectorAll('.markdown-content pre code')
  console.log('🔍 [Code Block Check] Found', codeBlocks.length, 'code blocks')
  
  codeBlocks.forEach((codeBlock, index) => {
    const spans = codeBlock.querySelectorAll('span')
    console.log(`🔍 [Code Block ${index}] Found ${spans.length} span elements`)
    
    if (spans.length > 0) {
      const firstSpan = spans[0]
      const className = firstSpan.className
      const computedStyle = window.getComputedStyle(firstSpan)
      console.log(`🔍 [Code Block ${index}] First span class: "${className}"`)
      console.log(`🔍 [Code Block ${index}] First span color: ${computedStyle.color}`)
    }
  })
}

createApp(App).use(router).mount('#app')

setTimeout(() => {
  console.log('🔧 [Debug] Checking highlight.js styles...')
  window.checkHighlightStyles()
  setTimeout(() => {
    console.log('🔧 [Debug] Checking code block styles...')
    window.checkCodeBlockStyles()
  }, 500)
}, 1000)
