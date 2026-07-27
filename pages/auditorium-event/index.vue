<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="3">
        <MyDateRange v-model="filterAuditoriumEvent" />
      </v-col>
      <v-col cols="auto" class="d-flex align-center">
        <v-btn color="primary" :loading="loading" class="mr-1" id="btn-auditoriumevent-refresh" @click="getAuditoriumEvents()">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
        <v-btn color="success" class="mr-1" id="btn-auditoriumevent-new" @click="newAuditoriumEvent()">
          <v-icon left>mdi-plus</v-icon>
          Nuevo
        </v-btn>
      </v-col>
      <v-col v-if="!orgFilterHidden" cols="auto">
        <organization-select v-model="filterOrgId" :hidden.sync="orgFilterHidden" permission="auditorium-index" hide-one dense hide-details clearable
          outlined />
      </v-col>
      <v-col cols="12">
        <AuditoriumEventTable :loading="loading" :response="response" :options="options" @sorting="getAuditoriumEvents"
          @download="downloadAuditoriumEvent" @edit="editAuditoriumEvent" @mark="markAuditoriumEvent"
          @delete="beforeDeleteAuditoriumEvent" />
      </v-col>
    </v-row>
    <!-- Diálogos para crear/editar y eliminar eventos de auditorio -->
    <AuditoriumEventDialog v-if="auditoriumEventDialog" v-model="auditoriumEventDialog" :auditorium-event="auditoriumEvent" @close="closeDialog"
      @save="saveAuditoriumEvent" />
    <DialogDelete v-if="auditoriumEventDialogDelete" :dialog="dialogDelete" @ok="deleteAuditoriumEvent"
      @close="auditoriumEventDialogDelete = false"></DialogDelete>
  </v-container>
</template>

<script>
import { debounce } from "lodash-es"
import { STATUS_CONFIG } from "~/constants/auditorium.js"

export default {
  middleware: ["authenticated"],
  async asyncData({ app }) {
    const options = {
      sortBy: ["event_date"],
      sortDesc: [true],
      itemsPerPage: 10,
    }

    try {
      // Asumiendo que hay un repositorio para eventos de auditorio
      const response = await app.$repository.AuditoriumEvent?.index?.(options)

      return { response, options }
    } catch(error) {
      // console.error("Error loading auditorium events:", error)
      return { response: { data: [], total: 0 }, options }
    }
  },

  data() {
    return {
      filterAuditoriumEvent: [],
      filterOrgId: null,
      orgFilterHidden: false,
      auditoriumEvents: [],
      auditoriumEvent: {},
      response: { data: [], total: 0 },
      options: {},
      loading: false,
      auditoriumEventDialog: false,
      auditoriumEventDialogDelete: false,
      dialogDelete: {},
      skipOrgFilterWatch: true, // Evita doble request al montar
    }
  },

  computed: {
    currentUser() {
      return this.$auth.user || {}
    },
  },

  watch: {
    filterAuditoriumEvent: {
      handler: debounce(function(value) {
        if(value && value.length > 0) {
          value = [...value].sort()
        }
        const op = {
          filter: value,
          page: 1,
          itemsPerPage: 10,
        }
        this.getAuditoriumEvents(op)
      }, 500),
    },
    filterOrgId(value) {
      if (this.skipOrgFilterWatch) {
        this.skipOrgFilterWatch = false
        return
      }
      const overrides = { page: 1 }
      if (value) {
        overrides.org_id = value
      } else {
        overrides.org_id = undefined
      }
      this.getAuditoriumEvents(overrides)
    },
  },

  mounted() {
    // Allow org filter watcher to fire after mount
    this.skipOrgFilterWatch = false

    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Eventos de Auditorio",
      icon: "mdi-theater",
    })
  },

  methods: {
    async getAuditoriumEvents(overrides = {}) {
      const requestOptions = {
        ...this.options,
        ...overrides,
      }

      requestOptions.filter = this.filterAuditoriumEvent

      if (this.filterOrgId) {
        requestOptions.org_id = this.filterOrgId
      }

      try {
        this.loading = true
        this.response = await this.$repository.AuditoriumEvent.index(requestOptions)

        // Actualizar opciones solo despuÃ©s de una carga exitosa
        this.options = requestOptions
      } finally {
        this.loading = false
      }
    },

    newAuditoriumEvent() {
      this.auditoriumEvent = {}
      this.auditoriumEventDialog = true
    },

    editAuditoriumEvent(item) {
      this.auditoriumEvent = { ...item }
      this.auditoriumEventDialog = true
    },

    async downloadAuditoriumEvent(item) {
      this.loading = true
      try {
        const response = await this.$repository.AuditoriumEvent.show(item.id)
        if(response && response.seats) {
          const headerRow = item.auditorium_name + " - " + item.event_date
          const rows = [[headerRow], ["Status", "Cantidad"]]

          Object.keys(STATUS_CONFIG).forEach((key) => {
            const count = response.seats[key] ? response.seats[key].length : 0
            if(count > 0) {
              rows.push([STATUS_CONFIG[key].label, count])
            }
          })

          const csvContent = rows.map((e) => e.join(",")).join("\n")
          const bom = "\uFEFF"
          const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url

          let dateStr = ""
          if(item.event_date) {
            dateStr = item.event_date.substring(0, 10).replace(/-/g, "")
            dateStr = `_${dateStr}`
          }

          a.setAttribute("download", `Resumen_Auditorio_${item.id}${dateStr}.csv`)
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } catch(error) {

      } finally {
        this.loading = false
      }
    },

    markAuditoriumEvent(item) {
      this.$router.push({ path: `/auditorium-event/${item.id}/mark` })
    },

    beforeDeleteAuditoriumEvent(item) {
      this.dialogDelete = {
        text: "¿Desea eliminar el Evento de Auditorio ",
        strong: item.auditorium_name,
        payload: item,
      }
      this.auditoriumEventDialogDelete = true
    },

    async deleteAuditoriumEvent(item) {
      try {
        await this.$repository.AuditoriumEvent.delete(item.id)

        await this.getAuditoriumEvents()
      } catch(error) {
        this.$notify({ type: 'error', message: 'Error deleting auditorium event' })

      } finally {
        this.auditoriumEventDialogDelete = false
      }
    },

    async saveAuditoriumEvent(item) {
      try {
        if(this.$repository?.AuditoriumEvent) {
          if(item.id) {
            await this.$repository.AuditoriumEvent.update(item.id, item, { showLoading: true })
          } else {
            await this.$repository.AuditoriumEvent.create(item, { showLoading: true })
          }
        }
        this.auditoriumEventDialog = false
        await this.getAuditoriumEvents()

      } catch(error) {
        this.$notify({ type: 'error', message: 'Error saving auditorium event' })

      }
    },

    closeDialog() {
      this.auditoriumEventDialog = false
    },
  },
}
</script>
