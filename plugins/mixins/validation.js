import Vue from 'vue'
import { mapGetters } from 'vuex'

const validation = {
  install(Vue, options) {
    Vue.prototype.$vrules = rules

    Vue.mixin({
      computed: {
        ...mapGetters({
          errors: 'validation/errors',
          error_message: 'validation/error_message',
        }),
      },
      methods: {
        clearErrors: function () {
          // metodo global para limpiar errorres
          this.$store.dispatch('validation/clearErrors')
        },
        validatePermission: function (permission) {
          if (this.$store.getters.permissions.includes(permission)) {
            return true
          } else {
            // throw new Error({ statusCode: 403 })
            throw new Error('Permission denied: 403')
          }
        },
      },
    })
  },
}

const rules = {
  required: (value) => {
    return !!value || 'Requerido.'
  },
}

Vue.use(validation)
