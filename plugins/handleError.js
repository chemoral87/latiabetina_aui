// plugins/handleError.js
// Plugin Nuxt para inyectar $handleError en app, context y this

export default (context, inject) => {
  function handleError(e, defaultStatus = 403, defaultMessage = "No autorizado o no encontrado") {
    let statusCode = defaultStatus
    let message = defaultMessage

    if (e?.response) {
      statusCode = e.response.status || defaultStatus
      message = e.response.data?.message || defaultMessage
    } else if (e?.statusCode) {
      statusCode = e.statusCode
      message = e.message || defaultMessage
    } else if (typeof e === "string") {
      message = e
    }

    // Filtra mensaje genérico de axios
    if (message === "Request failed with status code 403") {
      message = "No tiene permisos para acceder a esta página."
    }

    return { statusCode, message }
  }

  inject("handleError", handleError)
}
