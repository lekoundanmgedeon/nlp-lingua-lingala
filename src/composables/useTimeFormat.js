/**
 * useTimeFormat.js
 * Timestamp formatting helpers
 */
export function useTimeFormat() {
  function formatTime(isoString) {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(isoString) {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleDateString([], {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  function isToday(isoString) {
    if (!isoString) return false
    const date = new Date(isoString)
    const now = new Date()
    return date.toDateString() === now.toDateString()
  }

  return { formatTime, formatDate, isToday }
}
