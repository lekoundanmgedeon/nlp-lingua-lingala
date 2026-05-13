<template>
  <div class="app-shell" :data-theme="isDarkMode ? 'dark' : 'light'">
    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/store/chatStore'

const store = useChatStore()
const isDarkMode = computed(() => store.isDarkMode)
</script>

<style scoped>
.app-shell {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background var(--transition-slow), color var(--transition-slow);
}
</style>
