<template>
  <v-container fluid>
    <v-row dense>
      <!-- Filtro de busqueda -->
      <v-col cols="12" md="2">
        <v-text-field v-model="filterChurchEvent" append-icon="mdi-magnify" clearable hide-details
          placeholder="Buscar evento..." dense />
      </v-col>

      <!-- Botones de accion -->
      <v-col cols="auto">
        <v-btn color="primary" class="mr-2" @click="newChurchEvent">
          <v-icon left>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" :loading="loading" class="mr-2" @click="refreshChurchEvents">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
        <v-btn outlined color="primary" to="/church-event/calendar">
          <v-icon left>mdi-calendar-month</v-icon>
          Calendario
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <organization-select v-model="filterOrgId" permission="church-event-index" hide-one dense hide-details clearable
          outlined /></v-col>

      <!-- Tabla de eventos -->
      <v-col cols="12">
        <ChurchEventTable :options="options" :response="response" :loading="loading" permission="church-event-index"
          @sorting="handleSorting" @edit="editChurchEvent" @delete="beforeDeleteChurchEvent" @copy="openCopyDialog" />
      </v-col>
    </v-row>

    <!-- Dialogo de copiar evento en varias fechas -->
    <ChurchEventCopyDialog v-if="churchEventDialogCopy" :church-event="copyingChurchEvent" :loading="copying"
      @copy="copyChurchEvent" @close="churchEventDialogCopy = false" />

    <!-- Dialogo de confirmacion de eliminacion -->
    <DialogDelete v-if="churchEventDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteChurchEvent"
      @close="churchEventDialogDelete = false" />
  </v-container>
</template>

<script>
import { debounce } from "lodash-es"
import churchEventActions from "@/mixins/churchEventActions"

export default {
  mixins: [churchEventActions],
  middleware: ["authenticated", "permission"],
  meta: { permission: "church-event-index" },
  async asyncData({ app, error, store }) {
    const options = {
      page: 1,
      sortBy: ["event_date"],
      sortDesc: [true],
      itemsPerPage: 10,
    }

    const response = await app.$repository.ChurchEvent.index(options)
    return { response, options }
  },

  data() {
    return {
      filterChurchEvent: "",
      filterOrgId: null,
      response: { data: [], total: 0 },
      options: {

      },
      churchEventDialogDelete: false,
      dialogDelete: {},
      churchEventDialogCopy: false,
      copyingChurchEvent: {},
      copying: false,
      loading: false,
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
        if (this.skipFilterWatch) {
          this.skipFilterWatch = false
          return
        }
        this.handleFilterChange(value)
      }, 500),
    },
    filterOrgId(value) {
      const overrides = { page: 1 }
      if (value) {
        overrides.org_id = value
      } else {
        overrides.org_id = undefined
      }
      this.loadChurchEvents(overrides)
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

    async handleFilterChange(value) {
      await this.loadChurchEvents({ filter: value || "", page: 1 })
    },

    async loadChurchEvents(overrides = {}) {
      try {
        this.loading = true

        const requestOptions = {
          ...this.options,
          ...overrides,
        }

        if (this.filterChurchEvent && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
          requestOptions.filter = this.filterChurchEvent
        }

        if (this.filterOrgId && !Object.prototype.hasOwnProperty.call(overrides, "org_id")) {
          requestOptions.org_id = this.filterOrgId
        }

        // remove org_id from params if explicitly cleared
        if (Object.prototype.hasOwnProperty.call(overrides, "org_id") && !overrides.org_id) {
          delete requestOptions.org_id
        }

        let response = await this.$repository.ChurchEvent.index(requestOptions)

        if (Array.isArray(response)) {
          response = { data: response, total: response.length }
        }

        this.response = response
        this.options = requestOptions
      } catch (error) {
        if (this.$handleError) {
          this.$handleError(error)
        } else {
          console.error(error)
        }
      } finally {
        this.loading = false
      }
    },

    async refreshChurchEvents() {
      await this.loadChurchEvents()
    },

    async handleSorting(options) {
      this.options = options
      await this.loadChurchEvents()
    },

    newChurchEvent() {
      this.$router.push({ path: '/church-event/new', query: { from: 'table' } })
    },

    // Required by churchEventActions mixin
    routeQuery() {
      return { from: 'table' }
    },

    deleteReloadOverrides() {
      return { page: 1 }
    },

  },
}
</script>

<style scoped></style>
