export const state = () => ({
  errors: null,
  error_message: null,
})

export const getters = {
  errors(state) {
    return state.errors
  },
  error_message(state) {
    return state.error_message
  },
}

export const mutations = {
  SET_VALIDATION_ERRORS(state, payload) {
    state.errors = payload.errors
    state.error_message = payload.message
  },
}

// actions
export const actions = {
  setErrors({ commit }, payload) {
    commit('SET_VALIDATION_ERRORS', payload)
  },
  clearErrors({ commit }) {
    commit('SET_VALIDATION_ERRORS', { errors: null, error_message: null })
  },
}
