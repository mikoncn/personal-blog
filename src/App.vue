<script setup>
import MatrixRain from './components/MatrixRain.vue'
import Header from './components/Header.vue'
import Hero from './components/Hero.vue'
import PostsSection from './components/PostsSection.vue'
import TechStack from './components/TechStack.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <MatrixRain />
  <div class="container">
    <Header />
    <Hero />
    <PostsSection />
    <TechStack />
    <Footer />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 0, 0.03) 2px,
      rgba(0, 255, 0, 0.03) 4px
    );
  pointer-events: none;
  z-index: -2;
}

.container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, 
    transparent,
    rgba(0, 255, 0, 0.1),
    rgba(0, 255, 0, 0.3),
    rgba(0, 255, 0, 0.1),
    transparent
  );
  pointer-events: none;
  z-index: -1;
}
</style>
