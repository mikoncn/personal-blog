<template>
  <!-- Matrix 风格雨效果画布 -->
  <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
</template>

<script setup>
// 导入 Vue 的响应式和生命周期钩子
import { ref, onMounted, onUnmounted } from 'vue'

// 画布引用
const matrixCanvas = ref(null)
// 动画帧 ID，用于取消动画
let animationId = null
// 鼠标位置坐标
let mouseX = -1000
let mouseY = -1000
// 字符数组
let characters = []

// 悬停单词跟踪数组，用于实现淡出效果
let hoveredWords = []

// 组件挂载时初始化
onMounted(() => {
  initMatrix()
  document.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理资源
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  document.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)
})

// 处理鼠标移动事件
function handleMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

// 处理窗口大小改变事件
function handleResize() {
  initMatrix()
}

// 初始化 Matrix 效果
function initMatrix() {
  // 取消之前的动画循环，防止多个动画同时运行
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  // 获取画布和上下文
  const canvas = matrixCanvas.value
  const ctx = canvas.getContext('2d')

  // 设置画布尺寸为窗口大小
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 英文单词列表
  const englishWords = [
    'CODE', 'DATA', 'NODE', 'BYTE', 'FILE', 'LINK', 'HOST', 'PORT',
    'WIFI', 'CLOUD', 'PIXEL', 'MATRIX', 'VECTOR', 'BINARY', 'SYSTEM',
    'NETWORK', 'SERVER', 'CLIENT', 'PROXY', 'SOCKET', 'PACKET', 'FRAME',
    'BUFFER', 'STREAM', 'THREAD', 'PROCESS', 'KERNEL', 'SHELL', 'BASH',
    'SCRIPT', 'PYTHON', 'JAVA', 'RUST', 'GOLANG', 'REACT', 'VUE', 'NODE',
    'DOCKER', 'KUBER', 'LINUX', 'UNIX', 'WINDOW', 'MACOS', 'ANDROID',
    'IOS', 'SWIFT', 'KOTLIN', 'FLUTTER', 'ANGULAR', 'WEBPACK', 'VITE',
    'GIT', 'GITHUB', 'GITLAB', 'DOCKER', 'KUBER', 'REDIS', 'MONGO',
    'MYSQL', 'POSTGR', 'SQLITE', 'ORACLE', 'CASSAN', 'DYNAMO', 'FIRE',
    'GRAPH', 'NEO4J', 'ELAST', 'SOLR', 'LUCENE', 'SPARK', 'HADOOP',
    'KAFKA', 'RABBIT', 'NATS', 'ZOOKEEP', 'CONSUL', 'ETCD', 'VAULT',
    'TERRAF', 'ANSIBL', 'CHEF', 'PUPPET', 'SALTST', 'JENKIN', 'GITLAB',
    'CIRCLE', 'TRAVIS', 'CODESH', 'VERCEL', 'NETLIF', 'HEROKU', 'AWS',
    'AZURE', 'GOOGLE', 'ALIBAB', 'TENCEN', 'BAIDU', 'CLOUDF', 'DIGITA',
    'OCEAN', 'LINODE', 'VULTR', 'HETZNE', 'SCALEW', 'OVH', 'ORACLE',
    'IBM', 'MICROS', 'REDHAT', 'UBUNTU', 'DEBIAN', 'FEDORA', 'CENTOS',
    'ARCH', 'GENTOO', 'SLACKW', 'ALPINE', 'BUSYBO', 'OPENSU', 'SUSE',
    'MINT', 'KALI', 'PARROT', 'BLACKA', 'WHONIX', 'TAILS', 'QUBES',
    'TORIZ', 'DEBIAN', 'UBUNTU', 'MINT', 'KALI', 'PARROT', 'BLACKA',
    'WHONIX', 'TAILS', 'QUBES', 'TORIZ', 'DEBIAN', 'UBUNTU', 'MINT',
    'KALI', 'PARROT', 'BLACKA', 'WHONIX', 'TAILS', 'QUBES', 'TORIZ'
  ]

  // 日文单词列表
  const japaneseWords = [
    'プログラム', 'コンピュータ', 'インターネット', 'ネットワーク', 'サーバー',
    'データベース', 'ソフトウェア', 'ハードウェア', 'オペレーティング',
    'システム', 'アプリケーション', 'ウェブサイト', 'ブラウザ', '検索エンジン',
    'クラウド', 'セキュリティ', 'パスワード', 'ユーザー', 'アカウント',
    'ログイン', 'ログアウト', '登録', '設定', '更新', '削除', '保存',
    'ダウンロード', 'アップロード', 'インストール', 'アンインストール',
    'バージョン', 'バックアップ', 'リカバリー', 'エラー', 'バグ', 'デバッグ',
    'コンパイル', 'ビルド', 'デプロイ', 'テスト', 'デバッグ', 'リファクタ',
    'コードレビュー', 'マージ', 'ブランチ', 'コミット', 'プッシュ', 'プル',
    'クローン', 'フォーク', 'リポジトリ', 'イシュー', 'プルリクエスト',
    'マイルストーン', 'リリース', 'タグ', 'バージョン', 'リリースノート',
    'ドキュメント', 'チュートリアル', 'ガイド', 'マニュアル', 'FAQ',
    'ヘルプ', 'サポート', 'フィードバック', 'バグレポート', '機能リクエスト',
    '改善提案', 'アイデア', 'コンセプト', 'デザイン', 'UI', 'UX', 'フロントエンド',
    'バックエンド', 'フルスタック', 'データサイエンス', '機械学習', '人工知能',
    'ディープラーニング', 'ニューラルネットワーク', 'アルゴリズム', 'データ構造',
    'データマイニング', 'ビッグデータ', 'データ分析', 'データ可視化', '統計',
    '確率', '線形代数', '微積分', '数理最適化', 'グラフ理論', '数理論理学',
    '形式言語', 'オートマトン', '計算理論', '計算機科学', '情報工学', '情報処理',
    '情報システム', '情報管理', '情報セキュリティ', 'ネットワークセキュリティ',
    'サイバーセキュリティ', '暗号化', '認証', 'アクセス制御', 'ファイアウォール',
    '侵入検知', '侵入防止', 'ウイルス対策', 'マルウェア対策', 'フィッシング対策',
    'ソーシャルエンジニアリング', '物理セキュリティ', '環境セキュリティ', '災害対策',
    'ビジネス継続', 'リスク管理', 'コンプライアンス', 'ガバナンス', '監査',
    '内部統制', '品質管理', 'プロジェクト管理', '要件定義', '設計', '開発',
    'テスト', '運用', '保守', '廃棄', 'ライフサイクル', 'アジャイル', 'スクラム',
    'カンバン', 'ウォーターフォール', 'スパイラル', 'プロトタイピング', 'MVP',
    'リーンスタートアップ', 'デザイン思考', 'サービスデザイン', 'UXデザイン',
    'UIデザイン', 'グラフィックデザイン', 'モーションデザイン', 'サウンドデザイン',
    'インタラクションデザイン', 'インダストリアルデザイン', 'プロダクトデザイン',
    'ブランドデザイン', 'マーケティング', 'セールス', 'ビジネス', '戦略',
    '経営', '管理', '組織', '人材', '採用', '育成', '評価', '報酬', '福利厚生',
    '労働環境', '働き方', 'ワークライフバランス', 'ダイバーシティ', 'インクルージョン',
    'エクイティ', 'サステナビリティ', 'ESG', 'CSR', 'SDGs', '気候変動',
    '環境保護', 'エネルギー', '再生可能エネルギー', '脱炭素', 'カーボンニュートラル',
    '循環型社会', '資源循環', '廃棄物', 'リサイクル', 'リユース', 'リデュース',
    'アップサイクル', 'ダウンサイクル', 'ゼロウェイスト', 'プラスチックフリー',
    '海洋プラスチック', 'マイクロプラスチック', '生物多様性', '生態系', '自然保護',
    '森林保全', '砂漠化防止', '水資源', '水不足', '水質汚染', '大気汚染', '土壌汚染',
    '騒音公害', '光害', '化学物質', '有害物質', '放射性物質', '原子力', '原発',
    '再生可能エネルギー', '太陽光', '風力', '水力', '地熱', 'バイオマス', '水素',
    '電気自動車', 'ハイブリッド', 'プラグインハイブリッド', '燃料電池', 'スマートグリッド',
    'スマートシティ', 'スマートホーム', 'IoT', 'AI', 'ロボット', 'ドローン',
    '自動運転', '5G', '6G', '衛星通信', '宇宙開発', '宇宙旅行', '火星', '月',
    'スペースシャトル', 'ロケット', '人工衛星', 'ISS', '宇宙ステーション', '宇宙飛行士',
    '宇宙観測', '天文学', '宇宙物理学', '量子力学', '相対性理論', '素粒子物理学',
    '原子核物理学', '核融合', '核分裂', '加速器', '粒子検出器', '観測装置', '望遠鏡',
    '顕微鏡', '電子顕微鏡', '走査型電子顕微鏡', '透過型電子顕微鏡', '原子間力顕微鏡',
    '走査型トンネル顕微鏡', 'X線回折', '電子線回折', '中性子回折', '分光法', 'スペクトル',
    '赤外線', '紫外線', 'X線', 'ガンマ線', '電波', '可視光', '光', '音', '振動',
    '波動', '電磁波', '重力波', 'ブラックホール', 'ホワイトホール', 'ワームホール',
    'タイムトラベル', 'パラレルワールド', '多次元', '弦理論', 'M理論', '超弦理論',
    '超重力理論', '大統一理論', '万物の理論', '量子重力', '量子コンピュータ', '量子暗号',
    '量子通信', '量子センサー', '量子メモリ', '量子インターネット', '量子AI', '量子機械学習'
  ]

  // 获取随机英文单词
  function getRandomEnglishWord() {
    return englishWords[Math.floor(Math.random() * englishWords.length)]
  }

  // 获取随机日文单词
  function getRandomJapaneseWord() {
    return japaneseWords[Math.floor(Math.random() * japaneseWords.length)]
  }

  // 获取随机文本（英文或日文）
  function getRandomText() {
    const rand = Math.random()
    if (rand < 0.5) {
      return getRandomEnglishWord()
    } else {
      return getRandomJapaneseWord()
    }
  }

  // 字体大小
  const fontSize = 14
  // 画布边距
  const margin = 2

  // 单元格宽度和高度
  const cellWidth = fontSize * 1.1
  const cellHeight = fontSize * 1.3

  // 计算网格的行数和列数
  const cols = Math.floor((canvas.width - margin * 2) / cellWidth)
  const rows = Math.floor((canvas.height - margin * 2) / cellHeight)

  // 初始化网格
  const grid = []
  for (let i = 0; i < rows; i++) {
    grid[i] = []
    for (let j = 0; j < cols; j++) {
      // 每个单元格存储字符、横向单词 ID 和纵向单词 ID
      grid[i][j] = { char: null, horizontalWordId: null, verticalWordId: null }
    }
  }

  // 重置字符数组和单词 ID 计数器
  characters = []
  let wordIdCounter = 0

  // 检查是否可以横向放置单词
  function canPlaceHorizontal(row, col, text) {
    // 检查是否超出右边界
    if (col + text.length > cols) return false
    // 检查每个位置是否冲突
    for (let k = 0; k < text.length; k++) {
      if (grid[row][col + k].char !== null && grid[row][col + k].char !== text[k]) {
        return false
      }
    }
    return true
  }

  // 检查是否可以纵向放置单词
  function canPlaceVertical(row, col, text) {
    // 检查是否超出下边界
    if (row + text.length > rows) return false
    // 检查每个位置是否冲突
    for (let k = 0; k < text.length; k++) {
      if (grid[row + k][col].char !== null && grid[row + k][col].char !== text[k]) {
        return false
      }
    }
    return true
  }

  // 横向放置单词
  function placeHorizontal(row, col, text) {
    const wordId = wordIdCounter++
    for (let k = 0; k < text.length; k++) {
      grid[row][col + k].char = text[k]
      grid[row][col + k].horizontalWordId = wordId
    }
  }

  // 纵向放置单词
  function placeVertical(row, col, text) {
    const wordId = wordIdCounter++
    for (let k = 0; k < text.length; k++) {
      grid[row + k][col].char = text[k]
      grid[row + k][col].verticalWordId = wordId
    }
  }

  // 尝试放置单词的次数
  const attempts = 8000
  for (let attempt = 0; attempt < attempts; attempt++) {
    const text = getRandomText()
    const isVertical = Math.random() < 0.5

    // 随机选择横向或纵向放置
    if (isVertical) {
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)
      if (canPlaceVertical(row, col, text)) {
        placeVertical(row, col, text)
      }
    } else {
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)
      if (canPlaceHorizontal(row, col, text)) {
        placeHorizontal(row, col, text)
      }
    }
  }

  // 填充剩余空单元格
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col].char === null) {
        const text = getRandomText()
        const randomChar = text[Math.floor(Math.random() * text.length)]
        grid[row][col].char = randomChar
      }
    }
  }

  // 绘制函数，每一帧调用
  function draw() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 设置字体
    ctx.font = `${fontSize}px "Segoe UI Symbol", "Arial Unicode MS", "Noto Sans", Arial, sans-serif`
    // 设置文本基线和对齐方式
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    let currentHoveredWordId = null
    let currentHoveredWordDirection = null

    // 1. 探测当前鼠标下的单词
    if (mouseX >= 0 && mouseX <= canvas.width && mouseY >= 0 && mouseY <= canvas.height) {
      const col = Math.floor((mouseX - margin) / cellWidth)
      const row = Math.floor((mouseY - margin) / cellHeight)

      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        const cell = grid[row][col]
        
        if (cell.horizontalWordId !== null || cell.verticalWordId !== null) {
          currentHoveredWordId = cell.horizontalWordId !== null ? cell.horizontalWordId : cell.verticalWordId
          currentHoveredWordDirection = cell.horizontalWordId !== null ? 'horizontal' : 'vertical'
        }
      }
    }

    // 2. 更新悬停单词数组
    const currentTime = Date.now()
    
    // 如果当前有悬停的单词，检查是否已经在数组中
    if (currentHoveredWordId !== null) {
      const existingIndex = hoveredWords.findIndex(w => w.wordId === currentHoveredWordId)
      if (existingIndex !== -1) {
        // 如果已存在，更新时间并移到数组末尾
        hoveredWords[existingIndex].lastHoverTime = currentTime
        hoveredWords[existingIndex].direction = currentHoveredWordDirection
        // 移到数组末尾
        const word = hoveredWords.splice(existingIndex, 1)[0]
        hoveredWords.push(word)
      } else {
        // 如果不存在，添加到数组末尾
        hoveredWords.push({
          wordId: currentHoveredWordId,
          direction: currentHoveredWordDirection,
          lastHoverTime: currentTime
        })
      }
    }

    // 3. 清理过期的单词（超过 3 秒）
    hoveredWords = hoveredWords.filter(w => currentTime - w.lastHoverTime < 3000)

    // 4. 渲染循环
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[row][col]
        if (cell.char === null) continue

        const x = margin + col * cellWidth + cellWidth / 2
        const y = margin + row * cellHeight + cellHeight / 2

        let glowIntensity = 0

        // 检查这个字符是否属于任何悬停的单词
        for (const hoveredWord of hoveredWords) {
          const timeSinceHover = currentTime - hoveredWord.lastHoverTime
          if (timeSinceHover < 3000) {
            const isMatch = (hoveredWord.direction === 'horizontal' && cell.horizontalWordId === hoveredWord.wordId) ||
                           (hoveredWord.direction === 'vertical' && cell.verticalWordId === hoveredWord.wordId)
            if (isMatch) {
              const progress = timeSinceHover / 3000
              const fadeIntensity = 1 - progress
              glowIntensity = Math.max(glowIntensity, fadeIntensity)
            }
          }
        }

        // 绘图逻辑
        const baseOpacity = 0.15
        const maxOpacity = 1.0
        const opacity = baseOpacity + glowIntensity * (maxOpacity - baseOpacity)
        
        ctx.shadowColor = '#00ff00'
        ctx.shadowBlur = glowIntensity * 20
        ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`
        ctx.fillText(cell.char, x, y)
      }
    }
    animationId = requestAnimationFrame(draw)
  }

  // 开始动画循环
  draw()
}
</script>

<style scoped>
/* Matrix 画布样式 */
.matrix-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
