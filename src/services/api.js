/**
 * api.js — LinguaLingala API Service
 * Wraps all FastAPI backend communication via Axios
 */
import axios from 'axios'

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// ── Request interceptor: attach session ID if available ────────────────────
api.interceptors.request.use(
  (config) => {
    const sessionId = sessionStorage.getItem('lingua_session_id')
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: normalize errors ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'Request timed out. The model may be loading — please retry.'
        : error.message || 'An unexpected error occurred.')
    return Promise.reject(new Error(message))
  }
)

// ── API functions ───────────────────────────────────────────────────────────

/**
 * Translate Lingala text to French or English via NLLB-200 / AfriNLLB
 * @param {string} text - Lingala input
 * @param {'fr'|'en'} targetLang - Target language
 * @param {'nllb'|'afrinllb'} [model='nllb'] - Model to use
 * @returns {Promise<{translation: string, model_used: string, latency_ms: number}>}
 */
export async function translateText(text, targetLang = 'fr', model = 'nllb') {
  const { data } = await api.post('/translate', {
    text,
    target_lang: targetLang,
    model
  })
  return data
}

/**
 * Analyse sentiment of Lingala text via XLM-RoBERTa
 * @param {string} text - Lingala input
 * @returns {Promise<{sentiment: string, confidence: number, intensity: string}>}
 */
export async function analyzeSentiment(text) {
  const { data } = await api.post('/sentiment', { text })
  return data
}

/**
 * Full chat endpoint — translation + sentiment + explanation in one call
 * @param {string} text - Lingala input
 * @param {'fr'|'en'} targetLang - Target language
 * @param {string} [sessionId] - Conversation session ID for context
 * @returns {Promise<ChatResponse>}
 */
export async function chatWithAI(text, targetLang = 'fr', sessionId = null) {
  const payload = { text, target_lang: targetLang }
  if (sessionId) payload.session_id = sessionId
  const { data } = await api.post('/chat', payload)
  return data
}

/**
 * Fetch conversation history for a session
 * @param {string} sessionId
 */
export async function getHistory(sessionId) {
  const { data } = await api.get(`/history/${sessionId}`)
  return data
}

/**
 * Submit feedback for active learning pipeline
 * @param {string} messageId
 * @param {'up'|'down'} rating
 */
export async function submitFeedback(messageId, rating) {
  const { data } = await api.post('/feedback', { message_id: messageId, rating })
  return data
}

export default api
