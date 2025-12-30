<!-- 
  App.vue - 应用根组件
  作用：作为整个应用的入口组件，组合 MatrixRain 背景和路由视图
  包含：MatrixRain 背景动画组件、router-view 页面路由容器、全局样式
-->
<script setup>
// 导入 MatrixRain 背景动画组件，用于创建黑客帝国风格的绿色数字雨效果
import MatrixRain from './components/MatrixRain.vue'
</script>

<template>
  <!-- MatrixRain 组件：全屏背景动画，提供赛博朋克风格的视觉效果 -->
  <MatrixRain />
  
  <!-- router-view：Vue Router 的视图容器，根据当前路由动态渲染对应的页面组件 -->
  <!-- 例如：访问 '/' 显示 Home.vue，访问 '/posts' 显示 AllPosts.vue，访问 '/post/:id' 显示 PostDetail.vue -->
  <router-view />
</template>

<style>
/* 全局扫描线效果：在页面背景上创建细微的绿色水平线条，增强赛博朋克氛围 */
body::before {
  content: '';
  position: fixed; /* 固定定位，覆盖整个视口 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 使用 repeating-linear-gradient 创建重复的水平线条 */
  /* 透明 -> 透明 (2px) -> 半透明绿色 (2px) -> 半透明绿色 (4px)，形成扫描线效果 */
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 0, 0.03) 2px,
      rgba(0, 255, 0, 0.03) 4px
    );
  pointer-events: none; /* 允许点击穿透，不影响页面交互 */
  z-index: -2; /* 设置在所有内容之下 */
}

/* 容器样式：用于页面内容的布局容器 */
/* 注意：此样式在当前组件中未使用，保留以供未来扩展使用 */
.container {
  position: relative;
  z-index: 1; /* 确保内容在背景之上 */
  max-width: 1200px; /* 最大宽度限制，保证大屏幕上的可读性 */
  margin: 0 auto; /* 水平居中 */
  padding: 20px; /* 内边距，提供内容与边界的间距 */
}
</style>
