import Vue from "vue"

const Permissions = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        hasPermission(permission) {
          // Si el store está disponible, úsalo
          if (this.$store) {
            return this.$store.getters.hasPermission(permission)
          }
          // Fallback: lógica directa
          return !!(this.permissions && permission in this.permissions)
        },
      },
    })
  },
}

Vue.use(Permissions)
