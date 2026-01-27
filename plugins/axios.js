// plugins/axios.js

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  UNPROCESSABLE_ENTITY: 422,
}

const ERROR_MESSAGES = {
  NETWORK: "Error de conexión, verifique su conexión a Internet.",
}

// Códigos de estado que manejan errores de autenticación
const AUTH_ERROR_CODES = [HTTP_STATUS.UNAUTHORIZED]

// Códigos de estado que manejan errores de validación
const VALIDATION_ERROR_CODES = [HTTP_STATUS.UNPROCESSABLE_ENTITY]

// Códigos de estado que muestran mensaje de error
const MESSAGE_ERROR_CODES = [HTTP_STATUS.NOT_FOUND, HTTP_STATUS.METHOD_NOT_ALLOWED, ...AUTH_ERROR_CODES]

export default function ({ $axios, store }) {
  // Configurar baseURL dinámicamente según el hostname
  if (process.client) {
    const hostname = window.location.hostname
    const apiPort = 8001
    const baseURL = `http://${hostname}:${apiPort}/api`
    $axios.setBaseURL(baseURL)
  }

  /**
   * Maneja errores de red
   */
  const handleNetworkError = () => {
    // Usa el sistema de notificaciones del store en lugar de alert
    store.dispatch("notify", {
      error: ERROR_MESSAGES.NETWORK,
      type: "error",
    })
  }

  /**
   * Maneja errores de autenticación (401)
   */
  const handleAuthError = (errorData) => {
    store.dispatch("validation/setErrors", errorData)

    if (errorData.message) {
      store.dispatch("notify", { error: errorData.message })
    }
  }

  /**
   * Maneja errores de validación (422)
   */
  const handleValidationError = (errorData) => {
    store.dispatch("validation/setErrors", errorData)

    // Para errores de validación, no notificamos el mensaje general,
    // solo mostramos los errores en los campos
  }

  /**
   * Maneja errores con mensaje (404, 405)
   */
  const handleMessageError = (errorData) => {
    if (errorData.message) {
      store.dispatch("notify", { error: errorData.message })
    }
  }

  /**
   * Maneja errores HTTP según el código de estado
   */
  const handleHttpError = (error) => {
    if (!error.response) return

    const { status, data } = error.response

    if (AUTH_ERROR_CODES.includes(status)) {
      handleAuthError(data)
    } else if (VALIDATION_ERROR_CODES.includes(status)) {
      handleValidationError(data)
    } else if (MESSAGE_ERROR_CODES.includes(status)) {
      handleMessageError(data)
    }
  }

  /**
   * Interceptor de errores
   */
  $axios.onError((error) => {
    // Error de red
    if (error.message === "Network Error") {
      handleNetworkError()
    }
    // Errores HTTP
    else if (error.response) {
      handleHttpError(error)
    }
    // Errores desconocidos
    else {
      console.error("Error desconocido:", error)
      store.dispatch("notify", {
        error: "Ha ocurrido un error inesperado",
      })
    }

    store.dispatch("hideLoading")
    return Promise.reject(error)
  })

  /**
   * Interceptor de peticiones
   */
  $axios.onRequest((config) => {
    // Limpia errores de validación previos
    store.dispatch("validation/clearErrors")

    // Maneja el estado de loading
    const shouldHideNextLoading = store.getters.hideNextLoading

    if (shouldHideNextLoading) {
      store.dispatch("showNextLoading")
    } else {
      store.dispatch("showLoading")
    }

    return config
  })

  /**
   * Interceptor de respuestas exitosas
   */
  $axios.onResponse((response) => {
    store.dispatch("hideLoading")

    // Notifica si hay mensaje de éxito o error
    if (response.data && (response.data.success || response.data.error)) {
      store.dispatch("notify", response.data)
    }

    return response
  })
}
