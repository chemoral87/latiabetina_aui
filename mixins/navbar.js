export default {
  methods: {
    /**
     * Configura la barra de navegación
     * @param {Object} config - Configuración del navbar
     * @param {string} config.title - Título a mostrar
     * @param {string} config.icon - Icono a mostrar (sin prefijo mdi-)
     * @param {string|Function} config.back - Ruta o función para el botón back
     * @param {boolean} config.show_drawer - Mostrar el drawer (default: true)
     * @param {boolean} config.show_login - Mostrar botón login (default: true)
     */
    setNavBar(config = {}) {
      const eventBus = this.$eventBus || this.$nuxt
      eventBus.$emit("setNavBar", config)
    },

    /**
     * Resetea el navbar a valores por defecto
     */
    resetNavBar() {
      const eventBus = this.$eventBus || this.$nuxt
      eventBus.$emit("setNavBar", {
        title: "",
        icon: null,
        back: null,
        show_drawer: true,
        show_login: true,
      })
    },
  },

  // Auto-configurar el navbar cuando el componente es montado
  mounted() {
    if (this.navBarConfig) {
      this.setNavBar(this.navBarConfig)
    }
  },
}
