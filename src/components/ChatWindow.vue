<template>
  <div class="chat-window" ref="containerRef" role="log" aria-label="Chat messages" aria-live="polite">

    <!-- ── Empty state ── -->
    <div v-if="!hasMessages" class="empty-state">
      <div class="empty-state__orb"></div>
      <h2 class="empty-state__title">Bonjour 👋</h2>
      <p class="empty-state__sub">
        Type a sentence in <strong>Lingala</strong> and get an instant translation,<br>
        sentiment analysis, and cultural context.
      </p>
      <div class="empty-state__examples">
        <p class="empty-state__examples-label">Try an example:</p>
        <div class="examples-grid">
          <button
            v-for="ex in examples"
            :key="ex.text"
            class="example-pill"
            @click="sendExample(ex.text)"
          >
            {{ ex.text }}
            <span class="example-pill__meaning">{{ ex.meaning }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Message list ── -->
    <MessageList v-else />

    <!-- ── Typing indicator ── -->
    <Transition name="typing">
      <div v-if="isTyping" class="typing-indicator">
        <div class="typing-indicator__avatar">AI</div>
        <div class="typing-indicator__bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
        <span class="typing-indicator__label">Analyzing…</span>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store/chatStore'
import { useScrollToBottom } from '@/composables/useScrollToBottom'
import MessageList from '@/components/MessageList.vue'

const store = useChatStore()
const { hasMessages, isTyping, messages } = storeToRefs(store)
const { containerRef, scrollToBottom } = useScrollToBottom()

const examples = [
  { text: 'Nazali na esengo mingi lelo.', meaning: 'I am very happy today.' },
  { text: 'Mboka na biso ezali kitoko.', meaning: 'Our country is beautiful.' },
  { text: 'Azali koloba malamu.', meaning: 'He speaks well.' },
  { text: 'Nalingi kosala mosala.', meaning: 'I want to work.' },
]

function sendExample(text) {
  store.sendMessage(text)
}

// Auto-scroll on new messages or typing
watch([messages, isTyping], () => scrollToBottom(), { flush: 'post' })
onMounted(() => scrollToBottom('instant'))
</script>

<style scoped>
.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0 8px;
  scroll-behavior: smooth;
  position: relative;
}

/* ── Empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 320px;
  padding: 40px 20px;
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.empty-state__orb {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, var(--green-400), var(--green-700));
  margin-bottom: 20px;
  box-shadow: 0 0 40px rgba(29,158,117,0.3);
}

.empty-state__title {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.empty-state__sub {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 360px;
  margin-bottom: 28px;
}

.empty-state__examples-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.examples-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 480px;
}

.example-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
  max-width: 220px;
}
.example-pill:hover {
  background: var(--bg-tertiary);
  border-color: var(--green-400);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.example-pill__meaning {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  font-style: italic;
}

/* ── Typing indicator ── */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 24px 16px;
  animation: fadeUp 0.2s ease;
}

.typing-indicator__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--green-800);
  color: var(--green-200);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.typing-indicator__bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--surface-ai);
  border: 1px solid var(--surface-ai-border);
  border-radius: 18px 18px 18px 4px;
  padding: 10px 14px;
  box-shadow: var(--shadow-sm);
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green-500);
  animation: dotBounce 1.2s infinite ease-in-out;
}
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }

.typing-indicator__label {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

/* ── Transitions ── */
.typing-enter-active,
.typing-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.typing-enter-from,
.typing-leave-to { opacity: 0; transform: translateY(4px); }
</style>
