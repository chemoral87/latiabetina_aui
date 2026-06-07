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
  async mounted() {
    // Prevent multiple logout calls
    if (this.isLoggingOut) return
    this.isLoggingOut = true
    
    try {
      // Hacer la llamada nativa de logout.
      // Nuxt Auth se encarga de vaciar el store, la sesión y contactar al backend.
      await this.$auth.logout()
    } catch(e) {
      console.warn("Logout warning:", e)
      // Si el API falla, nos garantizamos resetear al usuario localmente
      this.$auth.reset()
    } finally {
      // Breve retraso visual
      setTimeout(() => {
        this.$router.replace('/login')
      }, 500)
    }
  },
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
