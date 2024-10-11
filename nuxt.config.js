import colors from "vuetify/es5/util/colors"

let env
// let title
let port_ = 3000
// let dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
if (process.env.NODE_ENV === "production") {
  env = require("dotenv").config({ path: ".env.production" })
  // env = require('dotenv').config({ path: '.env.production' })
  // title = process.env.APP_NAME
} else {
  env = require("dotenv").config({ path: ".env" })
  // env = require('dotenv').config({ path: '.env' })
  // title = process.env.APP_ENVIRONMENT
  port_ = 3001
}

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  server: {
    port: port_,
  },
  env: env.parsed,
  ssr: false,
  telemetry: false,
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: "%s - latiabetina_aui",
    title: "latiabetina_aui",
    htmlAttrs: {
      lang: "en",
    },
    meta: [{ charset: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { hid: "description", name: "description", content: "" }, { name: "format-detection", content: "telephone=no" }],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["./plugins/mixins/user.js", "./plugins/mixins/utils.js", "./plugins/mixins/validation.js", "./plugins/filters.js", "./plugins/axios.js"],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    "@nuxtjs/eslint-module",
    // https://go.nuxtjs.dev/vuetify
    "@nuxtjs/vuetify",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["@nuxtjs/axios", "@nuxtjs/auth-next", ["@nuxtjs/dotenv", { filename: ".env." + process.env.NODE_ENV }]],
  auth: {
    redirect: {
      logout: "/login",
    },
    strategies: {
      laravelJWT: {
        // optional //
        provider: "laravel/jwt",
        token: {
          property: "access_token",
          maxAge: 60 * 60,
        },
        refreshToken: {
          maxAge: 20160 * 60,
        },
        // optional. //
        url: "/",
        endpoints: {
          login: {
            url: "auth/login",
            method: "post",
          },
          refresh: {
            url: "auth/refresh",
            method: "post",
          },
          logout: {
            url: "auth/logout",
            method: "post",
          },
          user: {
            url: "auth/user",
            method: "post",
          },
        },
      },
    },
  },
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: process.env.BASE_URL,
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}
