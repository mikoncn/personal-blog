<template>
  <section class="hero">
    <h2 class="hero-title">Welcome to MikonDAO</h2>
    <p class="hero-subtitle">Governance by one, for the vibe</p>
    <button class="cta-button">开启远征</button>
  </section>
</template>

<script setup>
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 60px 20px;
  margin-bottom: 60px;
  border: 1px solid #00ff00;
  background: rgba(0, 255, 0, 0.05);
  animation: pulse 2s infinite;
  position: relative;
  border-radius: 20px;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 255, 0, 0.6);
  }
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff;
  font-weight: 700;
  letter-spacing: 3px;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  /* text-transform: uppercase; Removed to allow mixed case */
  position: relative;
  display: inline-block;
  transform: skewX(-3deg);
}

.hero-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  animation: line-expand 2s ease-in-out infinite;
}

@keyframes line-expand {
  0%, 100% {
    transform: scaleX(0.5);
    opacity: 0.5;
  }
  50% {
    transform: scaleX(1);
    opacity: 1;
  }
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #ff00ff;
  text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff;
  font-weight: 400;
  letter-spacing: 2px;
  font-family: 'Rajdhani', sans-serif;
  text-transform: uppercase;
  transform: skewX(-2deg);
}

.cta-button {
  background-color: transparent;
  color: #00ff00;
  border: 2px solid #00ff00;
  padding: 15px 40px;
  font-size: 1.1rem;
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transform: skewX(-3deg);
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
  transition: left 0.5s ease;
}

.cta-button:hover::before {
  left: 100%;
}

.cta-button:hover {
  background-color: #00ff00;
  color: #0a0a0a;
  box-shadow: 0 0 30px #00ff00;
  transform: skewX(-3deg) scale(1.1);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.8rem;
    letter-spacing: 2px;
  }

  .hero-subtitle {
    font-size: 1rem;
    letter-spacing: 1px;
  }
}
</style>
