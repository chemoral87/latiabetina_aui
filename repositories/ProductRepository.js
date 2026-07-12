import CommonRepository from './factory/CommonRepository'

const reqCache = new Map()

export default ($axios) => (resource) => {
  const commonRepo = CommonRepository($axios)(resource)

  const reorder = (ids, options = {}) => {
    const { showLoading = false, ...axiosOptions } = options
    const config = { ...axiosOptions }
    if (showLoading) {
      config.headers = { ...config.headers, 'X-Show-Loading': 'true' }
    }
    return $axios.$post(
      `${resource}/reorder`,
      { ids },
      Object.keys(config).length > 0 ? config : undefined
    )
  }

  const pos = (orgId = null, options = {}) => {
    const { cacheMs, showLoading = false, ...axiosOptions } = options
    const fullOptions = { ...axiosOptions }
    if (orgId) fullOptions.params = { org_id: orgId }
    if (showLoading) {
      fullOptions.headers = { ...fullOptions.headers, 'X-Show-Loading': 'true' }
    }

    if (cacheMs) {
      const key = `${resource}_pos_${orgId}`
      const now = Date.now()
      const cached = reqCache.get(key)

      if (cached && now - cached.time < cacheMs) {
        return cached.promise
      }

      const promise = $axios.$get(`${resource}/pos`, fullOptions).catch((err) => {
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

    return $axios.$get(`${resource}/pos`, fullOptions)
  }

  return {
    ...commonRepo,
    reorder,
    pos,
  }
}
