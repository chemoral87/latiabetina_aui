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
        <v-btn outlined color="primary" to="/church-event">
          <v-icon left>mdi-table</v-icon>
          Tabla
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <organization-select v-model="filterOrgId" permission="church-event-index" hide-one dense hide-details clearable
          outlined /></v-col>

      <v-col cols="auto">
        <v-btn-toggle v-model="weekStartsOnMonday" mandatory dense @change="changeWeekStart">
          <v-btn :value="false">Dom</v-btn>
          <v-btn :value="true">Lun</v-btn>
        </v-btn-toggle>
      </v-col>

      <!-- Calendario de eventos -->
      <v-col cols="12">
        <ChurchEventCalendarView :cal-year="calYear" :cal-month="calMonth" :events="churchEvents"
          :week-starts-on-monday="weekStartsOnMonday" @prev-month="prevMonth" @next-month="nextMonth"
          @new="newChurchEventOnDate" @edit="editChurchEvent" @copy="openCopyDialog"
          @delete="beforeDeleteChurchEvent" />
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

const toIso = (year, month, day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

const toWeekColumn = (jsDay, weekStartsOnMonday) => (weekStartsOnMonday ? (jsDay + 6) % 7 : jsDay)

const buildDateRange = (year, month, weekStartsOnMonday = true) => {
  const firstDayOfWeek = toWeekColumn(new Date(year, month, 1).getDay(), weekStartsOnMonday)
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
  const firstVisibleDay = firstDayOfWeek === 0 ? 1 : daysInPrevMonth - (firstDayOfWeek - 1)
  const firstVisibleMonth = firstDayOfWeek === 0 ? month : prevMonth
  const firstVisibleYear = firstDayOfWeek === 0 ? year : prevYear
  const startDate = toIso(firstVisibleYear, firstVisibleMonth, firstVisibleDay)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const lastDayOfWeek = toWeekColumn(new Date(year, month, daysInMonth).getDay(), weekStartsOnMonday)
  const trailingDays = lastDayOfWeek < 6 ? 6 - lastDayOfWeek : 0
  const end = new Date(year, month, daysInMonth + trailingDays)
  const endDate = toIso(end.getFullYear(), end.getMonth(), end.getDate())

  return { start_date: startDate, end_date: endDate }
}

export default {
  mixins: [churchEventActions],
  middleware: ["authenticated", "permission"],
  meta: { permission: "church-event-index" },
  async asyncData({ app, error, store, route }) {
    const today = new Date()
    const calYear = route.query.cal_year ? parseInt(route.query.cal_year) : today.getFullYear()
    const calMonth = route.query.cal_month !== undefined ? parseInt(route.query.cal_month) : today.getMonth()
    const weekStartsOnMonday = route.query.week_start !== "sunday"
    const params = {
      ...buildDateRange(calYear, calMonth, weekStartsOnMonday),
    }

    const response = await app.$repository.ChurchEvent.calendar(params)
    return { response, calYear, calMonth, weekStartsOnMonday }
  },

  data() {
    return {
      filterChurchEvent: "",
      filterOrgId: null,
      weekStartsOnMonday: true,
      calYear: new Date().getFullYear(),
      calMonth: new Date().getMonth(),
      response: { data: [], total: 0 },
      churchEventDialogDelete: false,
      dialogDelete: {},
      churchEventDialogCopy: false,
      copyingChurchEvent: {},
      copying: false,
      loading: false,
      deleting: false,
      skipFilterWatch: false,
    }
  },

  computed: {
    churchEvents() {
      return this.response?.data || []
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
      const overrides = {}
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
        title: "Calendario de Eventos",
        icon: "mdi-calendar-month",
        back: "/church-event",
      })
    },

    async handleFilterChange(value) {
      await this.loadChurchEvents({ filter: value || "" })
    },

    buildDateRange() {
      return buildDateRange(this.calYear, this.calMonth, this.weekStartsOnMonday)
    },

    async changeWeekStart() {
      await this.loadChurchEvents()
      this.$router.replace({
        query: {
          ...this.$route.query,
          week_start: this.weekStartsOnMonday ? "monday" : "sunday",
        },
      })
    },

    async loadChurchEvents(overrides = {}) {
      try {
        this.loading = true

        const params = {
          ...this.buildDateRange(),
          ...overrides,
        }

        if (this.filterChurchEvent && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
          params.filter = this.filterChurchEvent
        }

        if (this.filterOrgId && !Object.prototype.hasOwnProperty.call(overrides, "org_id")) {
          params.org_id = this.filterOrgId
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "org_id") && !overrides.org_id) {
          delete params.org_id
        }

        const response = await this.$repository.ChurchEvent.calendar(params)
        this.response = response
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

    async prevMonth() {
      if (this.calMonth === 0) {
        this.calMonth = 11
        this.calYear -= 1
      } else {
        this.calMonth -= 1
      }
      await this.loadChurchEvents()
    },

    async nextMonth() {
      if (this.calMonth === 11) {
        this.calMonth = 0
        this.calYear += 1
      } else {
        this.calMonth += 1
      }
      await this.loadChurchEvents()
    },

    newChurchEvent() {
      this.$router.push({ path: '/church-event/new', query: { from: 'calendar', cal_year: this.calYear, cal_month: this.calMonth } })
    },

    newChurchEventOnDate(dateIso) {
      this.$router.push({ path: '/church-event/new', query: { from: 'calendar', event_date: dateIso, cal_year: this.calYear, cal_month: this.calMonth } })
    },

    // Required by churchEventActions mixin
    routeQuery() {
      return { from: 'calendar', cal_year: this.calYear, cal_month: this.calMonth }
    },

    deleteReloadOverrides() {
      return {}
    },

  },
}
</script>

<style scoped></style>
