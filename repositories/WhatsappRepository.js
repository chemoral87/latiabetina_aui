import CommonRepository from "./factory/CommonRepository"

export default ($axios) => (resource) => {
  const commonRepo = CommonRepository($axios)(resource)

  const status = () => {
    return $axios.$get(`${resource}/status`)
  }

  const sendMessage = (payload) => {
    return $axios.$post(`${resource}/send`, payload)
  }

  return {
    ...commonRepo,
    status,
    sendMessage,
  }
}
