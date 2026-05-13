<template>
  <div class="message-input" :class="{ 'message-input--focused': isFocused }">

    <!-- Error banner (inline) -->
    <Transition name="error-banner">
      <div v-if="error && !isLoading" class="error-banner">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
        <button class="error-banner__close" @click="clearError">✕</button>
      </div>
    </Transition>

    <div class="input-row">
      <!-- Textarea -->
      <div class="textarea-wrap">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          class="input-textarea"
          :placeholder="placeholder"
          :disabled="isLoading"
          :maxlength="maxLength"
          rows="1"
          @keydown.enter.exact.prevent="handleSend"
          @keydown.enter.shift.exact="() => {}"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @input="autoResize"
          aria-label="Enter text in Lingala"
        ></textarea>

        <!-- Character count -->
        <div class="char-count" :class="{ 'char-count--warn': charCountWarn }">
          {{ inputText.length }}/{{ maxLength }}
        </div>
      </div>

      <!-- Send button -->
      <button
        class="send-btn"
        :class="{ 'send-btn--active': canSend }"
        :disabled="!canSend"
        @click="handleSend"
        aria-label="Send message"
      >
        <Transition name="spinner" mode="out-in">
          <svg v-if="!isLoading" key="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <svg v-else key="spin" class="spinning" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 12a9 9 0 1 1-9-9"/>
          </svg>
        </Transition>
      </button>
    </div>

    <!-- Hint -->
    <p class="input-hint">
      <kbd>Enter</kbd> to send &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> for new line
    </p>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store/chatStore'

const store = useChatStore()
const { isLoading, error, targetLang } = storeToRefs(store)

const inputText = ref('')
const isFocused = ref(false)
const textareaRef = ref(null)
const maxLength = 600

const placeholder = computed(() =>
  `Type in Lingala… (→ ${targetLang.value === 'fr' ? 'French' : 'English'})`
)

const canSend = computed(
  () => inputText.value.trim().length > 0 && !isLoading.value
)

const charCountWarn = computed(
  () => inputText.value.length > maxLength * 0.85
)

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

async function handleSend() {
  if (!canSend.value) return
  const text = inputText.value.trim()
  inputText.value = ''
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.focus()
  }
  store.sendMessage(text)
}

function clearError() {
  store.clearError()
}
</script>

<style scoped>
.message-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all var(--transition-fast);
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.textarea-wrap {
  flex: 1;
  position: relative;
}

.input-textarea {
  width: 100%;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-medium);
  border-radius: var(--border-radius-lg);
  padding: 12px 46px 12px 16px;
  font-family: var(--font-ui);
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.55;
  resize: none;
  outline: none;
  transition: border-color var(--transition-fast), background var(--transition-fast);
  min-height: 48px;
  max-height: 160px;
  overflow-y: auto;
}

.input-textarea::placeholder { color: var(--text-muted); }

.message-input--focused .input-textarea {
  border-color: var(--green-500);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(29, 158, 117, 0.12);
}

.input-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.char-count {
  position: absolute;
  bottom: 9px;
  right: 12px;
  font-size: 9px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  pointer-events: none;
  transition: color var(--transition-fast);
}
.char-count--warn { color: #c0392b; }

/* ── Send button ── */
.send-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1.5px solid var(--border-medium);
  background: var(--bg-secondary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.send-btn--active {
  background: var(--green-700);
  border-color: var(--green-600);
  color: var(--green-50);
  box-shadow: 0 2px 12px rgba(15,110,86,0.35);
}
.send-btn--active:hover {
  background: var(--green-600);
  transform: scale(1.05);
}

.send-btn:disabled:not(.send-btn--active) { cursor: not-allowed; }

.spinning { animation: spin 0.8s linear infinite; }

/* ── Error banner ── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  background: var(--sentiment-negative-bg);
  border: 1px solid rgba(192,57,43,0.25);
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  color: var(--sentiment-negative-text);
}
.error-banner__close {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--sentiment-negative-text);
  font-size: 11px;
  opacity: 0.7;
  padding: 2px 4px;
}
.error-banner__close:hover { opacity: 1; }

.error-banner-enter-active,
.error-banner-leave-active { transition: all 0.2s ease; }
.error-banner-enter-from,
.error-banner-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Spinner transition ── */
.spinner-enter-active,
.spinner-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.spinner-enter-from,
.spinner-leave-to { opacity: 0; transform: scale(0.8); }

/* ── Hint ── */
.input-hint {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}
kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-medium);
  border-radius: 3px;
  padding: 1px 5px;
}
</style>
