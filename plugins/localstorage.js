export default ({ store }) => {
  if (!process.client) return

  const KEY = "adminaui_v1"

  // Cargar estado al inicio
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) {
      const data = JSON.parse(saved)
      if (data.pitcher_store) {
        Object.assign(store.state.pitcher_store, data.pitcher_store)
      }
      // if (data.newinvest) {
      //   Object.assign(store.state.newinvest, data.newinvest)
      // }
    }
  } catch (e) {
    // Ignorar errores de parseo
  }

  // Guardar en cada mutación (con debounce)
  let timeout
  store.subscribe(() => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({
            pitcher_store: store.state.pitcher_store,
            newinvest: store.state.newinvest,
          })
        )
      } catch (e) {
        // Ignorar errores de guardado
      }
    }, 300)
  })
}
