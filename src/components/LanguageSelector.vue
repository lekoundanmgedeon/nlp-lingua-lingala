<template>
  <div class="lang-selector" role="group" aria-label="Target language">
    <button
      v-for="opt in options"
      :key="opt.code"
      class="lang-btn"
      :class="{ 'lang-btn--active': targetLang === opt.code }"
      :aria-pressed="targetLang === opt.code"
      @click="select(opt.code)"
    >
      <span class="lang-btn__flag">{{ opt.flag }}</span>
      <span class="lang-btn__label">{{ opt.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/store/chatStore'

const store = useChatStore()
const targetLang = computed(() => store.targetLang)

const options = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
]

function select(code) {
  store.setTargetLang(code)
}
</script>

<style scoped>
.lang-selector {
  display: flex;
  gap: 6px;
}

.lang-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  color: var(--green-300);
}

.lang-btn:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.2);
}

.lang-btn--active {
  background: var(--green-700);
  border-color: var(--green-500);
  color: var(--green-50);
}

.lang-btn__flag { font-size: 14px; line-height: 1; }
.lang-btn__label { font-size: 12px; }
</style>
