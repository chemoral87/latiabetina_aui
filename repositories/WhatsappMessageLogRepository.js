import CommonRepository from "./factory/CommonRepository"

export default ($axios) => (resource) => {
  const commonRepo = CommonRepository($axios)(resource)

  /**
   * Fetch paginated logs with optional filters.
   * @param {Object} params - { sender, receiver, success, per_page, page }
   */
  const getLogs = (params = {}) => {
    return $axios.$get(`${resource}/logs`, { params })
  }

  return {
    ...commonRepo,
    getLogs,
  }
}
