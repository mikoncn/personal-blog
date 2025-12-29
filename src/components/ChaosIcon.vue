<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => ['khorne', 'nurgle', 'slaanesh', 'tzeentch'].includes(value.toLowerCase())
  },
  size: {
    type: String,
    default: '24px'
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  opacity: {
    type: Number,
    default: 1
  }
})

const iconMap = {
  khorne: 'Khorne.svg',
  nurgle: 'Nurgle.svg',
  slaanesh: 'Slaanesh.svg',
  tzeentch: 'Tzeentch.svg'
}

const iconPath = computed(() => {
  const fileName = iconMap[props.name.toLowerCase()]
  return `/${fileName}`
})

const iconStyle = computed(() => {
  const color = props.color
  const opacity = props.opacity
  
  let backgroundColor
  if (color.startsWith('rgba')) {
    backgroundColor = color
  } else {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
    if (result) {
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`
    } else {
      backgroundColor = `rgba(0, 255, 0, ${opacity})`
    }
  }
  
  return {
    width: props.size,
    height: props.size,
    maskImage: `url(${iconPath.value})`,
    WebkitMaskImage: `url(${iconPath.value})`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    backgroundColor
  }
})
</script>

<template>
  <div class="chaos-icon-inner" :style="iconStyle" :data-icon="name"></div>
</template>

<style scoped>
.chaos-icon-inner {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
