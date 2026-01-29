<template>
  <v-container fluid class="pa-0">
    <div v-if="eventAuditorium && eventAuditorium.id">
      <div class="pa-2 grey lighten-4 d-flex align-center">
        <span class="text-subtitle-2">Auditorio: {{ eventAuditorium.auditorium_name }}</span>
        <v-spacer></v-spacer>
        <span class="text-subtitle-2">{{ totalSeatsWithStatus }}/{{ totalSeats }}</span>
        <span class="text-subtitle-2 ml-3 mr-3" :style="{ color: percentageColor }">{{ percentajeTotalSeats }}%</span>
      </div>
      <div>
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

        <AuditoriumSeatsStageOp :sections="sections" :settings="settings" :stage-config="stageConfig" :categories="stageCategories" @setEventSeat="handleSetEventSeat" />
        <!-- <v-alert v-else type="warning" outlined>No hay configuración de asientos disponible para este evento.</v-alert> -->
      </div>
    </div>

    <v-alert v-else type="error" outlined class="ma-2">Evento no encontrado.</v-alert>
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
      notificationRealTimeArray: [],
      eventAuditorium: {},
      sections: [],
      settings: { ...DEFAULT_SETTINGS },
      stageCategories: STAGE_CATEGORIES,
      loading: false,
      echoChannel: null,
    }
  },
  computed: {
    stageConfig() {
      if (!this.sections || this.sections.length === 0) {
        return { width: 900, height: 700 }
      }

      // Calcular el ancho máximo necesario para todas las secciones (sin margen extra)
      const maxSectionWidth = Math.max(...this.sections.map((section) => this.getSectionWidth(section)))

      // Calcular la altura total necesaria
      const totalHeight =
        this.sections.reduce((acc, section, idx) => {
          return acc + this.getSectionHeight(section) + (idx > 0 ? this.settings.SECTIONS_MARGIN : 0)
        }, this.settings.SECTION_TOP_PADDING) + 100 // padding extra

      // Usar exactamente el ancho del contenido más un pequeño margen de seguridad
      const width = maxSectionWidth + 10 // Solo 20px de padding total
      const height = Math.max(700, totalHeight)

      return { width, height }
    },

    totalSeats() {
      let count = 0
      this.sections.forEach((section) => {
        if (section.subsections) {
          section.subsections.forEach((subsection) => {
            if (subsection.seats) {
              subsection.seats.forEach((row) => {
                count += row.length
              })
            }
          })
        }
      })
      return count
    },

    totalSeatsWithStatus() {
      let count = 0
      this.sections.forEach((section) => {
        if (section.subsections) {
          section.subsections.forEach((subsection) => {
            if (subsection.seats) {
              subsection.seats.forEach((row) => {
                row.forEach((seat) => {
                  if (seat.status) {
                    count++
                  }
                })
              })
            }
          })
        }
      })
      return count
    },

    percentajeTotalSeats() {
      if (this.totalSeats === 0) return 0
      return ((this.totalSeatsWithStatus / this.totalSeats) * 100).toFixed(1)
    },

    percentageColor() {
      const percentage = parseFloat(this.percentajeTotalSeats)
      if (percentage >= 0 && percentage <= 60) {
        return "#4CAF50" // Verde
      } else if (percentage >= 61 && percentage <= 90) {
        return "#FF9800" // Naranja
      } else if (percentage >= 91) {
        return "#F44336" // Rojo
      }
      return "#000000" // Negro por defecto
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: `Evento Auditorio`,
      icon: "mdi-theater",
    })

    // Load the auditorium configuration
    this.loadConfiguration()

    // Set up real-time notifications listener
    this.setupRealtimeListeners()
  },

  beforeDestroy() {
    // Clean up Echo channel when component is destroyed
    if (this.echoChannel) {
      this.$echo.leave(`auditorium-event.${this.eventAuditorium.id}`)
      this.echoChannel = null
    }
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
        // Usar configuración original sin reasignar IDs
        // const cleanSections = JSON.parse(JSON.stringify(config.sections))
        // cleanSections.forEach((section) => {
        //   section.subsections?.forEach((sub) => {
        //     sub.seats?.forEach((row) => {
        //       row.forEach((seat) => {
        //         if ("state" in seat) delete seat.state
        //       })
        //     })
        //   })
        // })
        this.sections = config.sections

        // Update seat statuses from eventAuditorium.seats
        if (this.eventAuditorium.seats && Array.isArray(this.eventAuditorium.seats)) {
          this.eventAuditorium.seats.forEach((seatData) => {
            const seat = this.findSeatById(seatData.seat_id)
            if (seat) {
              this.$set(seat, "status", seatData.status)
            }
          })
        }
      }
    },

    getSectionWidth(section) {
      if (section.isLabel) return 0
      if (!section.subsections || section.subsections.length === 0) return 0
      return (
        section.subsections.reduce((acc, s) => acc + (s.isLabel ? s.width || 100 : this.getSubsectionWidth(s)), 0) +
        (section.subsections.length - 1) * this.settings.SUBSECTION_PADDING +
        this.settings.SECTION_SIDE_PADDING * 2
      )
    },

    getSectionHeight(section) {
      if (section.isLabel) return 30
      if (!section.subsections || section.subsections.length === 0) return this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING
      const maxRows = Math.max(...section.subsections.map((sub) => (sub.isLabel ? 0 : sub.seats?.length || 0)))
      if (maxRows === 0) return this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING + 40
      const seatSpacing = this.settings.SEAT_SIZE + this.settings.SEATS_DISTANCE
      return maxRows * seatSpacing - this.settings.SEATS_DISTANCE + this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING
    },

    getSubsectionWidth(sub) {
      if (sub.isLabel) return sub.width || 100
      if (!sub.seats || sub.seats.length === 0) return 0
      const maxCols = Math.max(...sub.seats.map((row) => row.length))
      const seatSpacing = this.settings.SEAT_SIZE + this.settings.SEATS_DISTANCE
      return maxCols * seatSpacing - this.settings.SEATS_DISTANCE
    },

    async handleSetEventSeat(payload) {
      const { seatIds, status } = payload

      if (!seatIds || seatIds.length === 0) {
        this.$notify.error("No seats selected")
        return
      }

      this.loading = true

      try {
        // Prepare payload for API
        const updatePayload = {
          auditorium_event_id: this.eventAuditorium.id,
          seat_ids: seatIds,
          status,
        }

        // Call API to update seats using custom endpoint
        const response = await this.$repository.AuditoriumEventSeat.create(updatePayload)

        // Update local state with response data
        if (response && response.seats) {
          response.seats.forEach((seatData) => {
            const seat = this.findSeatById(seatData.seat_id)
            if (seat) {
              // Use Vue.set to ensure reactivity in nested objects
              this.$set(seat, "status", seatData.status)
            }
          })
        }

        this.$notify.success(response.success || `${seatIds.length} seat(s) updated successfully`)
      } catch (error) {
        console.error("Error updating seats:", error)
        this.$handleError(error)
      } finally {
        this.loading = false
      }
    },

    findSeatById(seatId) {
      for (const section of this.sections) {
        if (section.subsections) {
          for (const subsection of section.subsections) {
            if (subsection.seats) {
              for (const row of subsection.seats) {
                for (const seat of row) {
                  if (seat.id === seatId) {
                    return seat
                  }
                }
              }
            }
          }
        }
      }
      return null
    },

    setupRealtimeListeners() {
      if (!this.$echo || !this.eventAuditorium?.id) {
        console.warn("Echo not available or event ID missing")
        return
      }

      // Subscribe to the auditorium event channel
      const channelName = `auditorium-event.${this.eventAuditorium.id}`
      console.log(`📡 Subscribing to channel: ${channelName}`)

      this.echoChannel = this.$echo.channel(channelName)

      // Listen for seat updates
      this.echoChannel.listen(".seat.updated", (data) => {
        console.log("🔔 Seat update received:", data)

        // this.notificationRealTimeArray.push(data)

        // Update local seats with the real-time data
        if (data.seats && Array.isArray(data.seats)) {
          data.seats.forEach((seatData) => {
            const seat = this.findSeatById(seatData.seat_id)
            if (seat) {
              this.$set(seat, "status", seatData.status)
            }
          })
        }
      })
    },
  },
}
</script>
