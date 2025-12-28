<template>
  <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const matrixCanvas = ref(null)
let animationId = null
let mouseX = -1000
let mouseY = -1000
let hoveredWords = []

// 【关键修改 1】：拆分网格宽高。高 16px 完美容纳 14px 字体，宽 10px 适合英文。
const cellWidth = 10 
const cellHeight = 16 
const fontSize = 14

let screenGridMap = []
let gridCells = []
let cols = 0
let rows = 0

onMounted(() => {
  initMatrix()
  document.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  document.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)
})

function handleMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function handleResize() {
  initMatrix()
}

// 获取单个字符占几个横向格子
function getCharCols(char, ctx) {
  const width = ctx.measureText(char).width
  return Math.ceil(width / cellWidth)
}

// 【关键修改 2】：动态计算整个单词需要的总宽度/高度
function canPlaceAt(startCol, startRow, direction, text, ctx) {
  let currentCol = startCol
  
  if (direction === 'horizontal') {
    // 预检：如果超出右边界
    // 我们需要预计算总长度，或者步进检查。步进检查更准。
    for (let i = 0; i < text.length; i++) {
      const w = getCharCols(text[i], ctx)
      if (currentCol + w > cols) return false
      // 检查被占用
      for (let c = 0; c < w; c++) {
        if (screenGridMap[startRow][currentCol + c]) return false
      }
      currentCol += w
    }
  } else {
    // 纵向：简单多了，因为宽是不变的（取最宽字符），高是行数
    // 为了安全，纵向单词我们取“最宽字符”作为这一列的宽度要求
    let maxW = 0
    for(let char of text) maxW = Math.max(maxW, getCharCols(char, ctx))
    
    if (startRow + text.length > rows || startCol + maxW > cols) return false

    for (let i = 0; i < text.length; i++) {
      for (let c = 0; c < maxW; c++) {
        if (screenGridMap[startRow + i][startCol + c]) return false
      }
    }
  }
  return true
}

// 【关键修改 3】：写入网格时，根据每个字符的真实宽度移动游标
function markCellsAsOccupied(startCol, startRow, direction, text, cellData, ctx) {
  let currentCol = startCol

  if (direction === 'horizontal') {
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const w = getCharCols(char, ctx)
      
      for (let c = 0; c < w; c++) {
        screenGridMap[startRow][currentCol + c] = true
        gridCells[startRow][currentCol + c] = {
          ...cellData,
          charToDisplay: char,
          isStart: (c === 0) // 只有字符起始格负责绘制
        }
      }
      currentCol += w // 游标移动！不会再叠在一起了
    }
  } else {
    // 纵向：取最大宽度锁定这一列
    let maxW = 0
    for(let char of text) maxW = Math.max(maxW, getCharCols(char, ctx))

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      for (let c = 0; c < maxW; c++) {
        screenGridMap[startRow + i][startCol + c] = true
        gridCells[startRow + i][startCol + c] = {
          ...cellData,
          charToDisplay: char, // 纵向每行存对应的字
          isStart: (c === 0) // 每行的第一列负责绘制
        }
      }
    }
  }
}

function findNextAvailablePosition(startCol, startRow, direction, text, ctx) {
  for (let row = startRow; row < rows; row++) {
    const startColForRow = (row === startRow) ? startCol : 0
    for (let col = startColForRow; col < cols; col++) {
      if (canPlaceAt(col, row, direction, text, ctx)) {
        return { col, row }
      }
    }
  }
  return null
}

