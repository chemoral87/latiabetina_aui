<template>
  <v-app class="back_white">
    <v-navigation-drawer v-model="drawer" :color="authenticated ? '' : 'banner'" :mini-variant="miniVariant" :clipped="clipped" temporary app>
      <v-list>
        <v-list-item>
          <v-list-item-action class="mr-2">
            <v-img class="logo" width="35px" src="/logo.png"></v-img>
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
        <v-icon v-if="icon">mdi-{{ icon }}</v-icon>
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
    <v-main>
      <v-container fluid class="pa-0">
        <Nuxt />
      </v-container>
      <MyLoading :value="loading_display"></MyLoading>

      <div class="snackbar-wrapper">
        <v-snackbar
          v-for="(snack, i) in snacks.filter((s) => s.display == true)"
          :key="i + 'snackbars'"
          v-model="snack.showing"
          :color="snack.color"
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
import { MenuService } from "../services/menu-service"
export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false, // footer
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
    // snackbar_display: {
    //   get() {
    //     return this.snackbar.display;
    //   },
    //   set() {
    //     this.$store.dispatch("closeNotify");
    //   },
    // },
    loading_display() {
      return this.showLoading
    },
    items() {
      const menu_ = new MenuService(this.authenticated, this.permissions)
      return menu_.getMenu()
    },
    snacks() {
      return this.$store.getters.getSnackbars
    },
  },
  created() {
    this.$nuxt.$on("setNavBar", ($event) => this.setNavBar($event))
    // this.$store.dispatch("loadConfig");
  },
  methods: {
    setNavBar(navbar) {
      const me = this
      this.title = Object.prototype.hasOwnProperty.call(navbar, "title") ? navbar.title : null
      this.icon = Object.prototype.hasOwnProperty.call(navbar, "icon") ? navbar.icon : null
      this.back = Object.prototype.hasOwnProperty.call(navbar, "back") ? navbar.back : null
      if (typeof this.back === "function") {
        this.backHandler = navbar.back
      } else if (this.back) {
        this.backHandler = () => {
          me.$router.push(me.back)
        }
      } else {
        this.backHandler = null
      }

      this.show_drawer = Object.prototype.hasOwnProperty.call(navbar, "show_drawer") ? navbar.show_drawer : true
      this.show_login = Object.prototype.hasOwnProperty.call(navbar, "show_login") ? navbar.show_login : true
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
      this.$auth.logout()
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
.back_white {
  background-color: #f5f5f5 !important;
}
</style>
