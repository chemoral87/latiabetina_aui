export default ({ store }, inject) => {
  inject("notify", (payload) => {
    // Support both calling conventions:
    //   { type: 'success'|'warning'|'error', message: '...' }  (used across most pages)
    //   { type: 'success'|'warning'|'error', text: '...' }     (used in some pages)
    //   { success: '...' } | { warning: '...' } | { error: '...' }  (legacy store shape)
    if (payload.type) {
      const text = payload.message || payload.text || ''
      const typeMap = {
        success: 'success',
        warning: 'warning',
        error: 'error',
        info: 'warning',
      }
      const key = typeMap[payload.type] || 'success'
      store.dispatch("notify", { [key]: text })
    } else {
      // Legacy shape — pass through as-is
      store.dispatch("notify", payload)
    }
  })
}