function initMatrix() {
  if (animationId) cancelAnimationFrame(animationId)

  const canvas = matrixCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const englishWords = [
    'CODE', 'DATA', 'NODE', 'BYTE', 'MATRIX', 'LINUX', 'SHELL', 'ROOT', 'VUE', 'REACT', 
    'WEB3', 'CRYPTO', 'TOKEN', 'CHAIN', 'BLOCK', 'HASH', 'DEFI', 'NFT', 'DAO', 'SMART',
    'POLY', 'MARKET', 'GAS', 'DROP', 'USDC', 'LUCK', 'BET', 'WIN', 'RISK', 'ALPHA',
    'CYBER', 'PUNK', 'NEON', 'GLITCH', 'GHOST', 'SOUL', 'NET', 'LINK', 'SYNC', 'VOID'
  ]
  const japaneseWords = [
    'プログラム', 'データ', 'システム', 'ネットワーク', '未来', '技術', '革新', '電脳', 
    'ハッカー', 'セキュリティ', '接続', '切断', '仮想', '現実', '記憶', '存在',
    '暗号資産', '分散型', 'ブロック', 'チェーン', '契約', '採掘', '報酬', 'ガバナンス',
    '警告', 'エラー', 'バグ', '修復', '起動', '停止', '完了', '解析'
  ]

  // 【新增】半角片假名：Web3 黑客风的灵魂，专门用来填缝，致密且帅气
  // 这些字符宽度只有普通日文的一半，完美适配你的 10px 网格
  const halfWidthKana = [
    'ｱ', 'ｲ', 'ｳ', 'ｴ', 'ｵ', 'ｶ', 'ｷ', 'ｸ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ',
    'ﾀ', 'ﾁ', 'ﾂ', 'ﾃ', 'ﾄ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ', 'ﾉ', 'ﾊ', 'ﾋ', 'ﾌ', 'ﾍ', 'ﾎ',
    'ﾏ', 'ﾐ', 'ﾑ', 'ﾒ', 'ﾓ', 'ﾔ', 'ﾕ', 'ﾖ', 'ﾗ', 'ﾘ', 'ﾙ', 'ﾚ', 'ﾛ', 'ﾜ', 'ｦ', 'ﾝ'
  ]

  const shortEnglishWords = englishWords.filter(w => w.length <= 5)
  const shortJapaneseWords = japaneseWords.filter(w => w.length <= 5)

  ctx.font = `${fontSize}px "Fira Code", "Consolas", "Monaco", "Courier New", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`

  cols = Math.ceil(canvas.width / cellWidth)
  rows = Math.ceil(canvas.height / cellHeight)

  screenGridMap = Array(rows).fill().map(() => Array(cols).fill(false))
  gridCells = Array(rows).fill().map(() => Array(cols).fill(null))

  let wordIdCounter = 0

  function placeWord(text, direction, startCol, startRow) {
    if (!canPlaceAt(startCol, startRow, direction, text, ctx)) {
      return false
    }
    const cellData = { wordId: wordIdCounter++, direction }
    markCellsAsOccupied(startCol, startRow, direction, text, cellData, ctx)
    return true
  }

  function getRandomText(direction) {
    if (direction === 'vertical') {
      return Math.random() < 0.5 
        ? shortEnglishWords[Math.floor(Math.random() * shortEnglishWords.length)]
        : shortJapaneseWords[Math.floor(Math.random() * shortJapaneseWords.length)]
    } else {
      return Math.random() < 0.5 
        ? englishWords[Math.floor(Math.random() * englishWords.length)]
        : japaneseWords[Math.floor(Math.random() * japaneseWords.length)]
    }
  }

  function getRandomDirection() {
    return Math.random() < 0.4 ? 'vertical' : 'horizontal' // 稍微增加一点横向比例，更容易填满
  }

  function getRandomChar() {
    const text = getRandomText('horizontal')
    return text[Math.floor(Math.random() * text.length)]
  }

  // 【关键修改】：移除了瘦弱的标点，只用最硬核的字符填缝
  const denseFillers = ['0', '1', 'Z', 'X', 'Y', 'E', 'F', 'L', 'T']

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!screenGridMap[row][col]) {
        // 1. 优先尝试：随机方向的大单词
        const direction = getRandomDirection()
        const text = getRandomText(direction)
        if (placeWord(text, direction, col, row)) continue
        
        // 2. 失败后尝试：随机普通单字 (Horizontal)
        const char = getRandomChar()
        if (placeWord(char, 'horizontal', col, row)) continue
        
        // 3. 【致密填充核心】：尝试半角片假名 (绝对能填满视觉，不留黑洞)
        let filled = false
        // 随机挑几个试，不用全试，提升性能
        for (let k = 0; k < 5; k++) {
            const kana = halfWidthKana[Math.floor(Math.random() * halfWidthKana.length)]
            if (placeWord(kana, 'horizontal', col, row)) {
                filled = true
                break
            }
        }
        if (filled) continue

        // 4. 最后防线：用数字和致密字母硬填
        for (const filler of denseFillers) {
          if (placeWord(filler, 'horizontal', col, row)) break
        }
      }
    }
  }

  draw()
}

function draw() {
  const canvas = matrixCanvas.value
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = `${fontSize}px "Fira Code", "Consolas", "Monaco", "Courier New", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const currentTime = Date.now()

  let currentHoveredWordId = null
  let currentHoveredWordDirection = null

  if (mouseX >= 0 && mouseX <= canvas.width && mouseY >= 0 && mouseY <= canvas.height) {
    const col = Math.floor(mouseX / cellWidth)
    const row = Math.floor(mouseY / cellHeight)

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const cell = gridCells[row][col]
      if (cell && cell.wordId !== null) {
        currentHoveredWordId = cell.wordId
        currentHoveredWordDirection = cell.direction
      }
    }
  }

  if (currentHoveredWordId !== null) {
    const existingIndex = hoveredWords.findIndex(w => w.wordId === currentHoveredWordId)
    if (existingIndex !== -1) {
      hoveredWords[existingIndex].lastHoverTime = currentTime
      hoveredWords[existingIndex].direction = currentHoveredWordDirection
      const word = hoveredWords.splice(existingIndex, 1)[0]
      hoveredWords.push(word)
    } else {
      hoveredWords.push({
        wordId: currentHoveredWordId,
        direction: currentHoveredWordDirection,
        lastHoverTime: currentTime
      })
    }
  }

  hoveredWords = hoveredWords.filter(w => currentTime - w.lastHoverTime < 3000)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = gridCells[row][col]
      if (!cell || !cell.isStart) continue

      const x = col * cellWidth
      const y = row * cellHeight

      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
      let fadeFactor = Math.max(0, Math.min(1, (dist - 180) / 270))

      let glowIntensity = 0

      for (const hoveredWord of hoveredWords) {
        const timeSinceHover = currentTime - hoveredWord.lastHoverTime
        if (timeSinceHover < 3000) {
          const isMatch = (hoveredWord.direction === 'horizontal' && cell.wordId === hoveredWord.wordId) ||
                         (hoveredWord.direction === 'vertical' && cell.wordId === hoveredWord.wordId)
          if (isMatch) {
            const progress = timeSinceHover / 3000
            const fadeIntensity = 1 - progress
            glowIntensity = Math.max(glowIntensity, fadeIntensity)
          }
        }
      }

      const baseOpacity = 0.0375
      const maxOpacity = 1.0
      const opacity = (baseOpacity + glowIntensity * (maxOpacity - baseOpacity)) * fadeFactor

      ctx.shadowBlur = glowIntensity * 20
      ctx.shadowColor = '#00ff00'
      ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`
      ctx.fillText(cell.charToDisplay, Math.floor(x), Math.floor(y))
      ctx.shadowBlur = 0
    }
  }

  animationId = requestAnimationFrame(draw)
}

</script>

<style scoped>
.matrix-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
