import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import katex from 'katex'
import markdownItKatex from 'markdown-it-katex'

import 'katex/dist/katex.min.css'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    console.log('🔍 [Highlight] Processing code block, language:', lang)
    let code = str
    
    code = code.replace(/^\n+|\n+$/g, '')
    code = code.replace(/\n\s*\n+/g, '\n')
    code = code.replace(/\n{2,}/g, '\n')
    code = code.replace(/[ \t]+$/gm, '')
    
    console.log('🔍 [Highlight] Code after cleanup, length:', code.length)
    console.log('🔍 [Highlight] Code preview (first 100 chars):', code.substring(0, 100))
    
    let result = null
    let detectedLang = lang
    
    if (lang && hljs.getLanguage(lang)) {
      try {
        result = hljs.highlight(code, { language: lang, ignoreIllegals: true })
        console.log('✅ [Highlight] Successfully highlighted:', lang)
      } catch (error) {
        console.error('❌ [Highlight] Error highlighting:', error)
      }
    } else {
      console.log('⚠️ [Highlight] Language not found or not specified, trying auto-detection')
      try {
        result = hljs.highlightAuto(code)
        detectedLang = result.language || 'auto'
        console.log('✅ [Highlight] Auto-detected language:', detectedLang)
      } catch (error) {
        console.error('❌ [Highlight] Auto-detection failed:', error)
      }
    }
    
    if (result) {
      console.log('📝 [Highlight] First 200 chars:', result.value.substring(0, 200))
      console.log('🔍 [Highlight] Full HTML length:', result.value.length)
      const html = `<pre class="hljs code-block-wrapper"><button class="copy-btn" onclick="copyCode(this)">COPY</button><code class="hljs">${result.value}</code></pre>`
      console.log('🔍 [Highlight] Generated HTML:', html.substring(0, 300))
      return html
    }
    
    return `<pre class="hljs code-block-wrapper"><button class="copy-btn" onclick="copyCode(this)">COPY</button><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`
  }
})

md.use(markdownItKatex)

export function renderMarkdown(content) {
  return md.render(content)
}

export default md
