import CommonRepository from './factory/CommonRepository'

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
    const { showLoading = false, ...axiosOptions } = options
    const fullOptions = { ...axiosOptions }
    if (orgId) fullOptions.params = { org_id: orgId }
    if (showLoading) {
      fullOptions.headers = { ...fullOptions.headers, 'X-Show-Loading': 'true' }
    }
    return $axios.$get(`${resource}/pos`, fullOptions)
  }

  return {
    ...commonRepo,
    reorder,
    pos,
  }
}
