import Vue from "vue"
import { mapGetters } from "vuex"

/**
 * Reglas de validación reutilizables que emulan los mensajes de Laravel en español.
 *
 * Uso:
 *   :rules="[$vrules.required]"
 *   :rules="[$vrules.required, $vrules.minLength(3)]"
 *   :rules="[$vrules.required, $vrules.email]"
 *   :rules="[$vrules.required, $vrules.maxLength(255)]"
 */
const rules = {
  /** El campo es obligatorio */
  required: (value) => {
    if (value === null || value === undefined) return "El campo es obligatorio."
    if (typeof value === "string") return value.trim().length > 0 || "El campo es obligatorio."
    if (typeof value === "number") return true
    if (Array.isArray(value)) return value.length > 0 || "El campo es obligatorio."
    return true
  },

  /**
   * El campo es obligatorio con nombre personalizado.
   * Delega en `required` y solo reemplaza el mensaje.
   * Uso: :rules="[$vrules.requiredField('name')]"
   * Mensaje: "El campo name es obligatorio."
   */
  requiredField: (fieldName) => (value) => {
    const result = rules.required(value)
    if (typeof result === 'string' && result.startsWith('El campo')) {
      return `El campo ${fieldName} es obligatorio.`
    }
    return result
  },

  /** El campo debe ser una dirección de correo válida */
  email: (value) => {
    if (!value) return true
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value) || "El campo debe ser una dirección de correo válida."
  },

  /** El campo debe tener mínimo N caracteres */
  minLength: (min) => (value) => {
    if (!value) return true
    return (value.length >= min) || `El campo debe tener al menos ${min} caracteres.`
  },

  /** El campo no debe tener más de N caracteres */
  maxLength: (max) => (value) => {
    if (!value) return true
    return (value.length <= max) || `El campo no debe tener más de ${max} caracteres.`
  },

  /** El campo debe tener entre N y M caracteres */
  between: (min, max) => (value) => {
    if (!value) return true
    return (value.length >= min && value.length <= max) || `El campo debe tener entre ${min} y ${max} caracteres.`
  },

  /** El campo debe ser un número */
  numeric: (value) => {
    if (value === null || value === undefined || value === "") return true
    return !isNaN(parseFloat(value)) && isFinite(value) || "El campo debe ser un número."
  },

  /** El campo debe ser un número entero */
  integer: (value) => {
    if (value === null || value === undefined || value === "") return true
    return Number.isInteger(Number(value)) || "El campo debe ser un número entero."
  },

  /** El campo sólo debe contener letras */
  alpha: (value) => {
    if (!value) return true
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value) || "El campo sólo debe contener letras."
  },

  /** El campo sólo debe contener letras y números */
  alphaNum: (value) => {
    if (!value) return true
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/.test(value) || "El campo sólo debe contener letras y números."
  },

  /** El campo debe ser una URL válida */
  url: (value) => {
    if (!value) return true
    try {
      const url = new URL(value)
      return !!url
    } catch {
      return "El campo debe ser una URL válida."
    }
  },

  /** Validar con expresión regular personalizada */
  pattern: (regex, message = "El formato del campo es inválido.") => (value) => {
    if (!value) return true
    return regex.test(value) || message
  },

  /** Confirmación de contraseña: debe coincidir con otro campo */
  confirmed: (matchValue) => (value) => {
    if (!value && !matchValue) return true
    return value === matchValue || "La confirmación no coincide."
  },

  /** El campo debe ser un número de teléfono válido (10 dígitos mínimo) */
  phone: (value) => {
    if (!value) return true
    return /^\+?[\d\s()-]{7,15}$/.test(value) || "El campo debe ser un número de teléfono válido."
  },

  /** El campo debe tener un valor mínimo numérico */
  min: (min) => (value) => {
    if (value === null || value === undefined || value === "") return true
    return Number(value) >= min || `El campo debe ser mayor o igual a ${min}.`
  },

  /** El campo debe tener un valor máximo numérico */
  max: (max) => (value) => {
    if (value === null || value === undefined || value === "") return true
    return Number(value) <= max || `El campo debe ser menor o igual a ${max}.`
  },
}

const validation = {
  install(Vue, options) {
    Vue.prototype.$vrules = rules

    Vue.mixin({
      computed: {
        ...mapGetters({
          errors: "validation/errors",
          error_message: "validation/error_message",
        }),
      },
      methods: {
        clearErrors: function () {
          // metodo global para limpiar errorres
          this.$store.dispatch("validation/clearErrors")
        },
        validatePermission: function (permission) {
          if (this.$store.getters.permissions.includes(permission)) {
            return true
          } else {
            // throw new Error({ statusCode: 403 })
            throw new Error("Permission denied: 403")
          }
        },
      },
    })
  },
}

Vue.use(validation)
