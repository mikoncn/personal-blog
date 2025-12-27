<template>
  <footer class="footer">
    <p>© 2024 MIKON BLOG. All rights reserved.</p>
    <div class="social-links">
      <a href="#" class="social-link">GitHub</a>
      <a href="#" class="social-link">Twitter</a>
      <a href="#" class="social-link">LinkedIn</a>
      <a href="#" class="social-link">Email</a>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 40px 0;
  border-top: 2px solid #00ff00;
  margin-top: 60px;
  position: relative;
}

.footer p {
  margin-bottom: 20px;
  color: #cccccc;
  font-family: 'Rajdhani', sans-serif;
  letter-spacing: 1px;
  transform: skewX(-2deg);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.social-link {
  color: #00ff00;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 12px 24px;
  border: 1px solid #00ff00;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 1px;
  border-radius: 6px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 3px rgba(0, 255, 0, 0.3);
  transform: skewX(-2deg);
}

.social-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
  transition: left 0.4s ease;
}

.social-link:hover::before {
  left: 100%;
}

.social-link:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 20px #00ff00;
  transform: skewX(-2deg) scale(1.05);
}
</style>
