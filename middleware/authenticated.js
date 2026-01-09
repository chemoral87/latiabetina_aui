export default function ({ store, redirect, route }) {
  if (!store.getters.authenticated) {
    // Guarda la ruta actual para redirigir después del login
    return redirect("/login?redirect=" + encodeURIComponent(route.fullPath))
  }
}
