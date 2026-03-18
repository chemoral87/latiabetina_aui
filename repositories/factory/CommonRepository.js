const multipart = {
  accept: "application/json",
  headers: { "Content-Type": "multipart/form-data" },
}

const reqCache = new Map()
export default ($axios) => (resource) => ({
  index(params, options = {}) {
    const { cacheMs, hideLoading = true, ...axiosOptions } = options
    const fullOptions = { ...axiosOptions }
    if (params) {
      fullOptions.params = params
    }
    if (hideLoading) {
      fullOptions.headers = { ...fullOptions.headers, "X-Hide-Loading": "true" }
    }

    const getOptions = Object.keys(fullOptions).length > 0 ? fullOptions : undefined

    if (cacheMs) {
      const key = `${resource}_${JSON.stringify(params || {})}`
      const now = Date.now()
      const cached = reqCache.get(key)

      if (cached && now - cached.time < cacheMs) {
        return cached.promise
      }

      const promise = $axios.$get(`${resource}`, getOptions).catch((err) => {
        if (reqCache.get(key)?.promise === promise) {
          reqCache.delete(key)
        }
        throw err
      })

      reqCache.set(key, { promise, time: now })

      setTimeout(() => {
        if (reqCache.get(key)?.promise === promise) {
          reqCache.delete(key)
        }
      }, cacheMs)

      return promise
    }

    return $axios.$get(`${resource}`, getOptions)
  },

  initialCatalog(params = {}) {
    return $axios.$get(`${resource}/initialCatalog`, { params })
  },

  show(id) {
    return $axios.$get(`${resource}/${id}`)
  },

  filter(params, options = {}) {
    const { hideLoading = true, ...axiosOptions } = options
    const fullOptions = { ...axiosOptions }
    if (params) {
      fullOptions.params = params
    }
    if (hideLoading) {
      fullOptions.headers = { ...fullOptions.headers, "X-Hide-Loading": "true" }
    }

    const getOptions = Object.keys(fullOptions).length > 0 ? fullOptions : undefined

    return $axios.$get(`${resource}/filter`, getOptions)
  },

  create(payload, options = {}) {
    const { hideLoading, ...axiosOptions } = options
    const config = Object.keys(axiosOptions).length > 0 ? axiosOptions : {}
    if (hideLoading) {
      config.headers = { ...config.headers, "X-Hide-Loading": "true" }
    }
    return $axios.$post(`${resource}`, payload, Object.keys(config).length > 0 ? config : undefined)
  },

  createForm(payload) {
    return $axios.$post(`${resource}`, payload, multipart)
  },

  update(id, payload) {
    return $axios.$put(`${resource}/${id}`, payload)
  },

  updateForm(id, payload) {
    return $axios.$post(`${resource}/${id}`, payload, multipart)
  },

  // belongsToMany
  children(id, payload) {
    return $axios.$put(`${resource}/${id}/children`, payload)
  },

  delete(id) {
    return $axios.$delete(`${resource}/${id}`)
  },
  change(payload) {
    return $axios.$post(`${resource}/change`, payload)
  },
  generate() {
    return $axios.$post(`${resource}/generate`)
  },
  fetch(params = {}) {
    return $axios.$get(`${resource}/fetch`, { params })
  },
})
