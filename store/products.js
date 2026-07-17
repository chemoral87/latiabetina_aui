export const state = () => ({
  products: [],
  loading: false,
})

export const getters = {
  allProducts(state) {
    return state.products
  },

  getProductById: (state) => (id) => {
    return state.products.find(p => p.id === id) ?? null
  },

  loading(state) {
    return state.loading
  },
}

export const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products
  },

  ADD_PRODUCT(state, product) {
    if (product.hidden) return // hidden products shouldn't appear in POS
    const exists = state.products.find(p => p.id === product.id)
    if (!exists) {
      state.products.push(product)
    }
  },

  UPDATE_PRODUCT(state, product) {
    const index = state.products.findIndex(p => p.id === product.id)
    if (index !== -1) {
      state.products.splice(index, 1, product)
    }
  },

  REMOVE_PRODUCT(state, productId) {
    const index = state.products.findIndex(p => p.id === productId)
    if (index !== -1) {
      state.products.splice(index, 1)
    }
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  },
}

export const actions = {
  async fetchProducts({ commit }, { apiOptions = {} } = {}) {
    commit('SET_LOADING', true)
    try {
      const res = await this.$repository.Product.pos(null, { cacheMs: 500, ...apiOptions })
      const products = res?.data || []
      commit('SET_PRODUCTS', products)
      return products
    } catch {
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  },
}
