<template>
  <v-container fluid>
    <span class="text-h6 ml-2">Bienvenido {{ NAME_SECRET }}</span>

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
    this.$nuxt.$emit("setNavBar", {
      title: "Dashboard",
      icon: "view-dashboard",
    })
  },
  methods: {
    hasPermission(permission) {
      return Object.prototype.hasOwnProperty.call(this.permissions, permission)
    },
  },
}
</script>
