<template>
  <v-container>
    <v-layout align-center justify-center>
      <v-flex xs12 md5 lg6 class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">Procesando autenticación...</p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      processing: false,
    }
  },
  mounted() {
    this.handleGoogleCallback()
  },
  methods: {
    async handleGoogleCallback() {
      // Evita procesamiento múltiple
      if (this.processing) return
      this.processing = true

      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("token")
      const error = urlParams.get("error")

      if (error) {
        this.$store.dispatch("notify", { error: "Error al procesar la autenticación de Google" })
        window.location.href = "/login"
        return
      }

      if (token) {
        try {
          // Cambia a la estrategia de Google
          this.$auth.setStrategy("google")

          // Enviar el token al backend para validar y obtener usuario
          const response = await this.$auth.loginWith("google", {
            data: { token },
          })

          // Establecer manualmente el usuario en el módulo de auth
          if (response.data && response.data.user) {
            await this.$auth.setUser(response.data.user)
          }

          // Redirige al dashboard inmediatamente
          const redirectPath = this.$route.query.redirect || "/dashboard"
          window.location.href = redirectPath
        } catch (error) {
          if (!error.message.includes("Navigation cancelled")) {
            this.$store.dispatch("notify", { error: "Error al iniciar sesión con Google" })
            window.location.href = "/login"
          }
        }
      } else {
        // No hay token, redirige al login
        window.location.href = "/login"
      }
    },
  },
}
</script>
