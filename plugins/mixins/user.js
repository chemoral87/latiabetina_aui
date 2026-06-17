import Vue from 'vue'
import { mapGetters } from 'vuex'

const User = {
  install(Vue, options) {
    Vue.mixin({
      computed: {
        ...mapGetters({
          user: 'user',
          authenticated: 'authenticated',
          permissions: 'permissions',
          orgs: 'orgs',
          orgCodeById: 'orgCodeById',
          snackbar: 'snackbar',
          showLoading: 'showLoading',
          hideNextLoading: 'hideNextLoading',
        }),
      },
    })
  },
}

Vue.use(User)
