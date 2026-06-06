<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center column>
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="mt-4 text-h6 grey--text text--darken-1">Finalizando sesión...</div>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  auth: false,
  data() {
    return {
      isLoggingOut: false
    }
  },
  head() {
    return {
      title: "Cerrando sesión",
    }
  },
  mounted() {
    // Prevent multiple logout calls
    if (this.isLoggingOut) return
    this.isLoggingOut = true
    
    // Breve retraso para que el usuario vea el mensaje
    setTimeout(() => {
      try {
        // Hacer la llamada al backend logout mientras el token aún está disponible
        this.$axios.post('/auth/logout')
          .then(() => {
            // Token cleared on successful logout
            this.$auth.setUser(false)
            // Redirect to login after logout completes
            this.$router.push('/login')
          })
          .catch(() => {
            // En caso de error, continuamos
            this.$auth.setUser(false)
            this.$router.push('/login')
          })
      } catch(e) {
        // En caso de error, continuamos
        this.$auth.setUser(false)
        this.$router.push('/login')
      }
    }, 800)
  },
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
