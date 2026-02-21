export const strict = false

export const state = () => ({
  snackbars: [],
  snack_id: 0,
  snackbarTimeout: 4000,
  block_loading: false,
  hide_next_loading: false,
  locale: "es",
  config: [],
  app_version: process.env.APP_VERSION,
})

export const getters = {
  authenticated(state) {
    return state.auth?.loggedIn ?? false
  },

  user(state) {
    return state.auth?.user ?? null
  },

  permissions(state) {
    const perms = state.auth?.user?.permissions_org
    return perms && typeof perms === "object" && !Array.isArray(perms) ? perms : {}
  },

  hasPermission: (state) => (permission) => {
    const perms = state.auth?.user?.permissions_org ?? {}
    return permission in perms
  },

  orgs(state) {
    return state.auth?.user?.orgs ?? []
  },

  snackbar(state) {
    return state.snackbar
  },

  getSnackbars(state) {
    return state.snackbars
  },

  appVersion(state) {
    return state.app_version
  },

  showLoading(state) {
    return state.block_loading
  },

  hideNextLoading(state) {
    return state.hide_next_loading
  },

  authTokenGoogle(state) {
    return state.auth?.token ?? null
  },

  authStrategy(state) {
    return state.auth?.strategy?.name ?? null
  },

  getConfig: (state) => (org, parameter) => {
    if (state.config.length === 0) return null

    const config = state.config.find((c) => c.org_id === org)
    if (!config) return null

    // Valida si existe el parámetro
    if (!Object.prototype.hasOwnProperty.call(config.keys, parameter)) return null

    return config.keys[parameter]
  },
}

export const mutations = {
  SET_SNACKBAR(state, snackbar) {
    state.snackbars = state.snackbars.concat(snackbar)
  },

  DELETE_SNACK(state, snackbar) {
    state.snackbars = state.snackbars.filter((snack) => snack.id > snackbar.id)
  },

  SHOW_LOADING(state) {
    if (!state.block_loading) {
      state.block_loading = true
    }
  },

  HIDE_LOADING(state) {
    if (state.block_loading) {
      state.block_loading = false
    }
  },

  HIDE_NEXT_LOADING(state) {
    state.hide_next_loading = true
  },

  SHOW_NEXT_LOADING(state) {
    state.hide_next_loading = false
  },

  SET_CONFIG(state, payload) {
    state.config = payload
  },
}

export const actions = {
  validatePermission({ state }, { permission, error }) {
    if (!state.auth?.user) return false

    const perms = state.auth.user.permissions_org ?? {}
    if (!(permission in perms)) {
      error({
        statusCode: 403,
        message: `Permiso requerido <span class="error-message">${permission}</span>`,
      })
      return false
    }

    return perms[permission]
  },

  notify({ commit, state }, data) {
    let notify

    if (data.success) {
      state.snack_id++
      notify = {
        text: data.success,
        color: "primary",
        showing: true,
        display: true,
        id: state.snack_id,
      }
    } else if (data.warning) {
      state.snack_id++
      notify = {
        text: data.warning,
        color: "warning",
        showing: true,
        display: true,
        id: state.snack_id,
      }
    } else if (data.error) {
      state.snack_id++
      notify = {
        text: data.error,
        color: "error",
        showing: true,
        display: true,
        id: state.snack_id,
      }
    }

    if (!notify) return

    commit("SET_SNACKBAR", notify)

    setTimeout(() => {
      commit("DELETE_SNACK", notify)
    }, state.snackbarTimeout)
  },

  closeSnackbar({ commit }, snackbar) {
    commit("DELETE_SNACK", snackbar)
  },

  showLoading({ commit }) {
    commit("SHOW_LOADING")
  },

  hideLoading({ commit }) {
    commit("HIDE_LOADING")
  },

  hideNextLoading({ commit }) {
    commit("HIDE_NEXT_LOADING")
  },

  showNextLoading({ commit }) {
    commit("SHOW_NEXT_LOADING")
  },

  async loadConfig({ commit }, settings) {
    try {
      const res = await this.$repository.Config.index({ settings })
      commit("SET_CONFIG", res)
    } catch (error) {
      console.error("Error loading config:", error)
    }
  },
}
