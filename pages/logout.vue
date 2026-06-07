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
    
    // Clear auth immediately to prevent duplicate auth requests
    this.$auth.setUser(false)
    this.$auth.strategy.token.set('')
    
    // Breve retraso para que el usuario vea el mensaje
    setTimeout(() => {
      try {
        // Hacer la llamada al backend logout
        this.$axios.post('/auth/logout', {}, {
          validateStatus: () => true // Ignore all errors
        })
          .finally(() => {
            // Always redirect to login
            setTimeout(() => {
              this.$router.replace('/login')
            }, 300)
          })
      } catch(e) {
        // En caso de error, continuamos
        setTimeout(() => {
          this.$router.replace('/login')
        }, 300)
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
