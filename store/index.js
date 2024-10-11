export const strict = false
export const state = () => ({
  snackbars: [],
  snack_id: 0,
  block_loading: false,
  hide_next_loading: false,
  locale: 'es',
  config: [],
})

export const getters = {
  // persistedStates(state) {
  //   return state.persistedStates;
  // },
  authenticated(state) {
    return state.auth.loggedIn
  },
  user(state) {
    return state.auth.user
  },
  permissions(state) {
    if (state.auth.user == null) return []
    if (state.auth.user) return state.auth.user.permissions_org
    else return []
  },
  orgs(state) {
    if (state.auth.user == null) return []
    if (state.auth.user) return state.auth.user.orgs
    else return []
  },
  snackbar(state) {
    return state.snackbar
  },
  getSnackbars(state) {
    return state.snackbars
  },
  showLoading(state) {
    return state.block_loading
  },
  hideNextLoading(state) {
    return state.hide_next_loading
  },
  getConfig: (state) => (org, parameter) => {
    if (state.config.length === 0) return null
    const config = state.config.find((c) => c.org_id === org)
    if (config == null) return null

    // validate if exists the parameter
    if (!Object.prototype.hasOwnProperty.call(config.keys, parameter))
      return null

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
  // CLOSE_SNACKBAR(state) {
  //   if (state.snackbar.display == true) {
  //     state.snackbar.display = false;
  //   }
  // },
  SHOW_LOADING(state) {
    if (state.block_loading === false) {
      state.block_loading = true
    }
  },
  HIDE_LOADING(state) {
    if (state.block_loading === true) {
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
  // SET_STATE(state, payload) {
  //   state.persistedState = payload;
  // }
}

export const actions = {
  validatePermission({ commit, state }, { permission, error }) {
    if (state.auth.user == null) return false
    // error is not a function fix
    if (
      !Object.prototype.hasOwnProperty.call(
        state.auth.user.permissions_org,
        permission
      )
    )
      error({
        statusCode: 403,
        message: `Permiso requerido <span class="error-message"> ${permission} </span>`,
      })
    else return state.auth.user.permissions_org[permission] // return the org_ids
  },
  notify({ commit, state }, data) {
    let notify
    if (data.success) {
      state.snack_id++
      notify = {
        text: data.success,
        color: 'primary',
        showing: true,
        display: true,
        // timeout: 3800,
        id: state.snack_id,
      }
    }
    if (data.error) {
      state.snack_id++
      notify = {
        text: data.error,
        color: 'error',
        showing: true,
        display: true,
        id: state.snack_id,
      }
    }
    if (notify == null) return

    commit('SET_SNACKBAR', notify)
    const notifyTimeOut = 4000
    setTimeout(() => {
      commit('DELETE_SNACK', notify)
    }, notifyTimeOut)
  },
  closeSnackbar({ commit }, snackbar) {
    commit('DELETE_SNACK', snackbar)
  },
  // closeNotify({ commit }) {
  //   commit("CLOSE_SNACKBAR");
  // },
  showLoading({ commit }) {
    commit('SHOW_LOADING')
  },
  hideLoading({ commit }) {
    commit('HIDE_LOADING')
  },
  hideNextLoading({ commit }) {
    commit('HIDE_NEXT_LOADING')
  },
  showNextLoading({ commit }) {
    commit('SHOW_NEXT_LOADING')
  },
  async loadConfig({ commit }, settings) {
    await this.$repository.Config.index({ settings }).then((res) => {
      commit('SET_CONFIG', res)
    })
  },
}
