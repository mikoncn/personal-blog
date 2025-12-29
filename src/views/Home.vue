<script setup>
// 导入页面所需的所有组件
import Header from '../components/Header.vue'
import Hero from '../components/Hero.vue'
import PostsSection from '../components/PostsSection.vue'
import TechStack from '../components/TechStack.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <!-- 主内容容器，包含所有页面组件 -->
  <div class="container">
    <!-- 网站头部导航 -->
    <Header />
    
    <!-- 首页英雄区域，展示主题和号召性按钮 -->
    <Hero />
    
    <!-- 文章展示区域，显示最新文章预览 -->
    <PostsSection />
    
    <!-- 技术栈展示区域 -->
    <TechStack />
    
    <!-- 页脚区域 -->
    <Footer />
  </div>
</template>

<style scoped>
/* 主容器样式 */
.container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
