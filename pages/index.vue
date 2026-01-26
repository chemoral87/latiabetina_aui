<template>
  <v-container fluid>
    <span class="text-h6 ml-2">Bienvenidos {{ NAME_SECRET }}</span>
    <!-- authenticated {{ authenticated }}
    <div v-if="user">user {{ user.name }}</div>
    <div v-else>Cargando usuario...</div> -->

    <!-- {{permissions}} -->
    <!-- {{user}} -->
    <v-row>
      <template v-if="hasPermission('consolidador-index')"></template>
    </v-row>
  </v-container>
</template>
<script>
export default {
  props: {},
  data() {
    return {
      NAME_SECRET: "", // process.env.NAME_SECRET
    }
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", { title: "Dashboard", icon: "mdi-view-dashboard" })

    // Si está autenticado pero no tiene usuario, intentar obtenerlo
    if (this.$auth.loggedIn && !this.$auth.user) {
      console.log("Usuario no cargado, obteniendo del backend...")
      this.$auth.fetchUser()
    }
  },
  methods: {
    hasPermission(permission) {
      if (!this.permissions || typeof this.permissions !== "object") {
        return false
      }
      return Object.prototype.hasOwnProperty.call(this.permissions, permission)
    },
  },
}
</script>
