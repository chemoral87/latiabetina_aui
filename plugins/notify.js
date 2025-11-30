export default ({ store }, inject) => {
  inject("notify", (payload) => {
    store.dispatch("notify", payload)
  })
}
