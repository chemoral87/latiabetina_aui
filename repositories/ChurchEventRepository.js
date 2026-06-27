import CommonRepository from "./factory/CommonRepository"

export default ($axios) => (resource) => {
  const commonRepo = CommonRepository($axios)(resource)

  const copy = (id, payload, options = {}) => {
    const { showLoading = false, ...axiosOptions } = options
    const config = { ...axiosOptions }
    if (showLoading) {
      config.headers = { ...config.headers, "X-Show-Loading": "true" }
    }
    return $axios.$post(`${resource}/${id}/copy`, payload, Object.keys(config).length > 0 ? config : undefined)
  }

  const calendar = (params, options = {}) => {
    const { showLoading = false, ...axiosOptions } = options
    const fullOptions = { ...axiosOptions }
    if (params) {
      fullOptions.params = params
    }
    if (showLoading) {
      fullOptions.headers = { ...fullOptions.headers, "X-Show-Loading": "true" }
    }
    const getOptions = Object.keys(fullOptions).length > 0 ? fullOptions : undefined
    return $axios.$get(`${resource}/calendar`, getOptions)
  }

  return {
    ...commonRepo,
    copy,
    calendar,
  }
}
