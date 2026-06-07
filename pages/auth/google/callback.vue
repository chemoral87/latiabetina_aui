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
        this.$router.push("/login")
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

          // Establecer manualmente el usuario en el módulo de auth si viene en la respuesta local
          if (response && response.data && response.data.user) {
            await this.$auth.setUser(response.data.user)
          } else if (this.$auth.strategy.token.get()) {
            // Si la respuesta fue undefined (por cancelacion del interceptor) pero tenemos token
            await this.$auth.fetchUser()
          }

          // Verificamos de nuevo si el user está en el store antes de redirigir
          if (!this.$auth.user) {
             throw new Error("No se pudo obtener el usuario.")
          }

          // Redirige al dashboard inmediatamente
          const redirectPath = this.$route.query.redirect || "/dashboard"
          this.$router.push(redirectPath)
        } catch (error) {
          // Ignorar cancelaciones de router y peticiones de Axios interceptadas (Duplicados silenciosos)
          const isCancelError = error.message && (
             error.message.includes("Navigation cancelled") || 
             error.message.includes("Duplicate request") ||
             error.message === 'Cancelled'
          );

          if (!isCancelError) {
            console.error("Error during Google authentication:", error);
            console.error(error.response ? error.response.data : 'No response data');
            
            let errMsg = null;
            if (error.response) {
               errMsg = "Server: " + error.response.status + " " + JSON.stringify(error.response.data);
            } else {
               errMsg = "Ocurrio un error en callback: " + error.message;
            }

            this.$store.dispatch("notify", { error: errMsg })
            this.$router.push("/login")
          }
        }
      } else {
        // No hay token, redirige al login
        this.$router.push("/login")
      }
    },
  },
}
</script>
