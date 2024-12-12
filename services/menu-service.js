export class MenuService {
  constructor(authenticated, permissions) {
    this.authenticated = authenticated
    this.permissions = permissions
  }

  hasPermission(permission) {
    return Object.prototype.hasOwnProperty.call(this.permissions, permission)
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

      if (this.hasPermission("organization-index")) menu.push({ icon: "mdi-domain", title: "Iglesias", to: "/organization" })
      if (this.hasPermission("user-index")) menu.push({ icon: "mdi-account", title: "Usuarios", to: "/user" })
      if (this.hasPermission("role-index")) menu.push({ icon: "mdi-redhat", title: "Roles", to: "/role" })
      if (this.hasPermission("permission-index")) menu.push({ icon: "mdi-key", title: "Permisos", to: "/permission" })

      if (this.hasPermission("store-index")) {
        menu.push({ icon: "mdi-store", title: "Tiendas", to: "/store" })
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
        {
          icon: "mdi-home",
          title: "Inicio",
          to: "/",
        },
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
