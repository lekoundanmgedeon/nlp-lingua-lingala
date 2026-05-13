# LinguaLingala — Frontend

A production-grade Vue.js 3 chatbot interface for the LinguaLingala NLP system.
Supports **Lingala → French / English** translation, sentiment analysis, and cultural explanations.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build tool | Vite 5 |
| State | Pinia |
| HTTP client | Axios |
| Router | Vue Router 4 |
| Fonts | Sora + JetBrains Mono (Google Fonts) |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your FastAPI backend

# 3. Start dev server
npm run dev
# → http://localhost:5173

# 4. Build for production
npm run build
```

---

## Project structure

```
src/
├── assets/
│   └── main.css              # Global design tokens, dark mode, animations
├── components/
│   ├── ChatWindow.vue         # Scrollable chat container + empty state + typing indicator
│   ├── MessageList.vue        # Renders all message types (user / AI / error)
│   ├── MessageInput.vue       # Auto-resize textarea + send button + error banner
│   └── LanguageSelector.vue   # FR / EN language toggle
├── composables/
│   ├── useScrollToBottom.js   # Reactive auto-scroll helper
│   └── useTimeFormat.js       # Timestamp formatters
├── services/
│   └── api.js                 # Axios instance + translateText / analyzeSentiment / chatWithAI
├── store/
│   └── chatStore.js           # Pinia store: messages, loading, errors, settings
├── views/
│   └── ChatView.vue           # Main layout: sidebar + header + chat + input
├── App.vue
└── main.js
```

---

## Backend API contract

The frontend expects a FastAPI backend with the following endpoints:

### `POST /chat` (primary)
```json
// Request
{ "text": "Nazali na esengo.", "target_lang": "fr", "session_id": "sess_..." }

// Response
{
  "original": "Nazali na esengo.",
  "translation": "Je suis heureux.",
  "sentiment": "positive",
  "confidence": 0.94,
  "intensity": "high",
  "explanation": "Expression de bonheur...",
  "model_used": "nllb-200-distilled-600M",
  "latency_ms": 312
}
```

### `POST /translate`
```json
{ "text": "...", "target_lang": "fr", "model": "nllb" }
→ { "translation": "...", "model_used": "...", "latency_ms": 280 }
```

### `POST /sentiment`
```json
{ "text": "..." }
→ { "sentiment": "positive|negative|neutral", "confidence": 0.88, "intensity": "medium" }
```

### `POST /feedback`
```json
{ "message_id": "msg_...", "rating": "up|down" }
```

### `GET /history/{session_id}`
Returns array of past session messages.

---

## Features

- ChatGPT-style message bubbles
- AI response card with: translated text · sentiment badge + confidence bar · cultural note
- Typing indicator with animated dots
- Error messages with retry button
- Dark / light mode toggle (persists via system preference)
- Auto-scrolling with smooth behavior
- Mobile-responsive layout with collapsible sidebar
- Message feedback (👍/👎) sent to backend active learning pipeline
- Session management via `sessionStorage`
- Keyboard shortcuts: `Enter` to send, `Shift+Enter` for new line
- Example sentence prompts on empty state
- Character counter with warning threshold

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | FastAPI backend base URL |

In development, Vite proxies `/api` → `http://localhost:8000` (see `vite.config.js`).

---

## Design system

The app uses a custom CSS design system in `src/assets/main.css` with:
- **Forest green palette** (`--green-*`) for primary actions and AI branding
- **Warm ivory neutrals** (`--ivory-*`) for surfaces and text
- **Semantic sentiment colors** for positive/negative/neutral feedback
- Full dark mode via `[data-theme="dark"]` attribute on `<html>`
- CSS custom properties for easy theming
- `Sora` font for UI, `JetBrains Mono` for metadata/code
