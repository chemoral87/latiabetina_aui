// Previene pinch-to-zoom y double-tap zoom en Chrome mobile
export default () => {
  if (typeof document === "undefined") return

  // Bloquear pinch-to-zoom (dos dedos)
  document.addEventListener(
    "touchmove",
    function (event) {
      if (event.touches.length > 1) {
        event.preventDefault()
      }
    },
    { passive: false }
  )

  // Bloquear double-tap zoom
  let lastTouchEnd = 0
  document.addEventListener(
    "touchend",
    function (event) {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    },
    false
  )
}
