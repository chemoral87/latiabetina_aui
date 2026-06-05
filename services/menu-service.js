export class MenuService {
  constructor(authenticated, permissions) {
    this.authenticated = authenticated
    this.permissions = permissions || {}
  }

  hasPermission(permission) {
    return !!(this.permissions && permission in this.permissions)
  }

  getMenu() {
    const menu = []
    if (this.authenticated) {
      // logged
      menu.push({
        icon: "mdi-view-dashboard",
        title: "Dashboard",
        to: "/dashboard",
      })

      if (this.hasPermission("organization-index")) menu.push({ icon: "mdi-domain", title: "Orgs", to: "/organization" })
      if (this.hasPermission("user-index")) menu.push({ icon: "mdi-account", title: "Usuarios", to: "/user" })
      if (this.hasPermission("role-index")) menu.push({ icon: "mdi-redhat", title: "Roles", to: "/role" })
      if (this.hasPermission("permission-index")) menu.push({ icon: "mdi-key", title: "Permisos", to: "/permission" })
      if (this.hasPermission("auditorium-index")) menu.push({ icon: "mdi-seat", title: "Auditorio", to: "/auditorium" })

      if (this.hasPermission("auditorium-index")) menu.push({ icon: "mdi-theater", title: "Eventos de Auditorio", to: "/auditorium-event" })

      if (this.hasPermission("store-index")) {
        menu.push({ icon: "mdi-store", title: "Tiendas", to: "/store" })
      }

      if (this.hasPermission("expense-ticket-index")) {
        menu.push({ icon: "mdi-receipt", title: "Ticket de Gastos", to: "/expense-ticket" })
      }

      if (this.hasPermission("testimony-index")) {
        menu.push({ icon: "mdi-comment-text", title: "Testimonios", to: "/testimony" })
      }

      if (this.hasPermission("church-event-index")) {
        menu.push({ icon: "mdi-calendar", title: "Eventos  Iglesia", to: "/church-event" })
      }

      if (this.hasPermission("conso-sheet-index")) {
        menu.push({ icon: "mdi-account-multiple", title: "Consolidación", to: "/consolidation" })
      }

      if (this.hasPermission("ukelele-course")) {
        menu.push({
          icon: "mdi-guitar-acoustic",
          title: "Ukelele",
          to: "/courses/ukelele",
          children: [
            { title: "Día 1", to: "/courses/ukelele?day=1&order=TR,P" },
            { title: "Día 2", to: "/courses/ukelele?day=2&order=TR,P" },
            { title: "Día 3", to: "/courses/ukelele?day=3&order=TR,P" },
            { title: "Día 4", to: "/courses/ukelele?day=4&order=TR,P" },
            { title: "Día 5", to: "/courses/ukelele?day=5&order=TR,P" },
            { title: "Día 6", to: "/courses/ukelele?day=6&order=TR,P" },
          ],
        })
      }
      // menu.push({
      //   icon: "mdi-chart-bar",
      //   title: "ReportesA",
      //   to: "/reports",
      // });
      // menu.push({
      //   icon: "mdi-chart-bar",
      //   title: "ReportesB",
      //   to: "/reports",
      // });
    } else {
      menu.push(
        // {
        //   icon: "mdi-home",
        //   title: "Inicio",
        //   to: "/",
        // },
        {
          icon: "mdi-lock",
          title: "Inicia Sesión ",
          to: "/login",
        }
      )
    }
    // remove duplicates
    const uniqueArr = menu.filter((v, i, a) => a.findIndex((t) => t.to === v.to) === i)
    return uniqueArr
  }
}
