import VuexPersistence from "vuex-persist"
import localforage from "localforage"

export default ({ store }) => {
  if (!process.client) return

  const vuexLocal = new VuexPersistence({
    key: "mazapan_v1",
    storage: localforage,
    asyncStorage: true,
    reducer: (state) => ({
      newinvest: state.newinvest,
      pitcher_store: state.pitcher_store,
    }),
  })

  vuexLocal.plugin(store)
}
