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
  target: "static",
  telemetry: false,

  // Global page headers
  head: {
    titleTemplate: "Admin",
    title: "Admin",
    htmlAttrs: {
      lang: "es",
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
      ...(process.env.BASE_URL
        ? [
            { rel: "preconnect", href: process.env.BASE_URL },
            { rel: "dns-prefetch", href: process.env.BASE_URL },
          ]
        : []),
    ],
  },

  // Global CSS
  css: ["./assets/global.css"],

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
    "./plugins/notify.js",
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
      home: "/dashboard",
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

  // Axios configuration
  axios: {
    baseURL: process.env.BASE_URL,
    progress: true,
    retry: {
      retries: 2,
      retryCondition: (error) => {
        return error.response?.status >= 500
      },
    },
    credentials: true,
  },

  // Loading bar
  loading: {
    color: colors.blue.darken2,
    height: "3px",
    continuous: true,
  },

  // Router configuration
  router: {
    prefetchLinks: true,
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
        light: {},
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
    // Analizar bundle
    analyze:
      process.env.ANALYZE === "true"
        ? {
            analyzerMode: "static",
            generateStatsFile: true,
            openAnalyzer: true,
          }
        : false,

    // CORRECCIÓN: extractCSS no puede trabajar con parallel ni hardSource
    // En producción: extractCSS activo, parallel y hardSource desactivados
    // En desarrollo: parallel activo para velocidad, extractCSS desactivado
    extractCSS: !isDev
      ? {
          ignoreOrder: true, // Ignora warnings de orden de CSS
        }
      : false,

    // Optimiza CSS solo en producción
    optimizeCSS: !isDev,

    // Parallel DESACTIVADO siempre que extractCSS esté activo
    parallel: false,

    // Cache para builds más rápidos
    cache: true,

    // Hard source DESACTIVADO cuando extractCSS está activo
    hardSource: false,

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
        automaticNameDelimiter: ".",
        maxSize: 244000,
        cacheGroups: {
          // Separa vendors grandes
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            priority: 10,
            reuseExistingChunk: true,
          },
          // Vuetify en su propio chunk
          vuetify: {
            test: /[\\/]node_modules[\\/]vuetify[\\/]/,
            name: "vuetify",
            priority: 20,
            reuseExistingChunk: true,
          },
          // Lodash y utilidades
          utilities: {
            test: /[\\/]node_modules[\\/](lodash|moment|date-fns)[\\/]/,
            name: "utilities",
            priority: 15,
            reuseExistingChunk: true,
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
      presets({ isServer }) {
        return [
          [
            require.resolve("@nuxt/babel-preset-app"),
            {
              buildTarget: isServer ? "server" : "client",
              corejs: { version: 3 },
            },
          ],
        ]
      },
    },

    // Terser para minificación en producción
    terser: {
      terserOptions: {
        compress: {
          drop_console: !isDev, // Elimina console.log en producción
          drop_debugger: !isDev,
          pure_funcs: !isDev ? ["console.log", "console.info", "console.debug"] : [],
        },
        output: {
          comments: false,
        },
      },
    },

    // Performance hints
    extend(config, { isDev, isClient }) {
      // Source maps solo en desarrollo
      if (isDev) {
        config.devtool = "eval-source-map"
      }

      // Performance hints en producción
      if (!isDev && isClient) {
        config.performance = {
          maxEntrypointSize: 512000, // 500kb
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
      maxAge: isDev ? 0 : 1000 * 60 * 60 * 24 * 7, // 7 días en producción
    },

    // Headers de seguridad
    csp: !isDev
      ? {
          hashAlgorithm: "sha256",
          policies: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "data:", "https:"],
            "font-src": ["'self'", "data:"],
            "connect-src": ["'self'", process.env.BASE_URL],
          },
        }
      : false,
  },

  // Modo moderno para navegadores actuales
  modern: !isDev ? "client" : false,

  // Genera sitemap automáticamente
  generate: {
    fallback: true,
    interval: 2000,
  },
}
