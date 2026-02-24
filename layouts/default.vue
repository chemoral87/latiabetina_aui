<template>
  <v-app class="back_white">
    <v-navigation-drawer v-model="drawer" :color="authenticated ? '' : 'banner'" :mini-variant="miniVariant" :clipped="clipped" temporary app touchless>
      <v-list>
        <v-list-item>
          <v-list-item-action class="mr-2">
            <v-img class="logo" width="35px" src="/favicon.ico"></v-img>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ title_companion }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact @click="closeDrawer">
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-spacer />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :clipped-left="clipped" class="elevation-2" fixed app :color="authenticated ? '' : 'banner'">
      <v-app-bar-nav-icon v-if="show_drawer" @click.stop="drawer = !drawer" />
      <v-toolbar-title class="pl-0">
        <v-btn v-if="backHandler" class="mr-1" outlined fab small elevation="0" @click="backHandler">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon v-if="icon">{{ icon }}</v-icon>
        {{ title }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn v-if="!authenticated && show_login" color="banner_item elevation-2" class="mr-2" @click="gotoLogin()">
        <v-icon>mdi-lock</v-icon>
      </v-btn>

      <v-menu v-if="authenticated" v-model="menu" offset-y :close-on-content-click="true">
        <template #activator="{ on, attrs }">
          <v-btn class="ml-3" small fab color="blue white--text" v-bind="attrs" v-on="on">
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="'/account'">
            <v-list-item-content>
              <v-list-item-title>{{ user.name }} {{ user.last_name }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>

          <v-list-item @click="logout()">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon>mdi-logout</v-icon>
                Cerrar Sesión
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="no-drag">
      <v-container fluid class="pa-0 no-drag">
        <Nuxt />
      </v-container>
      <MyLoading :value="loading_display"></MyLoading>

      <div class="snackbar-wrapper">
        <v-snackbar
          v-for="(snack, i) in snacks.filter((s) => s.display == true)"
          :key="i + 'snackbars'"
          v-model="snack.showing"
          :color="snack.color"
          content-class="snack-content"
          shaped
          multi-line
          right
          bottom
          absolute
          :timeout="snack.timeout"
          :style="`bottom: ${i * 69 + 0}px`"
        >
          <span class="text-subtitle-1 font-weight-bold">{{ snack.text }}</span>
          <template #action="{ attrs }">
            <v-btn color="grey" v-bind="attrs" fab small @click="snack.display = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-snackbar>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex"
import { MenuService } from "../services/menu-service"

export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      menu: false,
      title_companion: process.env.APP_NAME,
      title: "",
      icon: null,
      back: null,
      backHandler: null,
      show_drawer: true,
      show_login: true,
    }
  },

  computed: {
    ...mapGetters({
      authenticated: "authenticated",
      user: "user",
      permissions: "permissions",
      snacks: "getSnackbars",
      loading_display: "showLoading",
    }),

    items() {
      const menu_ = new MenuService(this.authenticated, this.permissions)
      return menu_.getMenu()
    },
  },

  created() {
    // Usar el event bus personalizado (con fallback a $nuxt)
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$on("setNavBar", this.setNavBar)
  },

  beforeDestroy() {
    // Limpiar listener para evitar memory leaks
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$off("setNavBar", this.setNavBar)
  },

  methods: {
    setNavBar(navbar) {
      this.title = navbar.title ?? ""
      this.icon = navbar.icon ?? null
      this.back = navbar.back ?? null

      if (typeof this.back === "function") {
        this.backHandler = navbar.back
      } else if (this.back) {
        this.backHandler = () => {
          this.$router.push(this.back)
        }
      } else {
        this.backHandler = null
      }

      this.show_drawer = navbar.show_drawer ?? true
      this.show_login = navbar.show_login ?? true
    },

    closeDrawer() {
      this.drawer = false
    },

    gotoLogin() {
      this.$router.push("/login")
    },

    gotoHome() {
      this.$router.push("/")
    },

    logout() {
      this.menu = false

      // Para Google, hacer logout local sin llamar al backend
      if (this.$auth.strategy.name === "google") {
        this.$router.push("/login")
        this.$nextTick(() => {
          this.$auth.reset()
        })
      } else {
        // Para Laravel, usar logout normal
        this.$auth.logout()
      }
    },
  },
}
</script>

<style scoped>
.snackbar-wrapper {
  position: fixed;
  height: 100%;
  width: 100%;
  pointer-events: none;
  top: 0;
  left: 0;
  z-index: 1000;
}

@media (max-width: 600px) {
  /* Snackbar box — still needs ::v-deep as wrapper is outside content-class scope */
  .snackbar-wrapper ::v-deep .v-snack__wrapper {
    min-width: 0 !important;
    max-width: 82vw !important;
    padding: 4px 8px !important;
    margin: 0 8px !important;
  }
  /* content-class="snack-content" targets this div directly — no ::v-deep needed */
  .snack-content {
    font-size: 0.9rem !important;
    padding: 6px 4px !important;
    min-height: 0 !important;
  }
  .snack-content span {
    font-size: 0.9rem !important;
    line-height: 1.3;
  }
  /* Action button — outside content-class scope, keep ::v-deep */
  .snackbar-wrapper ::v-deep .v-snack__action {
    padding: 0 2px !important;
  }
  .snackbar-wrapper ::v-deep .v-snack__action .v-btn {
    width: 28px !important;
    height: 28px !important;
  }
}
.back_white {
  background-color: #f5f5f5 !important;
}
.no-drag {
  overscroll-behavior: none;
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-drag: none;
}

/* Prevent pull-to-refresh in PWA */
.v-main.no-drag {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
