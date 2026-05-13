<template>
  <div class="chat-layout">
    <!-- ── Sidebar ── -->
    <aside class="sidebar" :class="{ 'sidebar--open': showSidebar }">
      <div class="sidebar__brand">
        <span class="sidebar__logo">L</span>
        <span class="sidebar__title">LinguaLingala</span>
      </div>

      <nav class="sidebar__nav">
        <button class="sidebar__new-chat" @click="clearHistory">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New conversation
        </button>
      </nav>

      <!-- Language selector -->
      <div class="sidebar__section">
        <p class="sidebar__label">Target language</p>
        <LanguageSelector />
      </div>

      <!-- Model selector -->
      <div class="sidebar__section">
        <p class="sidebar__label">Translation model</p>
        <div class="model-selector">
          <button
            class="model-btn"
            :class="{ 'model-btn--active': selectedModel === 'nllb' }"
            @click="setSelectedModel('nllb')"
          >
            NLLB-200
          </button>
          <button
            class="model-btn"
            :class="{ 'model-btn--active': selectedModel === 'afrinllb' }"
            @click="setSelectedModel('afrinllb')"
          >
            AfriNLLB
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="sidebar__section sidebar__stats" v-if="hasMessages">
        <p class="sidebar__label">Session</p>
        <div class="stat-row">
          <span class="stat-label">Messages</span>
          <span class="stat-value">{{ messageCount }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Language</span>
          <span class="stat-value">{{ targetLangLabel }}</span>
        </div>
      </div>

      <!-- Dark mode toggle -->
      <div class="sidebar__footer">
        <button class="dark-toggle" @click="toggleDarkMode" :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
          <span class="dark-toggle__icon">
            <svg v-if="!isDarkMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </span>
          {{ isDarkMode ? 'Light mode' : 'Dark mode' }}
        </button>
      </div>
    </aside>

    <!-- ── Main chat area ── -->
    <main class="chat-main">
      <!-- Header -->
      <header class="chat-header">
        <button class="sidebar-toggle" @click="showSidebar = !showSidebar" aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="chat-header__info">
          <h1 class="chat-header__title">LinguaLingala</h1>
          <p class="chat-header__sub">Lingala → {{ targetLangLabel }}</p>
        </div>
        <div class="chat-header__status">
          <span class="status-dot" :class="{ 'status-dot--active': !isLoading }"></span>
          <span class="status-text">{{ isLoading ? 'Processing…' : 'Ready' }}</span>
        </div>
      </header>

      <!-- Message list -->
      <ChatWindow />

      <!-- Input area -->
      <div class="input-wrapper">
        <MessageInput />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/store/chatStore'
import ChatWindow from '@/components/ChatWindow.vue'
import MessageInput from '@/components/MessageInput.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'

const store = useChatStore()
const {
  isDarkMode, showSidebar, isLoading, messageCount, hasMessages,
  targetLangLabel, selectedModel,
  toggleDarkMode, clearHistory, setSelectedModel
} = store

const targetLang = computed(() => store.targetLang)
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg-primary);
}

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-sidebar);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  transition: transform var(--transition-slow), width var(--transition-slow);
  position: relative;
  z-index: 20;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.sidebar__logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--green-600);
  color: var(--green-50);
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Georgia, serif;
  flex-shrink: 0;
}

.sidebar__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--green-100);
  letter-spacing: -0.02em;
}

.sidebar__nav {
  padding: 14px 12px 8px;
}

.sidebar__new-chat {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--border-radius-md);
  color: var(--green-100);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.sidebar__new-chat:hover { background: rgba(255,255,255,0.12); }

.sidebar__section {
  padding: 16px 16px 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.sidebar__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--green-400);
  margin-bottom: 10px;
}

.model-selector {
  display: flex;
  gap: 6px;
}

.model-btn {
  flex: 1;
  padding: 7px 8px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--border-radius-sm);
  color: var(--green-200);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.model-btn:hover { background: rgba(255,255,255,0.07); }
.model-btn--active {
  background: var(--green-700);
  border-color: var(--green-500);
  color: var(--green-50);
}

.sidebar__stats { flex: 1; }

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.stat-label { font-size: 12px; color: var(--green-400); }
.stat-value { font-size: 12px; font-weight: 600; color: var(--green-200); font-family: var(--font-mono); }

.sidebar__footer {
  padding: 14px 14px 20px;
  border-top: 1px solid rgba(255,255,255,0.07);
  margin-top: auto;
}

.dark-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--border-radius-sm);
  color: var(--green-300);
  font-family: var(--font-ui);
  font-size: 12px;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.dark-toggle:hover { background: rgba(255,255,255,0.07); }
.dark-toggle__icon { display: flex; align-items: center; }

/* ── Main ── */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ── Header ── */
.chat-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;
  background: var(--bg-header);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.sidebar-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-fast);
}
.sidebar-toggle:hover { background: var(--bg-tertiary); }

.chat-header__info { flex: 1; }
.chat-header__title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  line-height: 1.2;
}
.chat-header__sub {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.chat-header__status {
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: pulse 2s infinite;
}
.status-dot--active { background: var(--green-500); animation: none; }
.status-text { font-size: 12px; color: var(--text-muted); }

/* ── Input wrapper ── */
.input-wrapper {
  flex-shrink: 0;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-subtle);
  padding: 12px 20px 16px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0; top: 0; bottom: 0;
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);
  }
  .sidebar--open { transform: translateX(0); }
  .sidebar-toggle { display: flex; }
  .input-wrapper { padding: 10px 12px 14px; }
}
</style>
