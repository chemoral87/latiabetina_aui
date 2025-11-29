watch: { authenticated(val) { if (val === true && this.autoRedirectDashboard) { this.autoRedirectDashboard = false; this.$router.push("/dashboard") } } },
<template>
  <v-container style="max-width: 800px">
    <v-card>
      <v-card-title class="text-h4">
        <v-icon :color="color" size="40">mdi-alert</v-icon>
        Ocurrió un problema
      </v-card-title>
      <v-card-text>
        <div class="error-yellow-box">
          <div class="text-h6 text--primary" v-html="errorMessage"></div>
        </div>
        <div class="text-h6 text--primary mt-12">Presione el siguiente botón para regresar.</div>
      </v-card-text>
      <v-card-actions v-if="authenticatedReady">
        <v-btn v-if="authenticated === false" color="primary" @click="goHome">Ir al Inicio</v-btn>
        <v-btn v-else-if="authenticated === true" color="primary" @click="goDashboard">Ir al Dashboard</v-btn>
      </v-card-actions>
      <v-card-actions v-else>
        <v-skeleton-loader type="button" width="150px" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
  layout: "default",
  props: ["error"],
  data() {
    return {
      color: "orange",
      pageNotFound: "404 Not Found",
      otherError: "An error occurred",
      autoRedirectDashboard: false,
    }
  },
  computed: {
    authenticatedReady() {
      return typeof this.authenticated === "boolean"
    },
    errorMessage() {
      // Soporta errores lanzados desde catch(e) con distintas estructuras
      const statusCode = this.error?.statusCode || this.error?.response?.status
      let message = this.error?.message || this.error?.response?.data?.message || (typeof this.error === "string" ? this.error : "")

      // Filtra mensaje genérico de axios
      if (message === "Request failed with status code 403") {
        message = "No tiene permisos para acceder a esta página."
      }

      if (statusCode === 403) {
        return `No tiene los suficientes permisos para ver esta página, verifique con el Administrador del sistema.<br/><br/>${message}`
      } else if (statusCode === 404 || statusCode === 500 || statusCode === 405) {
        if (message) {
          return `<span class='error-message'>${message}</span>`
        }
        return "<span class='error-message'>Registro No Encontrado.</span>"
      }
      return message || "Ocurrió un error inesperado."
    },
  },
  methods: {
    goHome() {
      console.log("Redirecting to home")
      this.$router.push("/login")
    },
    goDashboard() {
      console.log("Redirecting to dashboard")
      // Marca para redirigir automáticamente cuando authenticated esté listo
      if (this.authenticated === true) {
        this.$router.push("/dashboard")
      } else {
        this.autoRedirectDashboard = true
      }
    },
  },
}
</script>

<style>
/* h1 {
  font-size: 20px;
} */
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
