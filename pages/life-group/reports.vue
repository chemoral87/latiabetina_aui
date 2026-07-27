<template>
  <v-container fluid>
    <v-row dense>
      <!-- Filters -->
      <v-col cols="12">
        <v-card id="card-life--repor-1" outlined>
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-file-chart</v-icon>
            Reportes - Redes de Vida
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="4">
                <v-select v-model="selectedReport" label="Tipo de Reporte" outlined dense
                  :items="reportTypes" item-text="label" item-value="value" hide-details="auto"
                  @change="loadReport" />
              </v-col>
              <v-col cols="12" sm="3">
                <v-autocomplete v-model="filterLifeGroup" label="Red de Vida (filtro)" outlined dense
                  :items="lifeGroups" item-text="name" item-value="id" clearable hide-details="auto" />
              </v-col>
              <v-col cols="12" sm="2">
                <v-text-field id="tf-life--repor-filterfrom-1" v-model="filterFrom" label="Desde" type="date" outlined dense
                  hide-details="auto" />
              </v-col>
              <v-col cols="12" sm="2">
                <v-text-field id="tf-life--repor-filterto-2" v-model="filterTo" label="Hasta" type="date" outlined dense
                  hide-details="auto" />
              </v-col>
              <v-col cols="12" sm="1" class="d-flex align-center">
                <v-btn color="primary" small id="btn-lifegroup-report-load" @click="loadReport">
                  <v-icon left small>mdi-magnify</v-icon>
                  Cargar
                </v-btn>
              </v-col>
            </v-row>

            <v-row dense class="mt-4">
              <v-col cols="12" class="d-flex">
                <v-btn color="success" class="mr-2" :disabled="!reportData" id="btn-lifegroup-report-csv" @click="downloadReport('csv')">
                  <v-icon left>mdi-file-delimited</v-icon>
                  CSV
                </v-btn>
                <v-btn color="primary" class="mr-2" :disabled="!reportData" id="btn-lifegroup-report-xls" @click="downloadReport('xls')">
                  <v-icon left>mdi-file-excel</v-icon>
                  Excel
                </v-btn>
                <v-btn color="error" :disabled="!reportData" id="btn-lifegroup-report-pdf" @click="downloadReport('pdf')">
                  <v-icon left>mdi-file-pdf</v-icon>
                  PDF
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Preview Table -->
      <v-col cols="12" v-if="reportData">
        <v-card id="card-life--repor-2" outlined>
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-table</v-icon>
            Vista Previa
            <v-spacer />
            <v-chip small>{{ reportData.rows?.length || 0 }} registros</v-chip>
          </v-card-title>
          <v-card-text>
            <v-data-table id="dt-life--repor-tableitems-1"
              dense
              mobile-breakpoint="0"
              :headers="tableHeaders"
              :items="tableItems"
              :items-per-page="-1"
              class="elevation-1"
              hide-default-footer
            >
              <template #[`item.index`]="{ index }">
                {{ index + 1 }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Empty state -->
      <v-col cols="12" v-else>
        <v-card id="card-life--repor-3" outlined>
          <v-card-text class="text-center py-8">
            <v-icon size="64" color="grey lighten-1">mdi-file-chart</v-icon>
            <div class="text-h6 grey--text mt-2">Seleccione un tipo de reporte</div>
            <div class="text-caption grey--text">Elija un reporte y presione "Cargar" para ver los datos</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],

  async asyncData({ app }) {
    try {
      const res = await app.$repository.LifeGroup.index({ itemsPerPage: 100 })
      return { lifeGroups: res?.data || [] }
    } catch {
      return { lifeGroups: [] }
    }
  },

  data() {
    return {
      selectedReport: null,
      filterLifeGroup: null,
      filterFrom: "",
      filterTo: "",
      lifeGroups: [],
      reportData: null,
      reportTypes: [
        { label: "Asistencia por Sesión", value: "attendance-by-session" },
        { label: "Asistencia por Líder", value: "attendance-by-leader" },
        { label: "Asistencia por Red", value: "attendance-by-group" },
        { label: "Nuevos Invitados", value: "new-guests" },
        { label: "Personas Recurrentes", value: "recurrent-people" },
      ],
    }
  },

  computed: {
    tableHeaders() {
      if (!this.reportData?.headers) return []
      return [
        { text: "#", value: "index", width: "3rem" },
        ...this.reportData.headers.map((h) => ({
          text: h,
          value: h,
          sortable: true,
        })),
      ]
    },

    tableItems() {
      if (!this.reportData?.rows || !this.reportData?.headers) return []
      return this.reportData.rows.map((row) => {
        const obj = {}
        this.reportData.headers.forEach((h, i) => {
          obj[h] = row[i] ?? "-"
        })
        return obj
      })
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Reportes",
      icon: "mdi-file-chart",
      back: "/life-group",
    })
  },

  methods: {
    async loadReport() {
      if (!this.selectedReport) return

      const params = {}
      if (this.filterLifeGroup) params.life_group_id = this.filterLifeGroup
      if (this.filterFrom) params.from = this.filterFrom
      if (this.filterTo) params.to = this.filterTo

      try {
        const data = await this.$repository.LifeGroup.getReport(this.selectedReport, params)
        this.reportData = data
      } catch (error) {
        this.$handleError(error)
      }
    },

    async downloadReport(format) {
      if (!this.selectedReport) return

      const params = {}
      if (this.filterLifeGroup) params.life_group_id = this.filterLifeGroup
      if (this.filterFrom) params.from = this.filterFrom
      if (this.filterTo) params.to = this.filterTo

      try {
        await this.$repository.LifeGroup.downloadReport(this.selectedReport, format, params)
      } catch (error) {
        this.$handleError(error)
      }
    },
  },
}
</script>
