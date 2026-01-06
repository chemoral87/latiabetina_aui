import es from "vuetify/lib/locale/es"

export default function (context) {
  // Personalizar el idioma español
  const customEs = {
    ...es,
    dataFooter: {
      ...es.dataFooter,
      itemsPerPageText: "Filas por pág:",
      itemsPerPageAll: "Todos",
      pageText: "{0}-{1}/{2}",
    },
    dataTable: {
      itemsPerPageText: "Filas por pág:",
    },
  }

  // Aplicar la configuración al framework de Vuetify
  context.app.vuetify.framework.lang.locales.es = customEs
  context.app.vuetify.framework.lang.current = "es"
}
