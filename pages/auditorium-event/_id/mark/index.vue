<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12">
        <v-card v-if="eventAuditorium && eventAuditorium.id">
          <v-card-title>
            <!-- <span class="text-h6">Evento: {{ eventAuditorium.event_date }}</span>
            <v-spacer /> -->
            <span class="text-subtitle-2">Auditorio: {{ eventAuditorium.auditorium_name }}</span>
          </v-card-title>
          <v-card-text>
            <!-- Debug info -->
            <!-- <div class="mb-4 pa-2" style="background: #f5f5f5; border-radius: 4px">
              <h4>Debug Info:</h4>
              <p>
                <strong>Event ID:</strong>
                {{ eventAuditorium.id || "No ID" }}
              </p>
              <p>
                <strong>Config exists:</strong>
                {{ !!eventAuditorium.config }}
              </p>
              <p>
                <strong>Config type:</strong>
                {{ typeof eventAuditorium.config }}
              </p>
              <p>
                <strong>StageConfig exists:</strong>
                {{ !!stageConfig }}
              </p>
              <p>
                <strong>Sections count:</strong>
                {{ sections.length }}
              </p>
              <p>
                <strong>Settings:</strong>
                {{ JSON.stringify(settings) }}
              </p>
              <div v-if="stageConfig">
                <p>
                  <strong>Stage dimensions:</strong>
                  {{ stageConfig.width }}x{{ stageConfig.height }}
                </p>
                <details>
                  <summary><strong>Full Config:</strong></summary>
                  <pre style="font-size: 10px">{{ JSON.stringify(stageConfig, null, 2) }}</pre>
                </details>
              </div>
            </div> -->

            <AuditoriumSeatsStageOp :sections="sections" :settings="settings" :stage-config="stageConfig" :categories="stageCategories" />
            <!-- <v-alert v-else type="warning" outlined>No hay configuración de asientos disponible para este evento.</v-alert> -->
          </v-card-text>
        </v-card>

        <v-alert v-else type="error" outlined>Evento no encontrado.</v-alert>
      </v-col>
      {{ sections }}
    </v-row>
  </v-container>
</template>

<script>
import Vue from "vue"
import VueKonva from "vue-konva"
import { STAGE_CATEGORIES } from "~/constants/auditorium"

Vue.use(VueKonva)

const DEFAULT_SETTINGS = {
  SEAT_SIZE: 12,
  SEATS_DISTANCE: 8,
  SUBSECTION_PADDING: 30,
  SECTIONS_MARGIN: 10,
  SECTION_TOP_PADDING: 80,
  SECTION_SIDE_PADDING: 20,
  SECTION_BOTTOM_PADDING: 20,
}

export default {
  middleware: ["authenticated"],
  async asyncData({ app, params }) {
    const res = await app.$repository.AuditoriumEvent.show(params.id).catch((e) => {})
    const eventAuditorium = res || {}
    return { eventAuditorium }
  },
  data() {
    return {
      eventAuditorium: {},
      stageConfig: { width: 900, height: 700 },
      sections: [],
      settings: { ...DEFAULT_SETTINGS },
      stageCategories: STAGE_CATEGORIES,
    }
  },
  computed: {},

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: `Evento Auditorio - ${this.eventAuditorium?.event_date || "Cargando..."}`,
      icon: "mdi-theater",
    })

    // Load the auditorium configuration
    this.loadConfiguration()
  },

  methods: {
    loadConfiguration() {
      if (!this.eventAuditorium?.config) {
        console.warn("No se encontró configuración para cargar")
        return
      }

      let config = this.eventAuditorium.config
      if (typeof config === "string") {
        try {
          config = JSON.parse(config)
        } catch (e) {
          console.error("Error parsing config:", e)
          return
        }
      }

      if (config.settings && config.sections) {
        Object.assign(this.settings, DEFAULT_SETTINGS, config.settings)
        // Reasignar IDs consecutivos
        const cleanSections = JSON.parse(JSON.stringify(config.sections))
        cleanSections.forEach((section, sIdx) => {
          section.id = `${sIdx + 1}`
          section.subsections?.forEach((sub, subIdx) => {
            sub.id = `${subIdx + 1}`
            sub.seats?.forEach((row, rowIdx) => {
              row.forEach((seat, colIdx) => {
                if ("state" in seat) delete seat.state
                // Actualizar ID del asiento con nuevos IDs consecutivos
                seat.id = `${section.id}-${subIdx + 1}-${rowIdx + 1}-${colIdx + 1}`
              })
            })
          })
        })
        this.sections = cleanSections
      }
    },
  },
}
</script>
