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
  head() {
    return {
      title: "Cerrando sesión",
    }
  },
  mounted() {
    // Breve retraso para que el usuario vea el mensaje
    setTimeout(() => {
      try {
        if(this.$auth.strategy.name === "google") {
          // Para Google, hacer logout local sin llamar al backend
          this.$auth.reset()
          this.$router.push("/login")
        } else {
          // Para Laravel, usar logout normal
          this.$auth.logout()
        }
      } catch(e) {

        // En caso de error, intentamos limpiar el estado local
        this.$auth.reset()
        this.$router.push("/login")
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
