import CommonRepository from './factory/CommonRepository'

export default ($axios) => (resource) => {
  const commonRepo = CommonRepository($axios)(resource)

  /**
   * Fetch all sales for a given date with items + products loaded.
   * Calls GET /sale/daily?date=YYYY-MM-DD&org_id=X
   *
   * @param {string} date    - ISO date string e.g. '2026-07-17'
   * @param {number|string} orgId - optional org filter
   */
  const daily = (date, orgId = null) => {
    const params = { date }
    if (orgId) params.org_id = orgId
    return $axios.$get(`${resource}/daily`, { params })
  }

  const preparing = () => {
    return $axios.$get(`${resource}/kds`)
  }

  const complete = (id) => {
    return $axios.$patch(`${resource}/${id}/complete`)
  }

  const updateItem = (saleId, itemId, status) => {
    return $axios.$patch(`${resource}/${saleId}/item/${itemId}`, { status })
  }

  return {
    ...commonRepo,
    daily,
    preparing,
    complete,
    updateItem,
  }
}
