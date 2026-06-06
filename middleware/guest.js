export default function ({ store, redirect, route }) {
  if (store.getters.authenticated) {
    // Verifica si hay un redirect en query param o localStorage
    const redirectFromQuery = route.query.redirect
    if (redirectFromQuery) {
      return redirect(redirectFromQuery)
    }
    
    // Fallback a localStorage
    if (process.client) {
      const loginRedirect = localStorage.getItem("loginRedirect")
      if (loginRedirect) {
        localStorage.removeItem("loginRedirect")
        return redirect(loginRedirect)
      }
    }
    
    // Default redirect
    return redirect('/dashboard')
  }
}
