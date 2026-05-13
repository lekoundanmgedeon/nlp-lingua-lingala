/**
 * useScrollToBottom.js
 * Reactive composable to auto-scroll a container to the bottom
 */
import { ref, nextTick } from 'vue'

export function useScrollToBottom() {
  const containerRef = ref(null)

  async function scrollToBottom(behavior = 'smooth') {
    await nextTick()
    if (containerRef.value) {
      containerRef.value.scrollTo({
        top: containerRef.value.scrollHeight,
        behavior
      })
    }
  }

  function isNearBottom(threshold = 120) {
    if (!containerRef.value) return true
    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    return scrollHeight - scrollTop - clientHeight < threshold
  }

  return { containerRef, scrollToBottom, isNearBottom }
}
