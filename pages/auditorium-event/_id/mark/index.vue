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
  beforeUnmount() {
   // Clean up Echo channel when component is destroyed
    if (this.echoChannel) {
      this.$echo.leave(`auditorium-event.${this.eventAuditorium.id}`)
      this.echoChannel = null
      this.isListening = false
    }
},

  beforeDestroy() {
    // Clean up Echo channel when component is destroyed
    if (this.echoChannel) {
      this.$echo.leave(`auditorium-event.${this.eventAuditorium.id}`)
      this.echoChannel = null
      this.isListening = false
    }
    
    // Remove visibility change listener
    document.removeEventListener("visibilitychange", this.handleVisibilityChange)
  },

  methods: {
    // ── CSV helpers (mirrors editor.vue logic) ─────────────────────────────

    /**
     * Returns true when the raw config value is our flat CSV format.
     * Detection is done by checking for the expected header line.
     */
    _isCsvConfig(raw) {
      return typeof raw === "string" && raw.trimStart().startsWith("type,id,name,")
    },

    /**
     * Parse a flat CSV config string back into the internal `sections` array.
     * Header: type,id,name,level,parent,tr,tc,r,c,k
     *
     * type values:
     *   s    = section
     *   ss   = subsection
     *   seat = individual seat
     */
    _parseCsvConfig(csvString) {
      const lines = csvString
        .split("|")
        .map((l) => l.trim())
        .filter(Boolean)
      if (lines.length < 2) return []

      const parseCsvLine = (line) => {
        const fields = []
        let current = ""
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
          const ch = line[i]
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"'
              i++
            } else {
              inQuotes = !inQuotes
            }
          } else if (ch === "," && !inQuotes) {
            fields.push(current)
            current = ""
          } else {
            current += ch
          }
        }
        fields.push(current)
        return fields
      }

      const header = lines[0].split(",")
      const idx = {}
      header.forEach((h, i) => {
        idx[h.trim()] = i
      })

      const sections = []
      let currentSection = null
      let currentSub = null

      for (let li = 1; li < lines.length; li++) {
        const f = parseCsvLine(lines[li])
        const type = f[idx.type] || ""
        const id = f[idx.id] || ""
        const name = f[idx.name] || ""
        const level = parseInt(f[idx.level] || "0", 10)
        const tr = f[idx.tr] !== "" && f[idx.tr] !== undefined ? parseInt(f[idx.tr], 10) : undefined
        const tc = f[idx.tc] !== "" && f[idx.tc] !== undefined ? parseInt(f[idx.tc], 10) : undefined
        const r = f[idx.r] !== "" && f[idx.r] !== undefined ? parseInt(f[idx.r], 10) : undefined
        const c = f[idx.c] !== "" && f[idx.c] !== undefined ? parseInt(f[idx.c], 10) : undefined
        const k = (f[idx.k] || "").trim()

        if (type === "s") {
          currentSection = { id, name, isLabel: level === 1, subsections: [] }
          currentSub = null
          sections.push(currentSection)
        } else if (type === "ss" && currentSection) {
          currentSub = { id, name, isLabel: level === 1 }
          if (currentSub.isLabel) {
            currentSub.width = 100
          } else {
            currentSub.tempRows = tr
            currentSub.tempCols = tc
            currentSub.seats = []
          }
          currentSection.subsections.push(currentSub)
        } else if (type === "seat" && currentSub && !currentSub.isLabel) {
          const rowIdx = r
          while (currentSub.seats.length <= rowIdx) {
            currentSub.seats.push([])
          }
          const seat = { id, row: r, col: c }
          if (k) seat.category = k
          currentSub.seats[rowIdx].push(seat)
        }
      }

      return sections
    },

    // ── Configuration loader ───────────────────────────────────────────────

    loadConfiguration() {
      if (!this.eventAuditorium?.config) {
        console.warn("No se encontró configuración para cargar")
        return
      }

      const raw = this.eventAuditorium.config

      // ── CSV path ────────────────────────────────────────────────────────
      if (this._isCsvConfig(raw)) {
        this.sections = this._parseCsvConfig(raw)
        this._applyInitialSeatStatuses()
        return
      }

      // ── JSON path ───────────────────────────────────────────────────────
      let config = raw
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
        this._applyInitialSeatStatuses()
      }
    },

    /**
     * After sections are loaded (from either CSV or JSON), apply the
     * pre-existing seat statuses stored in eventAuditorium.seats.
     */
    _applyInitialSeatStatuses() {
      if (this.eventAuditorium.seats && !Array.isArray(this.eventAuditorium.seats)) {
        // Format: { "status_key": ["id1", "id2", ...] }
        Object.entries(this.eventAuditorium.seats).forEach(([status, seatIds]) => {
          if (Array.isArray(seatIds)) {
            seatIds.forEach((seatId) => {
              const seat = this.findSeatById(seatId)
              if (seat) {
                this.$set(seat, "status", status)
              }
            })
          }
        })
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
          i: this.eventAuditorium.id,
          z: seatIds,
          s:status,
        }

        // Call API to update seats using custom endpoint
        const { z: seatIdsResponse, t: timestamp, s: statusResponse } = await this.$repository.AuditoriumEventSeat.create(updatePayload)

        if (!this.last_timestamp || timestamp > this.last_timestamp) {
          this.last_timestamp = timestamp
        }

        // Update local state with response data
        if (Array.isArray(seatIdsResponse)) {
          seatIdsResponse.forEach((seatId) => {
            const seat = this.findSeatById(seatId)
            if (seat) {
              // Use Vue.set to ensure reactivity
              this.$set(seat, "status", statusResponse)
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
      // Solo ejecutar en dispositivos móviles usando uaParser
      if (!this.$uaParser || !this.$uaParser.isMobile()) return

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

        // s: status, z: seatsIds in array, t: timestamp
        const timestamp = data.t || data.timestamp
        const seatIds = data.z || data.seats || data.seat_ids
        const status = data.s || data.status

        if (!this.last_timestamp || timestamp > this.last_timestamp) {
          this.last_timestamp = timestamp
        }

        // Update local seats with the real-time data
        if (seatIds && Array.isArray(seatIds)) {
          seatIds.forEach((item) => {
            // Support both array of strings (new compressed format) 
            // and array of objects (legacy format)
            const id = typeof item === "string" ? item : item.z || item.seat_id
            const seatStatus = typeof item === "object" && item !== null ? item.s || item.status || status : status

            const seat = this.findSeatById(id)
            if (seat) {
              this.$set(seat, "status", seatStatus)
            }
          })
        }
      })
    },
  },
}
</script>
