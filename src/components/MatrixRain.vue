<template>
  <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
  <div class="chaos-icons-container">
    <ChaosIcon 
      v-for="icon in chaosIcons" 
      :key="icon.name"
      :name="icon.name"
      :color="icon.displayColor"
      :opacity="icon.opacity"
      :size="`${fontSize}px`"
      class="chaos-icon"
      :style="{
        left: `${icon.x}px`,
        top: `${icon.y}px`,
        filter: icon.glowIntensity ? `drop-shadow(0 0 ${icon.glowIntensity * 20}px ${icon.displayGlowColor})` : 'none'
      }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ChaosIcon from './ChaosIcon.vue'

const matrixCanvas = ref(null)
let animationId = null
let mouseX = -1000
let mouseY = -1000
let hoveredWords = []
let resizeTimeout = null

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '0, 255, 0'
}

// 混沌图标位置
const chaosIcons = ref([])

// 【关键修改 1】：拆分网格宽高。高 16px 完美容纳 14px 字体，宽 10px 适合英文。
const cellWidth = ref(10)
const cellHeight = ref(16)
const fontSize = 14

// 屏幕网格映射表，记录每个格子是否被占用
let screenGridMap = []
// 网格单元格数组，存储每个格子的字符和元数据
let gridCells = []
// 屏幕的列数和行数
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

// 处理鼠标移动事件，更新鼠标位置
function handleMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

// 处理窗口大小变化事件，重新初始化矩阵
function handleResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = setTimeout(() => {
    console.log('[MATRIX] 窗口大小改变，重新初始化矩阵')
    initMatrix()
  }, 300)
}

