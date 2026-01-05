import { createApp } from 'vue'
import './style.css'
import './assets/markdown.css'
import App from './App.vue'
import router from './router'
import { siteConfig } from './data/config'

// Apply Site Config
if (siteConfig.title) {
  document.title = siteConfig.title
}

if (siteConfig.favicon) {
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = siteConfig.favicon
}

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

createApp(App).use(router).mount('#app')
