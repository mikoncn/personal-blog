<script setup>
import MatrixRain from '../components/MatrixRain.vue'
import Header from '../components/Header.vue'
import Hero from '../components/Hero.vue'
import PostsSection from '../components/PostsSection.vue'
import TechStack from '../components/TechStack.vue'
import Footer from '../components/Footer.vue'
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

<style scoped>
.container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