// 获取单个字符占几个横向格子
function getCharCols(char, ctx) {
  const width = ctx.measureText(char).width
  return Math.ceil(width / cellWidth.value)
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

// 查找下一个可用的位置来放置单词
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

// 初始化矩阵效果，设置画布尺寸和填充字符
function initMatrix() {
  console.log('[MATRIX] initMatrix 被调用')
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

  // 筛选短单词用于纵向排列
  const shortEnglishWords = englishWords.filter(w => w.length <= 5)
  const shortJapaneseWords = japaneseWords.filter(w => w.length <= 5)

  ctx.font = `${fontSize}px "Fira Code", "Consolas", "Monaco", "Courier New", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`

  // 计算网格行列数
  cols = Math.ceil(canvas.width / cellWidth.value)
  rows = Math.ceil(canvas.height / cellHeight.value)

  // 初始化网格映射表和单元格数组
  screenGridMap = Array(rows).fill().map(() => Array(cols).fill(false))
  gridCells = Array(rows).fill().map(() => Array(cols).fill(null))

  let wordIdCounter = 0

  // 【关键修改】：先生成混沌图标位置，标记为占用，这样文字就不会覆盖图标
  // 四个图标随机分布在Matrix中
  const iconNames = [
    { name: 'khorne', color: '#ff0000' },
    { name: 'nurgle', color: '#00ff00' },
    { name: 'slaanesh', color: '#ff00ff' },
    { name: 'tzeentch', color: '#0088ff' }
  ]
  chaosIcons.value = []
  
  console.log('[CHAOS ICONS] 开始生成图标，当前图标数量:', chaosIcons.value.length)
  
  for (const icon of iconNames) {
    let placed = false
    let attempts = 0
    const maxAttempts = 1000
    
    while (!placed && attempts < maxAttempts) {
      attempts++
      const randomRow = Math.floor(Math.random() * rows)
      const randomCol = Math.floor(Math.random() * cols)
      
      const iconWidthCells = Math.ceil(fontSize / cellWidth.value)
      const iconHeightCells = Math.ceil(fontSize / cellHeight.value)
      
      let canPlace = true
      for (let r = 0; r < iconHeightCells && (randomRow + r) < rows; r++) {
        for (let c = 0; c < iconWidthCells && (randomCol + c) < cols; c++) {
          if (screenGridMap[randomRow + r][randomCol + c]) {
            canPlace = false
            break
          }
        }
        if (!canPlace) break
      }
      
      if (canPlace) {
        for (let r = 0; r < iconHeightCells && (randomRow + r) < rows; r++) {
          for (let c = 0; c < iconWidthCells && (randomCol + c) < cols; c++) {
            screenGridMap[randomRow + r][randomCol + c] = true
          }
        }
        
        chaosIcons.value.push({
          name: icon.name,
          color: icon.color,
          row: randomRow,
          col: randomCol,
          x: randomCol * cellWidth.value,
          y: randomRow * cellHeight.value + (cellHeight.value - fontSize) / 2,
          opacity: 0.0375,
          glowIntensity: 0,
          displayColor: '#00ff00',
          displayGlowColor: '#00ff00'
        })
        placed = true
        console.log(`[CHAOS ICONS] 添加图标: ${icon.name}, 位置: row=${randomRow}, col=${randomCol}, 占用范围: ${iconWidthCells}x${iconHeightCells} 格子`)
      }
    }
  }
  
  console.log('[CHAOS ICONS] 图标生成完成，最终图标数量:', chaosIcons.value.length)

  // 尝试在指定位置放置单词
  function placeWord(text, direction, startCol, startRow) {
    if (!canPlaceAt(startCol, startRow, direction, text, ctx)) {
      return false
    }
    const cellData = { wordId: wordIdCounter++, direction }
    markCellsAsOccupied(startCol, startRow, direction, text, cellData, ctx)
    return true
  }

  // 根据方向获取随机文本
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

  // 获取随机方向，横向概率更高以便填满屏幕
  function getRandomDirection() {
    return Math.random() < 0.4 ? 'vertical' : 'horizontal' // 稍微增加一点横向比例，更容易填满
  }

  // 获取随机字符
  function getRandomChar() {
    const text = getRandomText('horizontal')
    return text[Math.floor(Math.random() * text.length)]
  }

  // 【关键修改】：移除了瘦弱的标点，只用最硬核的字符填缝
  const denseFillers = ['0', '1', 'Z', 'X', 'Y', 'E', 'F', 'L', 'T']

  // 遍历所有格子，尝试放置单词或字符
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

// 绘制每一帧的矩阵效果
function draw() {
  const canvas = matrixCanvas.value
  const ctx = canvas.getContext('2d')

  // 绘制半透明黑色背景，实现淡出效果
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 设置字体样式
  ctx.font = `${fontSize}px "Fira Code", "Consolas", "Monaco", "Courier New", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  // 计算屏幕中心和当前时间
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const currentTime = Date.now()

  // 获取当前鼠标悬停的单词
  let currentHoveredWordId = null
  let currentHoveredWordDirection = null

  // 检查鼠标是否在画布范围内
  if (mouseX >= 0 && mouseX <= canvas.width && mouseY >= 0 && mouseY <= canvas.height) {
    const col = Math.floor(mouseX / cellWidth.value)
    const row = Math.floor(mouseY / cellHeight.value)

    // 获取鼠标位置对应的格子
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const cell = gridCells[row][col]
      if (cell && cell.wordId !== null) {
        currentHoveredWordId = cell.wordId
        currentHoveredWordDirection = cell.direction
      }
    }
  }

  // 更新悬停单词列表
  if (currentHoveredWordId !== null) {
    const existingIndex = hoveredWords.findIndex(w => w.wordId === currentHoveredWordId)
    if (existingIndex !== -1) {
      // 更新已存在的悬停单词
      hoveredWords[existingIndex].lastHoverTime = currentTime
      hoveredWords[existingIndex].direction = currentHoveredWordDirection
      const word = hoveredWords.splice(existingIndex, 1)[0]
      hoveredWords.push(word)
    } else {
      // 添加新的悬停单词
      hoveredWords.push({
        wordId: currentHoveredWordId,
        direction: currentHoveredWordDirection,
        lastHoverTime: currentTime
      })
    }
  }

  // 移除超过3秒的悬停单词
  hoveredWords = hoveredWords.filter(w => currentTime - w.lastHoverTime < 3000)

  // 遍历所有格子并绘制字符
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = gridCells[row][col]
      if (!cell || !cell.isStart) continue

      const x = col * cellWidth.value
      const y = row * cellHeight.value

      // 计算距离屏幕中心的距离，用于边缘淡出效果
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
      let fadeFactor = Math.max(0, Math.min(1, (dist - 180) / 270))

      // 计算发光强度
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

      // 计算最终透明度
      const baseOpacity = 0.0375
      const maxOpacity = 1.0
      const opacity = (baseOpacity + glowIntensity * (maxOpacity - baseOpacity)) * fadeFactor

      // 绘制字符，带发光效果
      ctx.shadowBlur = glowIntensity * 20
      ctx.shadowColor = '#00ff00'
      ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`
      ctx.fillText(cell.charToDisplay, Math.floor(x), Math.floor(y))
      ctx.shadowBlur = 0
    }
  }

  // 更新混沌图标的透明度、发光效果和颜色
  chaosIcons.value.forEach(icon => {
    const x = icon.col * cellWidth.value
    const y = icon.row * cellHeight.value
    
    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
    let fadeFactor = Math.max(0, Math.min(1, (dist - 180) / 270))
    
    let glowIntensity = 0
    for (const hoveredWord of hoveredWords) {
      const timeSinceHover = currentTime - hoveredWord.lastHoverTime
      if (timeSinceHover < 3000) {
        const progress = timeSinceHover / 3000
        const fadeIntensity = 1 - progress
        glowIntensity = Math.max(glowIntensity, fadeIntensity)
      }
    }
    
    const iconWidth = fontSize
    const iconHeight = fontSize
    const iconX = x
    const iconY = y + (cellHeight.value - fontSize) / 2
    
    const isHovered = mouseX >= iconX && mouseX <= iconX + iconWidth &&
                     mouseY >= iconY && mouseY <= iconY + iconHeight
    
    if (isHovered) {
      glowIntensity = Math.max(glowIntensity, 1)
    }
    
    const baseOpacity = 0.0375
    const maxOpacity = 1.0
    icon.opacity = (baseOpacity + glowIntensity * (maxOpacity - baseOpacity)) * fadeFactor
    icon.glowIntensity = glowIntensity
    
    if (isHovered) {
      icon.displayColor = icon.color
      icon.displayGlowColor = icon.color
    } else {
      icon.displayColor = '#00ff00'
      icon.displayGlowColor = '#00ff00'
    }
  })

  // 请求下一帧动画
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

.chaos-icons-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.chaos-icon {
  position: absolute;
  display: inline-block;
  transition: opacity 0.3s ease, filter 0.3s ease;
}
</style>
