/**
 * Permission middleware
 *
 * Reads the required permission from `route.meta.permission` and shows a
 * 403 error page if the authenticated user doesn't have it.
 *
 * Usage (on any page):
 *   middleware: ["authenticated", "permission"],
 *   meta: { permission: "role-index" },
 *
 * Run AFTER the "authenticated" middleware so we can assume the user is logged in.
 */
export default function ({ store, error, route }) {
  // In Nuxt 2, route.meta is an ARRAY of meta objects (one per matched segment).
  // We must search through them to find the first one that defines a `permission`.
  const meta = Array.isArray(route.meta)
    ? route.meta.find((m) => m?.permission)
    : route.meta
  const required = meta?.permission
  if (!required) return // no permission required for this page

  const hasPermission = store.getters.hasPermission(required)

  if (!hasPermission) {
    return error({
      statusCode: 403,
      message: `No tienes permiso para acceder a esta página. Se requiere el permiso: <span class="error-message">${required}</span>`,
    })
  }
}
