/**
 * Middleware para manejar redirecciones después de autenticación
 * - Redirige a ruta guardada en sessionStorage si existe
 * - Si no hay redirect guardado y usuario está autenticado, va a dashboard
 * - Limpia sessionStorage después del redirect
 */
export default function ({ app, redirect, route }) {
  // Solo procesar si estamos en cliente
  if (!process.client) return

  // No procesar en la página de login
  if (route.path === "/login") return

  // Si el usuario está autenticado
  if (app.$auth.loggedIn) {
    const loginRedirect = sessionStorage.getItem("loginRedirect")
    
    if (loginRedirect) {
      // Limpia el sessionStorage
      sessionStorage.removeItem("loginRedirect")
      
      // Redirige al path guardado
      return redirect(loginRedirect)
    } else if (route.path === "/" || route.path === "") {
      // Si viene del home y no hay redirect específico, ir a dashboard
      return redirect("/dashboard")
    }
  }
}
