<template>
  <v-container style="max-width: 800px">
    <v-card>
      <v-card-title class="text-h4">
        <v-icon :color="iconColor" size="40">mdi-alert</v-icon>
        Ocurrió un problema
      </v-card-title>

      <v-card-text>
        <div class="error-yellow-box">
          <div class="text-h6 text--primary" v-html="errorMessage" />
        </div>
        <div class="text-h6 text--primary mt-12">Presione el siguiente botón para regresar.</div>
      </v-card-text>

      <v-card-actions>
        <template v-if="isAuthReady && !isRedirecting">
          <v-btn color="primary" @click="handleRedirect">
            {{ redirectButtonText }}
          </v-btn>
        </template>
        <v-skeleton-loader v-else type="button" width="150px" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
const ERROR_MESSAGES = {
  403: "No tiene los suficientes permisos para ver esta página, verifique con el Administrador del sistema.",
  404: "Registro No Encontrado.",
  500: "Registro No Encontrado.",
  405: "Registro No Encontrado.",
  default: "Ocurrió un error inesperado.",
}

const AXIOS_GENERIC_403 = "Request failed with status code 403"

export default {
  layout: "default",

  props: {
    error: {
      type: [Object, String],
      default: null,
    },
  },

  data() {
    return {
      iconColor: "orange",
      isRedirecting: false,
      authLoaded: false,
    }
  },

  computed: {
    isAuthReady() {
      // Verifica que el módulo auth esté cargado
      return this.authLoaded && this.$store?.state?.auth && typeof this.authenticated === "boolean"
    },

    statusCode() {
      return this.error?.statusCode || this.error?.response?.status
    },

    errorMessage() {
      let message = this.extractErrorMessage()

      // Filtra mensaje genérico de axios
      if (message === AXIOS_GENERIC_403) {
        message = ERROR_MESSAGES[403]
      }

      return this.formatErrorMessage(message)
    },

    redirectButtonText() {
      return this.authenticated ? "Ir al Dashboard" : "Ir al Inicio"
    },
  },

  watch: {
    // Observa cuando el módulo auth se carga
    "$store.state.auth"(val) {
      if (val && !this.authLoaded) {
        this.authLoaded = true
        this.$forceUpdate()
      }
    },
  },

  mounted() {
    // Verifica inmediatamente si auth ya está cargado
    if (this.$store.state.auth) {
      this.authLoaded = true
    }
  },

  // Eliminado el watcher automático para permitir ver el mensaje de error

  methods: {
    extractErrorMessage() {
      if (typeof this.error === "string") {
        return this.error
      }

      return this.error?.message || this.error?.response?.data?.message || ""
    },

    formatErrorMessage(message) {
      const code = this.statusCode

      if (code === 403) {
        return `${ERROR_MESSAGES[403]}<br/><br/>${message}`
      }

      if ([404, 500, 405].includes(code)) {
        return message ? `<span class="error-message">${message}</span>` : `<span class="error-message">${ERROR_MESSAGES[code]}</span>`
      }

      return message || ERROR_MESSAGES.default
    },

    handleRedirect() {
      this.isRedirecting = true
      const destination = this.authenticated ? "/dashboard" : "/login"
      this.$router.push(destination)
    },
  },
}
</script>

<style scoped>
.error-message {
  color: red;
  font-weight: bold;
}

.error-yellow-box {
  background: #fffbe6;
  border: 2px solid #ffe066;
  border-radius: 8px;
  padding: 18px 20px;
  margin-bottom: 18px;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(255, 224, 102, 0.15);
}
</style>
