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
        <AuditoriumSeatsStageOp :sections="sections" :settings="settings" :stage-config="stageConfig" :categories="stageCategories" @setEventSeat="handleSetEventSeat" />
      </div>
    </div>

    <v-alert v-else type="error" outlined class="ma-2">Evento no encontrado.</v-alert>
  </v-container>
</template>

<script>
import Vue from "vue"
import VueKonva from "vue-konva"
import { STAGE_CATEGORIES } from "~/constants/auditorium"
import { DEFAULT_SETTINGS } from "~/components/Auditorium/constants"

Vue.use(VueKonva)

export default {
  middleware: ["authenticated"],
  async asyncData({ app, params }) {
    const res = await app.$repository.AuditoriumEvent.show(params.id).catch((e) => {})

    const eventAuditorium = res || {}
    return { eventAuditorium, last_timestamp: res.timestamp || null }
  },
  data() {
    return {
      notificationRealTimeArray: [],
      last_timestamp: null,
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
          return acc + this.getSectionHeight(section) + (idx > 0 ? DEFAULT_SETTINGS.SECTION_TOP_MARGIN : 0)
        }, DEFAULT_SETTINGS.SECTION_TOP_PADDING) + 100 // padding extra

      // Usar exactamente el ancho del contenido más un pequeño margen de seguridad
      const width = maxSectionWidth + 10 // Solo 20px de padding total
      const height = Math.max(700, totalHeight)

      return { width, height }
    },

    totalSeats() {
      let count = 0
      this.sections.forEach((section) => {
        const rawSubs = section.ss || section.subsections
        if (rawSubs) {
          rawSubs.forEach((subsection) => {
            const seatsSource = subsection.s || subsection.seats
            if (seatsSource) {
              seatsSource.forEach((row) => {
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
        const rawSubs = section.ss || section.subsections
        if (rawSubs) {
          rawSubs.forEach((subsection) => {
            const seatsSource = subsection.s || subsection.seats
            if (seatsSource) {
              seatsSource.forEach((row) => {
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

    // Set up visibility change handler for mobile
    document.addEventListener("visibilitychange", this.handleVisibilityChange)
  },

  beforeDestroy() {
    // Clean up Echo channel when component is destroyed
    if (this.echoChannel) {
      this.$echo.leave(`auditorium-event.${this.eventAuditorium.id}`)
      this.echoChannel = null
    }

    // Remove visibility change listener
    document.removeEventListener("visibilitychange", this.handleVisibilityChange)
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

      if (config.s || config.sections) {
        if (config.settings) {
          Object.assign(this.settings, DEFAULT_SETTINGS, config.settings)
        }

        const rawSections = config.s || config.sections
        const cleanSections = rawSections.map((section, sIdx) => {
          const s = {
            id: section.i || section.id || `${sIdx + 1}`,
            name: section.n || section.name,
            isLabel: !!(section.l || section.isLabel),
            subsections: [],
          }

          if (section.ss || section.subsections) {
            const rawSubs = section.ss || section.subsections
            s.subsections = rawSubs.map((sub, subIdx) => {
              const ss = {
                id: sub.i || sub.id || `${s.id}-${subIdx + 1}`,
                name: sub.n || sub.name,
                isLabel: !!(sub.l || sub.isLabel),
              }
              if (ss.isLabel) {
                ss.width = sub.w || sub.width
              } else {
                ss.tempRows = sub.tr || sub.tempRows
                ss.tempCols = sub.tc || sub.tempCols
                const rawSeats = sub.s || sub.seats
                if (rawSeats) {
                  ss.seats = rawSeats.map((row, rowIdx) => {
                    return row.map((seat, colIdx) => {
                      if (!seat) return null
                      return {
                        id: seat.i || seat.id || `${ss.id}-${rowIdx + 1}-${colIdx + 1}`,
                        row: seat.r !== undefined ? seat.r : seat.row,
                        col: seat.c !== undefined ? seat.c : seat.col,
                        category: seat.k || seat.category,
                      }
                    })
                  })
                }
              }
              return ss
            })
          }
          return s
        })

        this.sections = cleanSections

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
      const isLabel = section.l || section.isLabel
      if (isLabel) return 0
      const rawSubs = section.ss || section.subsections
      if (!rawSubs || rawSubs.length === 0) return 0
      return (
        rawSubs.reduce((acc, s) => {
          const isSubLabel = s.l || s.isLabel
          return acc + (isSubLabel ? s.w || s.width || 100 : this.getSubsectionWidth(s))
        }, 0) +
        (rawSubs.length - 1) * DEFAULT_SETTINGS.SUBSECTION_SPACING +
        DEFAULT_SETTINGS.SECTION_SIDE_PADDING * 2
      )
    },

    getSectionHeight(section) {
      const isLabel = section.l || section.isLabel
      if (isLabel) return 30
      const rawSubs = section.ss || section.subsections
      if (!rawSubs || rawSubs.length === 0) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
      const maxRows = Math.max(...rawSubs.map((sub) => {
        const isSubLabel = sub.l || sub.isLabel
        const seatsSource = sub.s || sub.seats
        return (isSubLabel ? 0 : seatsSource?.length || 0)
      }))
      if (maxRows === 0) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING + 40
      const seatSpacing = DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
      return maxRows * seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE + DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
    },

    getSubsectionWidth(sub) {
      const isLabel = sub.l || sub.isLabel
      if (isLabel) return sub.w || sub.width || 100
      const seatsSource = sub.s || sub.seats
      if (!seatsSource || seatsSource.length === 0) return 0
      const maxCols = Math.max(...seatsSource.map((row) => row.length))
      const seatSpacing = DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
      return maxCols * seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
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

        if (!this.last_timestamp || response.timestamp > this.last_timestamp) {
          this.last_timestamp = response.timestamp
        }

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
      } catch (error) {
        console.error("Error updating seats:", error)
        this.$handleError(error)
      } finally {
        this.loading = false
      }
    },

    findSeatById(seatId) {
      for (const section of this.sections) {
        const rawSubs = section.ss || section.subsections
        if (rawSubs) {
          for (const subsection of rawSubs) {
            const seatsSource = subsection.s || subsection.seats
            if (seatsSource) {
              for (const row of seatsSource) {
                for (const seat of row) {
                  const id = seat.i || seat.id
                  if (id === seatId) {
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

    async handleVisibilityChange() {
      if (!document.hidden && this.eventAuditorium?.id) {
        console.log("📱 Page visible again, syncing updates...")
        try {
          // hide next loadinng
          this.$store.dispatch("hideNextLoading")
          const response = await this.$repository.AuditoriumEventSeat.index({ auditorium_event_id: this.eventAuditorium.id, last_timestamp: this.last_timestamp })

          if (response?.timestamp) {
            if (!this.last_timestamp || response.timestamp > this.last_timestamp) {
              this.last_timestamp = response.timestamp
            }
          }

          // Update seats from response
          if (response?.seats_log && Array.isArray(response.seats_log)) {
            response.seats_log.forEach((logEntry) => {
              if (logEntry.seat_ids && Array.isArray(logEntry.seat_ids)) {
                logEntry.seat_ids.forEach((seatId) => {
                  const seat = this.findSeatById(seatId)
                  if (seat) {
                    this.$set(seat, "status", logEntry.status)
                  }
                })
              }
            })
          }
        } catch (error) {
          console.error("Error syncing seat updates:", error)
        }
      }
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

        if (!this.last_timestamp || data.timestamp > this.last_timestamp) {
          this.last_timestamp = data.timestamp
        }

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
