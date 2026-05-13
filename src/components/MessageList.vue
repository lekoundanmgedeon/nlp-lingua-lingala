<template>
  <TransitionGroup name="message" tag="div" class="message-list">
    <template v-for="(msg, index) in messages" :key="msg.id">

      <!-- Date divider -->
      <div
        v-if="showDateDivider(msg, messages[index - 1])"
        class="date-divider"
      >
        <span>{{ formatDate(msg.timestamp) }}</span>
      </div>

      <!-- User message -->
      <div v-if="msg.role === 'user'" class="message-row message-row--user">
        <div class="message-bubble message-bubble--user">
          <p class="message-bubble__text">{{ msg.text }}</p>
          <span class="message-bubble__meta">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </div>

      <!-- AI response -->
      <div v-else-if="msg.role === 'ai'" class="message-row message-row--ai">
        <div class="ai-avatar">AI</div>
        <div class="message-ai-card">
          <!-- Translation result -->
          <div class="ai-card__section ai-card__translation">
            <div class="ai-card__label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 8l6 6 6-6"/>
              </svg>
              Translation
              <span class="ai-card__badge-lang">{{ targetLangLabel }}</span>
            </div>
            <p class="ai-card__translation-text">{{ msg.translation }}</p>
          </div>

          <!-- Sentiment -->
          <div v-if="msg.sentiment" class="ai-card__section ai-card__sentiment">
            <div class="ai-card__label">Sentiment</div>
            <div class="sentiment-row">
              <span class="sentiment-badge" :class="`sentiment-badge--${msg.sentiment}`">
                <span class="sentiment-badge__dot"></span>
                {{ sentimentLabel(msg.sentiment) }}
              </span>
              <div v-if="msg.confidence !== null" class="confidence-bar-wrap">
                <div
                  class="confidence-bar"
                  :style="{ width: (msg.confidence * 100).toFixed(0) + '%' }"
                  :class="`confidence-bar--${msg.sentiment}`"
                ></div>
                <span class="confidence-pct">{{ (msg.confidence * 100).toFixed(0) }}%</span>
              </div>
              <span v-if="msg.intensity" class="intensity-label">{{ msg.intensity }}</span>
            </div>
          </div>

          <!-- Cultural explanation -->
          <div v-if="msg.explanation" class="ai-card__section ai-card__explanation">
            <div class="ai-card__label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Cultural note
            </div>
            <p class="ai-card__explanation-text">{{ msg.explanation }}</p>
          </div>

          <!-- Footer: meta + feedback -->
          <div class="ai-card__footer">
            <div class="ai-card__meta">
              <span v-if="msg.model_used" class="meta-chip">{{ msg.model_used }}</span>
              <span v-if="msg.latency_ms" class="meta-chip">{{ msg.latency_ms }}ms</span>
              <span class="meta-chip">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="feedback-btns">
              <button
                class="feedback-btn"
                :class="{ 'feedback-btn--active feedback-btn--up': msg.feedback === 'up' }"
                @click="handleFeedback(msg.id, 'up')"
                aria-label="Good translation"
              >👍</button>
              <button
                class="feedback-btn"
                :class="{ 'feedback-btn--active feedback-btn--down': msg.feedback === 'down' }"
                @click="handleFeedback(msg.id, 'down')"
                aria-label="Poor translation"
              >👎</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error card -->
      <div v-else-if="msg.role === 'error'" class="message-row message-row--ai">
        <div class="ai-avatar ai-avatar--error">!</div>
        <div class="error-card">
          <div class="error-card__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p class="error-card__title">Backend error</p>
            <p class="error-card__message">{{ msg.text }}</p>
          </div>
          <button class="error-card__retry" @click="retryLast">Retry</button>
        </div>
      </div>

    </template>
  </TransitionGroup>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store/chatStore'
import { useTimeFormat } from '@/composables/useTimeFormat'
import { submitFeedback } from '@/services/api'

const store = useChatStore()
const { messages, targetLangLabel } = storeToRefs(store)
const { formatTime, formatDate, isToday } = useTimeFormat()

function sentimentLabel(s) {
  return { positive: '+ Positive', negative: '– Negative', neutral: '○ Neutral' }[s] || s
}

function showDateDivider(current, prev) {
  if (!prev) return true
  const a = new Date(current.timestamp).toDateString()
  const b = new Date(prev.timestamp).toDateString()
  return a !== b
}

async function handleFeedback(messageId, rating) {
  store.setMessageFeedback(messageId, rating)
  try {
    await submitFeedback(messageId, rating)
  } catch (_) {
    // Non-critical: feedback submission failure is silent
  }
}

// Retry: find last user message and re-send
function retryLast() {
  const lastUser = [...messages.value].reverse().find((m) => m.role === 'user')
  if (lastUser) {
    // Remove the error message
    const errorIdx = messages.value.findIndex((m) => m.role === 'error')
    if (errorIdx > -1) messages.value.splice(errorIdx, 1)
    store.sendMessage(lastUser.text)
  }
}
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 20px 16px;
  max-width: 820px;
  margin: 0 auto;
  width: 100%;
}

