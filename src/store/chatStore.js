/**
 * chatStore.js — LinguaLingala Pinia Store
 * Manages messages, loading state, settings, and errors
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatWithAI, translateText, analyzeSentiment } from '@/services/api'

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function getTimestamp() {
  return new Date().toISOString()
}

// ── Store ────────────────────────────────────────────────────────────────────
export const useChatStore = defineStore('chat', () => {
  // ── State ──
  const messages = ref([])
  const isLoading = ref(false)
  const isTyping = ref(false)
  const error = ref(null)
  const sessionId = ref(null)
  const targetLang = ref('fr')
  const selectedModel = ref('nllb')
  const isDarkMode = ref(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const showSidebar = ref(window.innerWidth > 768)

  // ── Computed ──
  const messageCount = computed(() => messages.value.length)
  const hasMessages = computed(() => messages.value.length > 0)
  const lastMessage = computed(() =>
    messages.value.length ? messages.value[messages.value.length - 1] : null
  )
  const targetLangLabel = computed(() =>
    targetLang.value === 'fr' ? 'Français' : 'English'
  )

  // ── Actions ──

  function initSession() {
    let stored = sessionStorage.getItem('lingua_session_id')
    if (!stored) {
      stored = generateSessionId()
      sessionStorage.setItem('lingua_session_id', stored)
    }
    sessionId.value = stored
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    document.documentElement.setAttribute(
      'data-theme',
      isDarkMode.value ? 'dark' : 'light'
    )
  }

  function setTargetLang(lang) {
    targetLang.value = lang
  }

  function setSelectedModel(model) {
    selectedModel.value = model
  }

  function clearError() {
    error.value = null
  }

  function clearHistory() {
    messages.value = []
    error.value = null
    // Generate a fresh session
    const newSession = generateSessionId()
    sessionId.value = newSession
    sessionStorage.setItem('lingua_session_id', newSession)
  }

  /**
   * Add a user message to the chat history
   */
  function addUserMessage(text) {
    const msg = {
      id: generateId(),
      role: 'user',
      text,
      timestamp: getTimestamp()
    }
    messages.value.push(msg)
    return msg
  }

  /**
   * Add an AI response message with full NLP payload
   */
  function addAIMessage(payload) {
    const msg = {
      id: generateId(),
      role: 'ai',
      text: payload.translation || '',
      original: payload.original || '',
      translation: payload.translation || '',
      sentiment: payload.sentiment || 'neutral',
      confidence: payload.confidence ?? null,
      intensity: payload.intensity || null,
      explanation: payload.explanation || null,
      model_used: payload.model_used || null,
      latency_ms: payload.latency_ms || null,
      timestamp: getTimestamp(),
      feedback: null // 'up' | 'down' | null
    }
    messages.value.push(msg)
    return msg
  }

  /**
   * Add an error message card to the chat
   */
  function addErrorMessage(errorText) {
    const msg = {
      id: generateId(),
      role: 'error',
      text: errorText,
      timestamp: getTimestamp()
    }
    messages.value.push(msg)
    return msg
  }

  /**
   * Update feedback on a specific message
   */
  function setMessageFeedback(messageId, rating) {
    const msg = messages.value.find((m) => m.id === messageId)
    if (msg) msg.feedback = rating
  }

  /**
   * Main send action — calls backend and manages loading state
   */
  async function sendMessage(text) {
    if (!text.trim() || isLoading.value) return

    clearError()

    if (!sessionId.value) initSession()

    // 1. Optimistically add user message
    addUserMessage(text.trim())

    // 2. Show typing indicator
    isLoading.value = true
    isTyping.value = true

    try {
      // 3. Call the /chat endpoint (translation + sentiment + explanation)
      const response = await chatWithAI(
        text.trim(),
        targetLang.value,
        sessionId.value
      )

      // 4. Small deliberate delay so the typing indicator is visible
      await new Promise((r) => setTimeout(r, 320))

      isTyping.value = false

      // 5. Add AI response
      addAIMessage({
        ...response,
        original: text.trim()
      })
    } catch (err) {
      isTyping.value = false
      error.value = err.message
      addErrorMessage(err.message)
    } finally {
      isLoading.value = false
      isTyping.value = false
    }
  }

  /**
   * Standalone translate (used for re-translate with different lang)
   */
  async function retranslate(messageId, newLang) {
    const msg = messages.value.find((m) => m.id === messageId)
    if (!msg || !msg.original) return
    isLoading.value = true
    try {
      const response = await translateText(
        msg.original,
        newLang,
        selectedModel.value
      )
      msg.translation = response.translation
      msg.text = response.translation
      msg.model_used = response.model_used
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // ── Initialize ──
  initSession()

  if (isDarkMode.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
  }

  return {
    // state
    messages,
    isLoading,
    isTyping,
    error,
    sessionId,
    targetLang,
    selectedModel,
    isDarkMode,
    showSidebar,
    // computed
    messageCount,
    hasMessages,
    lastMessage,
    targetLangLabel,
    // actions
    sendMessage,
    retranslate,
    addUserMessage,
    addAIMessage,
    addErrorMessage,
    clearHistory,
    clearError,
    toggleDarkMode,
    setTargetLang,
    setSelectedModel,
    setMessageFeedback,
    initSession
  }
})
