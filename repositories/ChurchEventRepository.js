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

  return {
    ...commonRepo,
    copy,
  }
}