/* ── Date divider ── */
.date-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0 4px;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.date-divider::before,
.date-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

/* ── Message rows ── */
.message-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.message-row--user {
  justify-content: flex-end;
}

/* ── User bubble ── */
.message-bubble--user {
  max-width: 68%;
  background: var(--surface-user);
  color: var(--text-on-green);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 4px var(--border-radius-lg);
  padding: 12px 16px;
  box-shadow: var(--shadow-sm);
  animation: slideInRight 0.22s ease;
}

.message-bubble__text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.55;
  margin-bottom: 4px;
}

.message-bubble__meta {
  font-size: 10px;
  opacity: 0.65;
  display: block;
  text-align: right;
  font-family: var(--font-mono);
}

/* ── AI avatar ── */
.ai-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--green-800);
  color: var(--green-200);
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 6px;
}
.ai-avatar--error {
  background: #7b2d26;
  color: #f1958a;
}

/* ── AI response card ── */
.message-ai-card {
  max-width: 74%;
  background: var(--surface-ai);
  border: 1px solid var(--surface-ai-border);
  border-radius: 4px var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  animation: slideInLeft 0.22s ease;
}

.ai-card__section {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
}
.ai-card__section:last-of-type { border-bottom: none; }

.ai-card__label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  margin-bottom: 7px;
}

.ai-card__badge-lang {
  margin-left: 4px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--green-100);
  color: var(--green-800);
  font-size: 9px;
  font-weight: 700;
}
[data-theme='dark'] .ai-card__badge-lang {
  background: var(--green-900);
  color: var(--green-300);
}

.ai-card__translation-text {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--text-primary);
}

/* ── Sentiment ── */
.sentiment-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.sentiment-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.sentiment-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.sentiment-badge--positive {
  background: var(--sentiment-positive-bg);
  color: var(--sentiment-positive-text);
}
.sentiment-badge--negative {
  background: var(--sentiment-negative-bg);
  color: var(--sentiment-negative-text);
}
.sentiment-badge--neutral {
  background: var(--sentiment-neutral-bg);
  color: var(--sentiment-neutral-text);
}

.confidence-bar-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
  max-width: 140px;
  background: var(--bg-tertiary);
  border-radius: 20px;
  height: 6px;
  position: relative;
  overflow: hidden;
}
.confidence-bar {
  height: 100%;
  border-radius: 20px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.confidence-bar--positive { background: var(--sentiment-positive); }
.confidence-bar--negative { background: var(--sentiment-negative); }
.confidence-bar--neutral  { background: var(--sentiment-neutral); }

.confidence-pct {
  position: absolute;
  right: 6px;
  font-size: 9px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  white-space: nowrap;
}

.intensity-label {
  font-size: 11px;
  font-style: italic;
  color: var(--text-muted);
  text-transform: capitalize;
}

/* ── Explanation ── */
.ai-card__explanation-text {
  font-size: 13px;
  line-height: 1.65;
  color: var(--text-secondary);
  font-style: italic;
  border-left: 2px solid var(--green-400);
  padding-left: 10px;
}

/* ── Footer ── */
.ai-card__footer {
  padding: 8px 14px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ai-card__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.meta-chip {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 2px 6px;
}

.feedback-btns {
  display: flex;
  gap: 4px;
}

.feedback-btn {
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 3px 7px;
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
  opacity: 0.6;
}
.feedback-btn:hover { opacity: 1; background: var(--bg-tertiary); }
.feedback-btn--active { opacity: 1; background: var(--bg-tertiary); border-color: var(--border-medium); }

/* ── Error card ── */
.error-card {
  max-width: 74%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: var(--sentiment-negative-bg);
  border: 1px solid rgba(192, 57, 43, 0.2);
  border-radius: 4px var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg);
  animation: slideInLeft 0.22s ease;
}

.error-card__icon {
  color: var(--sentiment-negative);
  flex-shrink: 0;
  margin-top: 2px;
}

.error-card__title {
  font-size: 12px;
  font-weight: 700;
  color: var(--sentiment-negative-text);
  margin-bottom: 3px;
}

.error-card__message {
  font-size: 13px;
  color: var(--sentiment-negative-text);
  line-height: 1.5;
}

.error-card__retry {
  margin-left: auto;
  padding: 6px 12px;
  background: var(--sentiment-negative);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity var(--transition-fast);
}
.error-card__retry:hover { opacity: 0.85; }

/* ── Transition ── */
.message-enter-active { animation: fadeUp 0.25s ease; }
.message-leave-active { transition: opacity 0.15s ease; }
.message-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 600px) {
  .message-list { padding: 0 12px 12px; }
  .message-bubble--user { max-width: 86%; }
  .message-ai-card { max-width: 92%; }
}
</style>
