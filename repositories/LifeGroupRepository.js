import CommonRepository from "./factory/CommonRepository"

export default ($axios) => (resource) => {
  const common = CommonRepository($axios)(resource)

  return {
    ...common,

    /**
     * Get dashboard statistics for life groups.
     */
    dashboard(options = {}) {
      const { showLoading = false, ...axiosOptions } = options
      const fullOptions = { ...axiosOptions }
      if (showLoading) {
        fullOptions.headers = { ...fullOptions.headers, "X-Show-Loading": "true" }
      }
      return $axios.$get(`${resource}/dashboard`, Object.keys(fullOptions).length > 0 ? fullOptions : undefined)
    },

    /**
     * Search people by name (for duplicate prevention).
     */
    searchPeople(query, options = {}) {
      const { showLoading = false, ...axiosOptions } = options
      const fullOptions = { ...axiosOptions, params: { query } }
      if (showLoading) {
        fullOptions.headers = { ...fullOptions.headers, "X-Show-Loading": "true" }
      }
      return $axios.$get(`${resource}/people/search`, Object.keys(fullOptions).length > 0 ? fullOptions : undefined)
    },

    /**
     * Create a new person.
     */
    createPerson(payload, options = {}) {
      const { showLoading = false, ...axiosOptions } = options
      const config = Object.keys(axiosOptions).length > 0 ? axiosOptions : {}
      if (showLoading) {
        config.headers = { ...config.headers, "X-Show-Loading": "true" }
      }
      return $axios.$post(`${resource}/people`, payload, Object.keys(config).length > 0 ? config : undefined)
    },

    /**
     * Get attendance for a session.
     */
    getAttendance(sessionId, options = {}) {
      const { showLoading = false, ...axiosOptions } = options
      const fullOptions = { ...axiosOptions }
      if (showLoading) {
        fullOptions.headers = { ...fullOptions.headers, "X-Show-Loading": "true" }
      }
      return $axios.$get(
        `${resource}/sessions/${sessionId}/attendance`,
        Object.keys(fullOptions).length > 0 ? fullOptions : undefined
      )
    },

    /**
     * Register attendance for a session.
     */
    registerAttendance(sessionId, payload, options = {}) {
      const { showLoading = false, ...axiosOptions } = options
      const config = Object.keys(axiosOptions).length > 0 ? axiosOptions : {}
      if (showLoading) {
        config.headers = { ...config.headers, "X-Show-Loading": "true" }
      }
      return $axios.$post(
        `${resource}/sessions/${sessionId}/attendance`,
        payload,
        Object.keys(config).length > 0 ? config : undefined
      )
    },

    /**
     * Update a session (reschedule, cancel, notes).
     */
    updateSession(id, payload, options = {}) {
      const { showLoading = false, ...axiosOptions } = options
      const config = { ...axiosOptions }
      if (showLoading) {
        config.headers = { ...config.headers, "X-Show-Loading": "true" }
      }
      return $axios.$put(`${resource}/sessions/${id}`, payload, Object.keys(config).length > 0 ? config : undefined)
    },

    // ========================
    // Reports
    // ========================

    /**
     * Get a report as JSON for preview.
     */
    getReport(reportName, params = {}, options = {}) {
      const { showLoading = false, ...axiosOptions } = options
      const fullOptions = { ...axiosOptions }
      if (params) fullOptions.params = params
      if (showLoading) {
        fullOptions.headers = { ...fullOptions.headers, "X-Show-Loading": "true" }
      }
      return $axios.$get(`${resource}/reports/${reportName}`, Object.keys(fullOptions).length > 0 ? fullOptions : undefined)
    },

    /**
     * Download a report in the specified format (csv, xls, pdf).
     * Uses axios blob download to include JWT auth headers.
     */
    downloadReport(reportName, format, params = {}) {
      const queryParams = { ...params, format }

      return $axios({
        url: `${resource}/reports/${reportName}`,
        method: 'GET',
        params: queryParams,
        responseType: 'blob',
      }).then((response) => {
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${reportName}.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      })
    },
  }
}
