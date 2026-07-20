import CommonRepository from "./factory/CommonRepository"

export default ($axios) => (resource) => {
  const commonRepo = CommonRepository($axios)(resource)

  const distribution = (id, params = {}, options = {}) => {
    const { showLoading = false, ...axiosOptions } = options
    const fullOptions = { ...axiosOptions }
    if (params && Object.keys(params).length > 0) {
      fullOptions.params = params
    }
    if (showLoading) {
      fullOptions.headers = { ...fullOptions.headers, "X-Show-Loading": "true" }
    }
    const getOptions = Object.keys(fullOptions).length > 0 ? fullOptions : undefined
    return $axios.$get(`${resource}/${id}/distribution`, getOptions)
  }

  return {
    ...commonRepo,
    distribution,
  }
}
