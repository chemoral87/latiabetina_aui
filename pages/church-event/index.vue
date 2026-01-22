<template>
  <v-container fluid>
    <v-row dense>
      <!-- Filtro de búsqueda -->
      <v-col cols="12" md="2">
        <v-text-field v-model="filterChurchEvent" append-icon="mdi-magnify" clearable hide-details placeholder="Buscar evento..." dense :disabled="loading" />
      </v-col>

      <!-- Botones de acción -->
      <v-col cols="12" md="3">
        <v-btn color="primary" class="mr-2" @click="newChurchEvent">
          <v-icon left>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="refreshChurchEvents">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>

      <!-- Tabla de eventos -->
      <v-col cols="12">
        <ChurchEventTable :options="options" :response="response" :loading="loading" @sorting="handleSorting" @edit="editChurchEvent" @delete="beforeDeleteChurchEvent" />
      </v-col>
    </v-row>

    <!-- Diálogo para crear/editar evento -->
    <ChurchEventDialog v-if="churchEventDialog" :church-event="churchEvent" :loading="saving" @close="closeDialog" @save="saveChurchEvent" />

    <!-- Diálogo de confirmación de eliminación -->
    <DialogDelete v-if="churchEventDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteChurchEvent" @close="churchEventDialogDelete = false" />
  </v-container>
</template>

<script>
import { debounce } from "lodash-es"

export default {
  middleware: ["authenticated"],

  async asyncData({ app, error, store }) {
    store.dispatch("validatePermission", { error, permission: "church-event-index" })

    const options = {
      page: 1,
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 10,
    }

    try {
      const response = await app.$repository.ChurchEvent.index(options)
      return { response, options }
    } catch (e) {
      console.error("Error loading church events:", e)
      error({ statusCode: e.response?.status || 500, message: "Error al cargar eventos de iglesia" })
      return {
        response: { data: [], total: 0 },
        options,
      }
    }
  },

  data() {
    return {
      filterChurchEvent: "",
      churchEvent: {},
      response: { data: [], total: 0 },
      options: {
        page: 1,
        sortBy: ["name"],
        sortDesc: [false],
        itemsPerPage: 10,
      },
      churchEventDialog: false,
      churchEventDialogDelete: false,
      dialogDelete: {},
      loading: false,
      saving: false,
      deleting: false,
      skipFilterWatch: false, // Flag para evitar llamadas duplicadas
    }
  },

  computed: {
    hasChurchEvents() {
      return this.response?.data?.length > 0
    },
  },

  watch: {
    filterChurchEvent: {
      handler: debounce(function (value) {
        // Si skipFilterWatch está activo, no ejecutar el watch
        if (this.skipFilterWatch) {
          this.skipFilterWatch = false
          return
        }
        this.handleFilterChange(value)
      }, 500),
    },
  },

  mounted() {
    this.setNavBar()
  },

  methods: {
    setNavBar() {
      const eventBus = this.$eventBus || this.$nuxt
      eventBus.$emit("setNavBar", {
        title: "Eventos de Iglesia",
        icon: "mdi-calendar",
      })
    },

    /**
     * Maneja el cambio en el filtro de búsqueda
     */
    async handleFilterChange(value) {
      await this.loadChurchEvents({ filter: value || "", page: 1 })
    },

    /**
     * Carga los eventos con las opciones especificadas
     */
    async loadChurchEvents(overrides = {}) {
      try {
        this.loading = true
        this.$store.dispatch("hideNextLoading")

        // Combina opciones actuales con las sobrescrituras
        const requestOptions = {
          ...this.options,
          ...overrides,
        }

        // Preserva el filtro actual si no se sobrescribe explícitamente
        if (this.filterChurchEvent && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
          requestOptions.filter = this.filterChurchEvent
        }

        this.response = await this.$repository.ChurchEvent.index(requestOptions)

        // Actualiza las opciones después de una carga exitosa
        this.options = requestOptions
      } catch (error) {
        console.error("Error loading church events:", error)
        this.$notify({
          type: "error",
          text: error.response?.data?.message || "Error al cargar eventos de iglesia",
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * Refresca la lista de eventos manteniendo las opciones actuales
     */
    async refreshChurchEvents() {
      await this.loadChurchEvents()
    },

    /**
     * Maneja el cambio de ordenamiento desde la tabla
     */
    async handleSorting(options) {
      this.options = options
      await this.loadChurchEvents()
    },

    /**
     * Abre el diálogo para crear un nuevo evento
     */
    newChurchEvent() {
      this.churchEvent = {}
      this.churchEventDialog = true
    },

    /**
     * Abre el diálogo para editar un evento existente
     */
    editChurchEvent(item) {
      this.churchEvent = { ...item }
      this.churchEventDialog = true
    },

    /**
     * Prepara el diálogo de confirmación para eliminar un evento
     */
    beforeDeleteChurchEvent(item) {
      this.dialogDelete = {
        text: "¿Desea eliminar el Evento ",
        strong: item.name,
        text2: "?",
        payload: item,
      }
      this.churchEventDialogDelete = true
    },

    /**
     * Elimina un evento
     */
    async deleteChurchEvent(item) {
      try {
        this.deleting = true
        await this.$repository.ChurchEvent.delete(item.id, item)

        // Activa el flag para evitar que el watch dispare una llamada adicional
        this.skipFilterWatch = true

        // Limpia el filtro y recarga la primera página (solo 1 llamada GET)
        this.filterChurchEvent = ""
        await this.loadChurchEvents({ page: 1, filter: "" })

        this.churchEventDialogDelete = false
      } catch (error) {
        console.error("Error deleting church event:", error)
        this.$notify({
          type: "error",
          text: error.response?.data?.message || "Error al eliminar el evento",
        })
      } finally {
        this.deleting = false
      }
    },

    /**
     * Guarda un evento (crear o actualizar)
     */
    async saveChurchEvent(item) {
      try {
        this.saving = true

        const isUpdate = Boolean(item.id)

        if (isUpdate) {
          await this.$repository.ChurchEvent.update(item.id, item)
        } else {
          await this.$repository.ChurchEvent.create(item)
        }

        this.$notify({
          type: "success",
          text: `Evento ${isUpdate ? "actualizado" : "creado"} exitosamente`,
        })

        // Aplica el filtro con el nombre del evento guardado y recarga
        this.filterChurchEvent = item.name
        this.churchEventDialog = false
      } catch (error) {
        console.error("Error saving church event:", error)
        this.$notify({
          type: "error",
          text: error.response?.data?.message || `Error al ${item.id ? "actualizar" : "crear"} el evento`,
        })
      } finally {
        this.saving = false
      }
    },

    /**
     * Cierra el diálogo de evento
     */
    closeDialog() {
      this.churchEventDialog = false
      this.churchEvent = {}
    },
  },
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
