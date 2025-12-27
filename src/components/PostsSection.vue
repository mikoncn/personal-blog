<template>
  <section class="posts-section">
    <h3 class="section-title">最新文章</h3>
    <div class="posts-grid">
      <div 
        v-for="(post, index) in posts" 
        :key="index" 
        class="post-card"
      >
        <div class="post-header">
          <span class="post-category">{{ post.category }}</span>
          <span class="post-date">{{ post.date }}</span>
        </div>
        <h4 class="post-title">{{ post.title }}</h4>
        <p class="post-excerpt">{{ post.excerpt }}</p>
        <a href="#" class="read-more">阅读更多</a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const posts = ref([
  {
    category: '前端开发',
    date: '2024-01-15',
    title: 'Vue 3 组合式 API 深度解析',
    excerpt: '探索 Vue 3 的组合式 API 如何改变我们编写组件的方式，以及如何在实际项目中应用。'
  },
  {
    category: '人工智能',
    date: '2024-01-12',
    title: 'AI 辅助编程的未来',
    excerpt: '人工智能正在改变软件开发的方式，让我们看看这对开发者意味着什么。'
  },
  {
    category: '网络安全',
    date: '2024-01-10',
    title: '零信任架构实践指南',
    excerpt: '深入了解零信任安全模型，以及如何在企业环境中实施。'
  },
  {
    category: '云计算',
    date: '2024-01-08',
    title: 'Kubernetes 最佳实践',
    excerpt: '在生产环境中部署和管理 Kubernetes 集群的关键技巧和经验。'
  },
  {
    category: '区块链',
    date: '2024-01-05',
    title: 'Web3 开发入门',
    excerpt: '从零开始学习去中心化应用开发，探索区块链技术的无限可能。'
  },
  {
    category: '数据科学',
    date: '2024-01-03',
    title: '机器学习模型优化',
    excerpt: '提升模型性能的关键技术，包括特征工程、模型调优和部署策略。'
  }
])
</script>

<style scoped>
.posts-section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
  border-left: 4px solid #00ffff;
  padding-left: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  position: relative;
  transform: skewX(-3deg);
}

.section-title::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #00ffff, transparent);
  animation: title-glow 2s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.post-card {
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid #00ff00;
  padding: 30px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  transform: skewX(-2deg);
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.2), transparent);
  transition: left 0.5s ease;
}

.post-card:hover::before {
  left: 100%;
}

.post-card:hover {
  transform: skewX(-2deg) translateY(-5px);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
  border-color: #00ffff;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.post-category {
  color: #ff00ff;
  text-shadow: 0 0 8px #ff00ff, 0 0 15px #ff00ff;
  font-weight: 600;
  position: relative;
}

.post-category::after {
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

.post-date {
  color: #00ffff;
  text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff;
  font-weight: 500;
}

.post-title {
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

.post-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #00ff00;
  transition: width 0.3s ease;
}

.post-card:hover .post-title::after {
  width: 100%;
}

.post-excerpt {
  color: #cccccc;
  line-height: 1.8;
  margin-bottom: 20px;
  font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-size: 0.95rem;
}

.read-more {
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

.read-more::after {
  content: '→';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s ease;
}

.read-more:hover::after {
  transform: translateY(-50%) translateX(5px);
}

.read-more:hover {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
  transform: skewX(2deg) translateX(5px);
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }

  .post-title {
    font-size: 1.1rem;
    letter-spacing: 0.5px;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
