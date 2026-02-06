<template>
  <v-container fluid>
    <span class="text-h6 ml-2">Bienvenidos</span>
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <DashboardConsolidacion v-if="canViewAuditorium" />
      </v-col>
    </v-row>
    <!-- authenticated {{ authenticated }}
    <div v-if="user">user {{ user.name }}</div>
    <div v-else>Cargando usuario...</div> -->

    <!-- {{permissions}} -->
    <!-- {{user}} -->
    <!-- <v-row>
      <template v-if="hasPermission('consolidador-index')"></template>
    </v-row> -->
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
  computed: {
    canViewAuditorium() {
      return this.hasPermission("auditorium-index")
    },
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", { title: "Dashboard", icon: "mdi-view-dashboard" })

    // Si está autenticado pero no tiene usuario, intentar obtenerlo
    // if (this.$auth.loggedIn && !this.$auth.user) {
    //   console.log("Usuario no cargado, obteniendo del backend...")
    // }
  },
}
</script>
