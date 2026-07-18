// Previene pinch-to-zoom y double-tap zoom en Chrome mobile
// sin interferir con clics rápidos en elementos interactivos (botones, enlaces, inputs, etc.)
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

  // Bloquear double-tap zoom solo en áreas NO interactivas.
  // Llamar preventDefault() en touchend bloquea el evento click,
  // por lo que debemos evitar hacerlo en botones, enlaces, inputs y
  // componentes Vuetify con rol de botón (v-btn, etc.)
  let lastTouchEnd = 0
  document.addEventListener(
    "touchend",
    function (event) {
      const now = Date.now()
      if (now - lastTouchEnd <= 150) {
        // Solo prevenir si el objetivo NO es un elemento interactivo,
        // para no bloquear clics rápidos en la UI
        const target = event.target
        if (target && !target.closest(
          'button, a, input, select, textarea, label, ' +
          '[role="button"], [role="link"], [tabindex], ' +
          '.v-btn, .v-list-item, .v-input, .v-select'
        )) {
          event.preventDefault()
        }
      }
      lastTouchEnd = now
    },
    false
  )
}
