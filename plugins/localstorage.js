import createPersistedState from "vuex-persistedstate"

export default ({ store }) => {
  createPersistedState({
    key: "adminaui_v1",
    paths: ["pitcher_store"],
  })(store)
}
