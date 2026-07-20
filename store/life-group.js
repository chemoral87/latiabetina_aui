export const state = () => ({
  lifeGroups: [],
  people: [],
  currentGroup: null,
  loading: false,
  dashboard: null,
})

export const getters = {
  allLifeGroups(state) {
    return state.lifeGroups
  },

  currentGroup(state) {
    return state.currentGroup
  },

  loading(state) {
    return state.loading
  },

  dashboard(state) {
    return state.dashboard
  },
}

export const mutations = {
  SET_LIFE_GROUPS(state, groups) {
    state.lifeGroups = groups
  },

  SET_CURRENT_GROUP(state, group) {
    state.currentGroup = group
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  },

  SET_DASHBOARD(state, dashboard) {
    state.dashboard = dashboard
  },

  ADD_PERSON(state, person) {
    state.people.push(person)
  },
}

export const actions = {
  async fetchLifeGroups({ commit }, { params, options } = {}) {
    commit("SET_LOADING", true)
    try {
      const res = await this.$repository.LifeGroup.index(params, options)
      commit("SET_LIFE_GROUPS", res?.data || [])
      return res
    } catch {
      return null
    } finally {
      commit("SET_LOADING", false)
    }
  },

  async fetchDashboard({ commit }, options = {}) {
    try {
      const res = await this.$repository.LifeGroup.dashboard(options)
      commit("SET_DASHBOARD", res)
      return res
    } catch {
      return null
    }
  },
}
