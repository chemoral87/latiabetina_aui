import Vue from "vue"

const Permissions = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        hasPermission(permission) {
          return !!(this.permissions && permission in this.permissions)
        },
      },
    })
  },
}

Vue.use(Permissions)
