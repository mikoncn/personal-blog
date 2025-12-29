<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: '1.2em'
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})

const iconMap = {
  'khorne': '/Khorne.svg',
  'nurgle': '/Nurgle.svg',
  'tzeentch': '/Tzeentch.svg',
  'slaanesh': '/Slaanesh.svg',
  'undivided': '/Chaos.svg',
  'aquila': '/Aquila.svg',
  'mechanicus': '/Mechanicus.svg'
}

const iconStyle = computed(() => {
  const iconName = props.name.toLowerCase()
  const fileUrl = iconMap[iconName] || iconMap['undivided']

  return {
    width: props.size,
    height: props.size,
    backgroundColor: props.color,
    maskImage: `url("${fileUrl}")`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    webkitMaskImage: `url("${fileUrl}")`,
    webkitMaskSize: 'contain',
    webkitMaskRepeat: 'no-repeat',
    webkitMaskPosition: 'center'
  }
})
</script>

<template>
  <i 
    class="chaos-icon" 
    :style="iconStyle" 
    :title="name" 
    role="img"
  ></i>
</template>

<style scoped>
.chaos-icon {
  display: inline-block;
  vertical-align: -0.2em;
}
</style>
