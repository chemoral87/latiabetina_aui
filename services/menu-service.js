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

      if (this.hasPermission("organization-index")) menu.push({ icon: "mdi-domain", title: "Iglesias", to: "/organizations" })
      if (this.hasPermission("user-index")) menu.push({ icon: "mdi-account", title: "Usuarios", to: "/users" })
      if (this.hasPermission("role-index")) menu.push({ icon: "mdi-redhat", title: "Roles", to: "/roles" })
      if (this.hasPermission("permission-index")) menu.push({ icon: "mdi-key", title: "Permisos", to: "/permissions" })
      if (this.hasPermission("investment-index"))
        menu.push({
          icon: "mdi-pencil-box",
          title: "Inversiones",
          to: "/investment",
        })

      if (this.hasPermission("investment-my-profile")) {
        menu.push({
          icon: "mdi-account",
          title: "Perfil Inversor",
          to: "/investment-my/profile",
        })
      }
      if (this.hasPermission("investment-my-index")) {
        menu.push({
          icon: "mdi-pencil-box",
          title: "Inversiones",
          to: "/investment-my",
        })
      }
      if (this.hasPermission("credit-index")) {
        menu.push({ icon: "mdi-cash", title: "Creditos", to: "/credit" })
      }
      if (this.hasPermission("consolidador-index")) {
        menu.push({
          icon: "mdi-account-plus",
          title: "Consolidar",
          to: "/consolidate",
        })
        menu.push({
          icon: "mdi-account-group",
          title: "Mis Consolidados",
          to: "/consolidate/my",
        })
        menu.push({
          icon: "mdi-phone",
          title: "Seguimiento",
          to: "/consolidate/calls",
        })
      }

      if (this.hasPermission("casas-fe-index")) {
        menu.push({
          icon: "mdi-home",
          title: "Casa Fe",
          to: "/faith-house",
        })
      }

      if (this.hasPermission("casas-fe-index")) {
        menu.push({
          icon: "mdi-home",
          title: "CF Membresía",
          to: "/faith-house-membership",
        })
      }

      if (this.hasPermission("attendant-index")) {
        menu.push({
          icon: "mdi-human-greeting-variant",
          title: "Servidores",
          to: "/attendant",
        })
      }

      if (this.hasPermission("church-service-index")) {
        menu.push({
          icon: "mdi-church",
          title: "Servicio General",
          to: "/church-service",
        })
        menu.push({
          icon: "mdi-church",
          title: "Visor Servicio G.",
          to: "/church-service-rol",
        })
      }

      if (this.hasPermission("super-admin")) {
        menu.push({
          icon: "mdi-sprout",
          title: "Agro Evento",
          to: "/agro-event",
        })
        menu.push({
          icon: "mdi-hand-heart",
          title: "Ministerios",
          to: "/ministry",
        })
        menu.push({
          icon: "mdi-qrcode-scan",
          title: "SkyKids Rooms",
          to: "/sky-kids-room",
        })
        menu.push({
          icon: "mdi-google-classroom",
          title: "SkyKids CheckIn",
          to: "/sky-kids-checkin",
        })
        menu.push({
          icon: "mdi-teddy-bear",
          title: "SkyKids Registro",
          to: "/sky-kids-registration",
        })
        menu.push({
          icon: "mdi-church",
          title: "Servicio General",
          to: "/church-service",
        })

        menu.push({
          icon: "mdi-church",
          title: "Visor Servicio G.",
          to: "/church-service-rol",
        })
        menu.push({
          icon: "mdi-human-greeting-variant",
          title: "Servidores",
          to: "/attendant",
        })
        menu.push({
          icon: "mdi-chart-bar",
          title: "Reportes",
          to: "/reports",
        })

        menu.push({
          icon: "mdi-engine",
          title: "Template G",
          to: "/template-generator",
        })
      }

      if (this.hasPermission("parking-car-index")) {
        menu.push({
          icon: "mdi-car",
          title: "Estacionamiento",
          to: "/parking-car",
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
