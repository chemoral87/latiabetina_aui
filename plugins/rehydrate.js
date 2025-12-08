export default async ({ store }) => {
  if (typeof process !== "undefined" && !process.client) return

  try {
    // Dispatch hydrate action in the pitcher_store module (if available)
    if (store.dispatch) {
      // Use namespaced dispatch if module is namespaced
      const actionName = store._actions && store._actions["pitcher_store/hydrate"] ? "pitcher_store/hydrate" : "hydrate"
      await store.dispatch(actionName)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("rehydrate plugin: hydrate dispatch failed", err)
  }
}
