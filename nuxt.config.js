import colors from "vuetify/es5/util/colors"

const isDev = process.env.NODE_ENV !== "production"
const port = 3001
const APP_VERSION = "1.0.26"

// Carga de variables de entorno
let env
if (isDev) {
  env = require("dotenv").config({ path: ".env" })
} else {
  env = require("dotenv").config({ path: ".env.production" })
}

export default {
  // Server configuration
  server: {
    port,
    timing: false, // Desactiva server timing header
  },

  // Environment variables
  env: {
    APP_VERSION,
    ...env.parsed,
  },

  ssr: false,
  telemetry: false,

  // Global page headers
  head: {
    titleTemplate: "Admin",
    title: "Admin",
    htmlAttrs: {
      lang: "es", // Español basado en tu store locale
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "Sistema de administración" },
      { name: "format-detection", content: "telephone=no" },
      { name: "version", content: APP_VERSION },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      // Preconnect al backend para mejorar rendimiento
      ...(process.env.BASE_URL
        ? [
            { rel: "preconnect", href: process.env.BASE_URL },
            { rel: "dns-prefetch", href: process.env.BASE_URL },
          ]
        : []),
    ],
  },

  // Global CSS
  css: [],

  // Plugins
  plugins: [
    "./plugins/mixins/user.js",
    "./plugins/mixins/utils.js",
    "./plugins/mixins/validation.js",
    "./plugins/filters.js",
    "./plugins/axios.js",
    "./plugins/repository.js",
    "./plugins/handleError.js",
    "./plugins/eventBus.js",
  ],

  // Auto import components
  components: true,

  // Build modules
  buildModules: ["@nuxtjs/eslint-module", "@nuxtjs/vuetify"],

  // Modules
  modules: ["@nuxtjs/axios", "@nuxtjs/auth-next", ["@nuxtjs/dotenv", { filename: ".env." + process.env.NODE_ENV }]],

  // Auth configuration
  auth: {
    redirect: {
      login: "/login",
      logout: "/login",
      home: false,
      callback: false,
    },
    strategies: {
      laravelJWT: {
        provider: "laravel/jwt",
        token: {
          property: "access_token",
          maxAge: 60 * 60,
        },
        refreshToken: {
          maxAge: 20160 * 60,
        },
        url: "/",
        endpoints: {
          login: { url: "auth/login", method: "post" },
          refresh: { url: "auth/refresh", method: "post" },
          logout: { url: "auth/logout", method: "post" },
          user: { url: "auth/user", method: "post" },
        },
      },
      google: {
        provider: "laravel/jwt",
        token: {
          property: "access_token",
          maxAge: 60 * 60,
        },
        refreshToken: {
          maxAge: 20160 * 60,
        },
        user: {
          property: false,
          autoFetch: false,
        },
        url: "/",
        endpoints: {
          login: { url: "auth/google/validate", method: "post" },
          refresh: { url: "auth/refresh", method: "post" },
          logout: { url: "auth/logout", method: "post" },
          user: { url: "auth/user", method: "post" },
        },
      },
    },
  },

  // Axios configuration mejorada
  axios: {
    baseURL: process.env.BASE_URL,
    progress: true, // Muestra barra de progreso
    retry: { retries: 2 }, // Reintentos en caso de fallo
    credentials: true, // Envía cookies
  },

  // Loading bar personalizada
  loading: {
    color: colors.blue.darken2,
    height: "3px",
    continuous: true,
  },

  // Router configuration
  router: {
    prefetchLinks: true, // Prefetch de páginas enlazadas
  },

  // Vuetify configuration
  vuetify: {
    treeShake: true,
    customVariables: ["~/assets/variables.scss"],
    defaultAssets: {
      font: {
        family: "Roboto",
      },
      icons: "mdi",
    },
    theme: {
      dark: false,
      options: {
        customProperties: true,
      },
      themes: {
        light: {
          // primary: colors.blue.darken2, // #1976D2
          // accent: colors.grey.darken3, // #424242
          // secondary: colors.amber.darken3, // #FFA000
          // info: colors.teal.lighten1, // #26A69A
          // warning: colors.amber.base, // #FFC107
          // error: colors.deepOrange.accent4, // #DD2C00
          // success: colors.green.accent3, // #dfbfbfff
        },
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

  // Build configuration optimizada
  build: {
    // Analizar bundle (ejecuta: npm run build -- --analyze)
    analyze:
      process.env.ANALYZE === "true"
        ? {
            analyzerMode: "static",
            generateStatsFile: true,
            openAnalyzer: true,
          }
        : false,

    // Extrae CSS en producción para mejor caching
    extractCSS: !isDev,

    // Optimiza CSS en producción
    optimizeCSS: !isDev,

    // Splitting mejorado
    splitChunks: {
      layouts: true,
      pages: true,
      commons: true,
    },

    // Optimización adicional de chunks
    optimization: {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          // Separa vendors grandes
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1]
              return packageName ? `npm.${packageName.replace("@", "")}` : "vendor"
            },
          },
          // Vuetify en su propio chunk
          vuetify: {
            test: /[\\/]node_modules[\\/]vuetify[\\/]/,
            name: "vuetify",
            priority: 20,
          },
        },
      },
    },

    // Filenames con hash para cache
    filenames: {
      app: ({ isDev }) => (isDev ? "[name].js" : "[name].[contenthash:7].js"),
      chunk: ({ isDev }) => (isDev ? "[name].js" : "[id].[contenthash:7].js"),
      css: ({ isDev }) => (isDev ? "[name].css" : "[name].[contenthash:7].css"),
      img: ({ isDev }) => (isDev ? "[path][name].[ext]" : "img/[name].[contenthash:7].[ext]"),
      font: ({ isDev }) => (isDev ? "[path][name].[ext]" : "fonts/[name].[contenthash:7].[ext]"),
    },

    // Transpila Vuetify correctamente
    transpile: ["vuetify/lib"],

    // Babel optimizado
    babel: {
      compact: !isDev,
    },

    // Cache para builds más rápidos
    cache: true,

    // Build paralelo en producción
    parallel: !isDev,

    // Hard source para cache persistente
    hardSource: !isDev,

    // Performance hints
    extend(config, { isDev, isClient }) {
      if (!isDev && isClient) {
        config.performance = {
          maxEntrypointSize: 512000,
          maxAssetSize: 512000,
          hints: "warning",
        }
      }
    },
  },

  // Render configuration
  render: {
    // Compresión
    compressor: { threshold: 0 },

    // Resource hints
    resourceHints: true,

    // Static cache
    static: {
      maxAge: isDev ? 0 : 1000 * 60 * 60 * 24 * 7, // 7 días
    },
  },

  // Modo moderno para navegadores actuales (bundles más pequeños)
  modern: !isDev ? "client" : false,
}
