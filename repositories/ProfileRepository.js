import ParentRepository from "./factory/ParentRepository"

export default ($axios) => (resource) => {
  // Get the common repository with all default methods
  const commonRepo = ParentRepository($axios)(resource)

  const favorite = (parentId, id, payload) => {
    return $axios.$post(`${resource}/${parentId}/${id}/favorite`, payload)
  }

  // Return a new object with all methods from commonRepo and the new register method
  return {
    ...commonRepo,
    favorite,
    // register,
    // sendResetCode,
    // resetPassword
  }
}
