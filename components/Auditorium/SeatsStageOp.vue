<template>
  <div>
    <!-- Navigation and Zoom Controls -->
    <v-row ref="controlRow" dense>
      <!-- {{ eventArrays }} -->
      <v-col>
        <!-- Subsection navigation - only show when subsection is selected -->
        <template v-if="selectedSubsection">
          <!-- <span class="text-body">{{ selectedSubsection.name }}</span> -->
          <v-btn color="primary" small prepend-icon="mdi-arrow-left" @click="goBackToFullView">Main</v-btn>
          <v-btn color="primary" x-small fab class="ml-1" @click="previousSubsection">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-btn color="primary" x-small fab class="ml-1" @click="nextSubsection">
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
        </template>


        <v-btn title="Fit Width" color="secondary" small class="ml-0" @click="fitToWidth">
          <v-icon>mdi-arrow-expand-horizontal</v-icon>
          Fit
        </v-btn>
        <v-btn title="Fit Height" color="secondary" small class="ml-0" @click="fitToHeight">
          <v-icon>mdi-arrow-expand-vertical</v-icon>
          Fit
        </v-btn>
        <v-btn v-if="selectedSubsection" title="Historial de asientos" color="success" small class="ml-1"
          @click="openHistory">
          <v-icon left>mdi-history</v-icon>
          Hist
        </v-btn>
      </v-col>
    </v-row>

    <div style="display: flex; gap: 2px">
      <div id="subsectionPanel"
        :style="{ backgroundColor: 'blueviolet', flex: 1, height: containerOuterHeight, overflow: 'hidden' }">
        <v-stage ref="konvaStage" :config="adjustedStageConfig"
          :style="{ backgroundColor: selectedSubsection ? 'lightgray' : 'pink' }" @wheel="handleWheel"
          @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd"
          @dragstart="handleDragStart" @dragend="handleDragEnd">
          <v-layer :config="{ x: contentOffsetX, scaleX: zoomLevel, scaleY: zoomLevel }">
            <!-- Show only selected subsection if one is selected -->
            <template v-if="selectedSubsection">
              <AuditoriumSeatsStageSubsection :subsection="selectedSubsection" :categories="categories"
                :selected-seats-array="selectedSeatsArray" :blink-state="blinkState" :loading-seats="loadingSeats"
                @seat-click="handleSeatClick" />
            </template>

            <!-- Show all sections when no subsection is selected -->
            <template v-else>
              <v-group v-for="(section, sIdx) in sections" :key="`section-${sIdx}`" :config="getSectionConfig(sIdx)">
                <v-rect :config="getSectionBgConfig(section)" />
                <v-rect v-if="!(section.l || section.isLabel)" :config="getSectionBgConfig(section)" />
                <v-text :config="getSectionTitleConfig(section)" />

                <template v-if="!(section.l || section.isLabel)">
                  <v-group v-for="(sub, subIdx) in (section.ss || section.subsections)" :key="`sub-${sIdx}-${subIdx}`"
                    :config="getSubsectionPosition(section, subIdx)" @click="handleSubsectionClick(sub)"
                    @tap="handleSubsectionClick(sub)" @mouseenter="handleSeatHover" @mouseleave="handleSeatLeave">
                    <template v-if="sub.l || sub.isLabel">
                      <AuditoriumSeatsStageSubsectionLabel :subsection="sub"
                        :section-height="getSectionHeight(section)" />
                    </template>

                    <template v-else>
                      <!-- general  -->
                      <AuditoriumSeatsStageSubsection :subsection="sub" :categories="categories"
                        :selected-seats-array="selectedSeatsArray" :blink-state="blinkState"
                        :loading-seats="loadingSeats" />
                    </template>
                  </v-group>
                </template>
              </v-group>
            </template>
          </v-layer>
        </v-stage>
      </div>
    </div>

    <!-- Floating mark panel - only shown when seats are selected -->
    <MyDragPanel v-model="showMarkPanel" :title="'Asientos: ' + selectedSeatsArray.length" mode="fixed" top="75px"
      left="calc(50% - 95px)">
      <div class="stats-panel-body"
        style="padding: 10px 8px 8px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
        <!-- Loop through active status configs -->
        <div v-for="(config, key) in activeStatusConfig" :key="key"
          style="display: flex; flex-direction: column; align-items: center">
          <v-btn class="mb-1" icon :title="config.label"
            :style="`background-color: ${config.color} !important; color: white`"
            @click="setEventSeat(key == 'e' ? null : key)">
            <v-icon>{{ getIconName(key) }}</v-icon>
          </v-btn>
          <span style="font-size: 9px; text-align: center">{{ config.label }}</span>
        </div>
      </div>
    </MyDragPanel>

    <!-- History Dialog -->
    <v-dialog v-model="historyDialog" max-width="700" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon left color="info">mdi-history</v-icon>
          Historial de asientos
          <v-spacer />
          <v-btn icon @click="historyDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text style="max-height: 60vh; padding: 0">
          <div v-if="historyLoading" class="d-flex justify-center align-center pa-8">
            <v-progress-circular indeterminate color="info" />
          </div>

          <v-simple-table v-else-if="seatTransitions.length" dense>
            <template #default>
              <thead>
                <tr>
                  <th colspan="2" style="padding: 6px 16px 4px">
                    <div class="d-flex align-center flex-wrap" style="gap: 6px">
                      <span style="font-size: 11px; color: #888; margin-right: 4px">Filtrar:</span>
                      <v-btn v-for="(cfg, key) in activeStatusConfig" :key="key" x-small icon :title="cfg.label" :style="{
                        backgroundColor: historyIconFilter === key ? cfg.color : 'transparent',
                        border: '2px solid ' + cfg.color,
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                      }" @click="historyIconFilter = historyIconFilter === key ? null : key">
                        <v-icon x-small :color="historyIconFilter === key ? 'white' : cfg.color">{{ cfg.mdi }}</v-icon>
                      </v-btn>
                      <v-btn v-if="historyIconFilter" x-small text class="ml-1"
                        style="font-size: 10px; text-transform: none" @click="historyIconFilter = null">
                        <v-icon x-small left>mdi-close-circle</v-icon>
                        Limpiar
                      </v-btn>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th>Asiento</th>
                  <th>Transiciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="seat in filteredSeatTransitions" :key="seat.id">
                  <td class="text-caption" style="white-space: nowrap; font-family: monospace">
                    {{ seat.label }}
                  </td>
                  <td>
                    <div class="d-flex align-center flex-wrap" style="gap: 4px; row-gap: 6px">
                      <template v-for="(step, si) in seat.transitions">
                        <div :key="'step-' + si" class="d-flex align-center" style="gap: 4px">
                          <v-icon small :color="step.color" :title="step.label">{{ step.mdi }}</v-icon>
                          <span style="font-size: 11px; white-space: nowrap; line-height: 1">
                            <span style="font-weight: 600">{{ getHistoryUser(step.createdBy) }}</span>
                            <span class="grey--text">{{ step.time }}</span>
                          </span>
                        </div>
                        <span v-if="si < seat.transitions.length - 1" :key="'a-' + si" class="grey--text"
                          style="font-size: 12px; padding: 0 0px">›</span>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>

          <div v-else class="pa-6 text-center grey--text">
            <v-icon large>mdi-clipboard-text-off-outline</v-icon>
            <div class="mt-2">Sin historial disponible</div>
          </div>
        </v-card-text>

        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="historyDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from "vue"
import VueKonva from "vue-konva"
import { getPercentageColor, DEFAULT_SETTINGS, STATUS_CONFIG } from "~/constants/auditorium"
import MyDragPanel from "~/components/My/DragPanel.vue"
Vue.use(VueKonva)

export default {
  name: "SeatsStageOpCopy",
  components: { MyDragPanel },
  props: {
    sections: { type: Array, required: true },
    stageConfig: { type: Object, required: true },
    auditoriumEventId: { type: [Number, String], default: null },
    sectionPrefix: { type: String, default: null },
    categories: {
      type: Array,
      default: () => [],
    },
    loadingSeats: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      eventArrays: [],
      selectedSubsection: null,
      zoomLevel: 1,
      minZoom: 0.3,
      maxZoom: 8.0,
      zoomStep: 0.1,
      dragMode: null, // 'x', 'y', or null for both axes
      cachedControlHeight: 50, // altura inicial del control row
      selectedSeatsArray: [], // Array of selected seat IDs
      blinkState: false, // Toggle for blinking animation
      blinkInterval: null, // Interval reference
      fitstate: null, // 'width' or 'height' - tracks current fit mode
      lastDist: 0, // Last distance between two touch points for pinch zoom
      lastCenter: null, // Last center point between two touches
      isTwoFingerGesture: false, // Track if two fingers are active
      isDraggingStage: false, // Track if user is dragging the stage
      dragStartPos: null, // Starting position of potential drag
      // History
      historyDialog: false,
      historyLog: [],
      historyUsers: [],
      historyLoading: false,
      historyIconFilter: null,
    }
  },
  computed: {
    filteredSeatTransitions() {
      if(!this.historyIconFilter) return this.seatTransitions
      return this.seatTransitions.filter((seat) =>
        seat.transitions.some((step) => step.status === this.historyIconFilter)
      )
    },

    seatTransitions() {
      // Build a map: seatId -> [{ status, color, mdi, label, date }, ...]
      const map = {}
      this.historyLog.forEach((entry) => {
        const seats = entry.seat_ids || []
        const cfg = STATUS_CONFIG[entry.status] || {}
        const step = {
          status: entry.status,
          color: cfg.color || '#ffeb3b',
          mdi: cfg.mdi || 'mdi-circle',
          label: cfg.label || entry.status || '—',
          date: new Date(entry.created_at).toLocaleString(),
          time: new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdBy: entry.created_by,
        }
        seats.forEach((seatId) => {
          if(!map[seatId]) map[seatId] = []
          map[seatId].push(step)
        })
      })
      return Object.keys(map).sort().map((id) => ({ id, label: this.formatSeatId(id), transitions: map[id] }))
    },

    activeStatusConfig() {
      // Filter STATUS_CONFIG to only include active items (exclude 'e' = Vacío from the icon filter)
      return Object.keys(STATUS_CONFIG)
        .filter(key => STATUS_CONFIG[key].active !== false && key !== 'e')
        .reduce((acc, key) => {
          acc[key] = STATUS_CONFIG[key]
          return acc
        }, {})
    },

    showMarkPanel: {
      get() { return this.selectedSeatsArray.length > 0 },
      set(val) { if(!val) this.clearSelectedSeats() }
    },

    seatSpacing() {
      return DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    allSubsections() {
      const subsections = []
      this.sections.forEach((section) => {
        const isLabel = section.l || section.isLabel
        const rawSubs = section.ss || section.subsections
        if(!isLabel && rawSubs) {
          rawSubs.forEach((sub) => {
            const isSubLabel = sub.l || sub.isLabel
            const seatsSource = sub.s || sub.seats
            if(!isSubLabel && seatsSource) {
              subsections.push(sub)
            }
          })
        }
      })
      return subsections
    },

    currentSubsectionIndex() {
      if(!this.selectedSubsection || this.allSubsections.length === 0) return -1
      const selectedId = this.selectedSubsection.i || this.selectedSubsection.id
      return this.allSubsections.findIndex((sub) => (sub.i || sub.id) === selectedId)
    },

    adjustedStageConfig() {
      // Usar las dimensiones exactas del contenedor padre
      return {
        ...this.stageConfig,
        width: this.containerWidth,
        height: this.containerHeightPx,
        x: 0,
        draggable: !this.isTwoFingerGesture,
        dragBoundFunc: this.selectedSubsection && this.dragMode ? this.getDragBoundFunc() : undefined,
      }
    },

    contentOffsetX() {
      // No aplicar offset cuando hay subsección seleccionada
      if(this.selectedSubsection) return 0

      // Calcular el offset para centrar el contenido
      if(!this.sections || this.sections.length === 0) return 0
      const maxSectionWidth = Math.max(...this.sections.map((section) => this.getSectionWidth(section)))
      const scaledWidth = maxSectionWidth * this.zoomLevel
      const containerWidth = this.adjustedStageConfig.width
      return Math.max(0, (containerWidth - scaledWidth) / 2)
    },

    containerHeight() {
      // Usar la altura del stage para que coincidan
      if(this.selectedSubsection) {
        const subsectionHeight = this.getSubsectionHeight(this.selectedSubsection) + 40
        return `${subsectionHeight * this.zoomLevel}px`
      }

      if(!this.sections || this.sections.length === 0) return "500px"

      const totalContentHeight =
        this.sections.reduce((acc, section, idx) => {
          return acc + this.getSectionHeight(section) + (idx > 0 ? DEFAULT_SETTINGS.SECTION_TOP_MARGIN : 0)
        }, 0) + 40

      const scaledHeight = totalContentHeight * this.zoomLevel
      return `${scaledHeight}px`
    },

    controlHeight() {
      // Retornar el valor cacheado que se actualiza con watcher
      return this.cachedControlHeight
    },

    appBarHeight() {
      // v-app-bar de Vuetify tiene altura de 64px en desktop y 56px en mobile
      const isMobile = this.$uaParser ? this.$uaParser.isMobile() : (typeof window !== "undefined" && window.innerWidth < 768)
      return isMobile ? 56 : 74
    },

    containerOuterHeight() {
      // Calcular: 100vh - altura del controlRow - altura del v-app-bar
      const controlH = this.controlHeight
      const appBarH = this.appBarHeight
      return `calc(100vh - ${controlH}px - ${appBarH}px - 34px)`
    },

    containerWidth() {
      // Ancho del contenedor: 100%
      if(typeof window === "undefined") return 800
      return window.innerWidth
    },

    containerHeightPx() {
      // Altura del contenedor en píxeles
      if(typeof window === "undefined") return 600
      const controlH = this.controlHeight
      const appBarH = this.appBarHeight
      return window.innerHeight - controlH - appBarH - 34
    },

    subsectionStats() {
      const seatsSource = this.selectedSubsection?.s || this.selectedSubsection?.seats
      if(!this.selectedSubsection || !seatsSource) {
        return { withStatus: 0, total: 0, percent: 0 }
      }

      let total = 0
      let withStatus = 0

      seatsSource.forEach((row) => {
        row.forEach((seat) => {
          if(seat) {
            total++
            if(seat.status && seat.status !== null) {
              withStatus++
            }
          }
        })
      })

      const percent = total > 0 ? Math.round((withStatus / total) * 100) : 0

      return { withStatus, total, percent }
    },

  },
  watch: {
    selectedSubsection() {
      // Cuando cambia la subsección, esperar a que el DOM se actualice y medir la nueva altura
      this.$nextTick(() => {
        // Agregar un pequeño delay para asegurar que Vuetify termine de renderizar
        setTimeout(() => {
          this.cachedControlHeight = this.getControlRowHeight()
        }, 100)
      })
    },
  },
  mounted() {
    // Aplicar fit to width automáticamente al cargar
    this.$nextTick(() => {
      setTimeout(() => {
        this.cachedControlHeight = this.getControlRowHeight()

        this.fitToHeight()
      }, 100)
    })

    // Start blinking interval for selected seats
    this.blinkInterval = setInterval(() => {
      this.blinkState = !this.blinkState
    }, 330) // Toggle every second
  },
  beforeDestroy() {
    // Clean up interval
    if(this.blinkInterval) {
      clearInterval(this.blinkInterval)
    }
  },
  methods: {
    getIconName(key) {
      return STATUS_CONFIG[key]?.mdi || ""
    },

    getSubsectionStatsFor(sub) {
      const seatsSource = sub?.s || sub?.seats
      if(!sub || !seatsSource) {
        return { withStatus: 0, total: 0, percent: 0 }
      }

      let total = 0
      let withStatus = 0

      seatsSource.forEach((row) => {
        row.forEach((seat) => {
          if(seat) {
            total++
            if(seat.status && seat.status !== null) {
              withStatus++
            }
          }
        })
      })

      const percent = total > 0 ? Math.round((withStatus / total) * 100) : 0

      return { withStatus, total, percent }
    },

    getPercentageColor(percent) {
      return getPercentageColor(percent)
    },

    getControlRowHeight() {
      // Intentar obtener la altura real del elemento v-row
      if(this.$refs.controlRow) {
        // Vuetify v-row puede ser accedido directamente o a través de $el
        const element = this.$refs.controlRow.$el || this.$refs.controlRow

        if(element && element.offsetHeight) {
          const height = element.offsetHeight

          return height > 0 ? height : 50
        }
      }

      // Fallback basado en viewport si el elemento no está disponible
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768
      const fallback = isMobile ? 52 : 48
      return fallback
    },

    getSectionConfig(sIdx) {
      const section = this.sections[sIdx]
      let y = 0

      // Calculate y position by summing heights of all previous sections
      for(let i = 0; i < sIdx; i++) {
        y += this.getSectionHeight(this.sections[i])
      }

      // Add spacing between sections (not for the first section)
      if(sIdx > 0) {
        y += sIdx * 20 // 20px spacing between each section
      }

      // Add 10px top margin for label sections (like "Altar")
      if(section.isLabel) {
        // y += 10
      }

      // Center each section within the original stage width
      const maxSectionWidth = Math.max(...this.sections.map((s) => this.getSectionWidth(s)))
      return { x: (maxSectionWidth - this.getSectionWidth(section)) / 2, y }
    },

    getSectionBgConfig(section) {
      return {
        width: this.getSectionWidth(section),
        height: this.getSectionHeight(section),
        fill: "black", // COLORS.SECTION_BG,
        strokeWidth: 0,
        stroke: "transparent",
        cornerRadius: 5,
      }
    },

    getSectionTitleConfig(section) {
      const name = section.n || section.name
      const isLabel = section.l || section.isLabel
      return {
        x: 0,
        y: 4,
        text: name,
        fontSize: 22,
        fill: isLabel ? "#1976d2" : "#fff",
        fontStyle: "bold",
        fontFamily: "Arial",
        align: "center",
        width: this.getSectionWidth(section),
      }
    },

    getSubsectionPosition(section, subIdx) {
      // Calculate x position by summing widths and padding of previous subsections
      let x = DEFAULT_SETTINGS.SECTION_SIDE_PADDING
      const rawSubs = section.ss || section.subsections

      for(let i = 0; i < subIdx; i++) {
        const s = rawSubs[i]
        const isLabel = s.l || s.isLabel
        const width = isLabel ? (s.w || s.width || 40) - 20 : this.getSubsectionWidth(s)
        x += width
        // Add padding after each subsection
        x += DEFAULT_SETTINGS.SUBSECTION_SPACING
      }

      return { x, y: DEFAULT_SETTINGS.SECTION_TOP_PADDING }
    },

    getRowLabelConfig(rowIdx) {
      return {
        x: -12,
        y: rowIdx * this.seatSpacing + DEFAULT_SETTINGS.SEAT_SIZE / 2,
        text: (rowIdx + 1).toString(),
        fontSize: 8,
        fill: "yellow",
        fontFamily: "Arial",
        align: "right",
        verticalAlign: "middle",
        offsetY: 3,
      }
    },

    getSubsectionWidth(sub) {
      const isLabel = sub.l || sub.isLabel
      if(isLabel) return sub.w || sub.width || 40
      const seatsSource = sub.s || sub.seats
      if(!seatsSource?.length) return 0
      const maxCols = Math.max(...seatsSource.map((row) => row.length))
      return maxCols * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    getSubsectionHeight(sub) {
      const isLabel = sub.l || sub.isLabel
      if(isLabel) return 0
      const seatsSource = sub.s || sub.seats
      if(!seatsSource?.length) return 40
      return seatsSource.length * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    getSectionWidth(section) {
      const isLabel = section.l || section.isLabel
      if(isLabel) {
        // Calculate the max width of all regular sections to center the label
        const maxSectionWidth = Math.max(
          ...this.sections
            .filter((s) => !(s.l || s.isLabel))
            .map((s) => {
              const rawSubs = s.ss || s.subsections
              if(!rawSubs || !rawSubs.length) return 0
              return (
                rawSubs.reduce((acc, sub) => {
                  const isSubLabel = sub.l || sub.isLabel
                  return acc + (isSubLabel ? (sub.w || sub.width || 40) - 20 : this.getSubsectionWidth(sub))
                }, 0) +
                (rawSubs.length - 1) * DEFAULT_SETTINGS.SUBSECTION_SPACING +
                DEFAULT_SETTINGS.SECTION_SIDE_PADDING * 2 +
                20 // Extra padding to cover last subsection
              )
            })
        )
        return maxSectionWidth || 800 // Use max section width or default
      }
      const rawSubs = section.ss || section.subsections
      if(!rawSubs || !rawSubs.length) return 0
      // Calculate extra width: subsection border (2px) + title padding (13px) + safety margin (5px) = 20px
      const extraWidthPadding = 20
      return (
        rawSubs.reduce((acc, s) => {
          const isSubLabel = s.l || s.isLabel
          return acc + (isSubLabel ? (s.w || s.width || 40) - 20 : this.getSubsectionWidth(s))
        }, 0) +
        (rawSubs.length - 1) * DEFAULT_SETTINGS.SUBSECTION_SPACING +
        DEFAULT_SETTINGS.SECTION_SIDE_PADDING * 2 +
        extraWidthPadding
      )
    },

    getSectionHeight(section) {
      const isLabel = section.l || section.isLabel
      if(isLabel) return 30
      const rawSubs = section.ss || section.subsections
      if(!rawSubs || !rawSubs.length) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
      const maxRows = Math.max(...rawSubs.map((sub) => {
        const isSubLabel = sub.l || sub.isLabel
        const seatsSource = sub.s || sub.seats
        return (isSubLabel ? 0 : seatsSource?.length || 0)
      }))
      if(maxRows === 0) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING + 40
      // Calculate extra height: column label offset (5px) + font size (8px) + spacing (7px) + stats area (20px) = 40px
      const extraHeightPadding = 40
      return maxRows * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE + DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING + extraHeightPadding
    },

    // Events & interactions
    handleSubsectionClick(subSection) {
      this.selectedSubsection = subSection

      // Set fitstate to 'width' if null, then apply the current fitstate
      if(this.fitstate === null) {
        this.fitstate = "width"
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.cachedControlHeight = this.getControlRowHeight()
          this.applyCurrentFit()
        }, 100)
      })
    },

    goBackToFullView() {
      this.selectedSubsection = null
      // Maintain the current fitstate
      this.$nextTick(() => {
        setTimeout(() => {
          this.cachedControlHeight = this.getControlRowHeight()
          this.applyCurrentFit()
        }, 100)
      })
    },

    nextSubsection() {
      if(!this.selectedSubsection || this.allSubsections.length === 0) return
      const currentIndex = this.currentSubsectionIndex
      const nextIndex = (currentIndex + 1) % this.allSubsections.length // circular navigation
      this.selectedSubsection = this.allSubsections[nextIndex]
      console.log("Next subsection:", this.selectedSubsection.name)
      // Apply current fitstate
      this.$nextTick(() => {
        setTimeout(() => {
          this.applyCurrentFit()
        }, 100)
      })
    },

    previousSubsection() {
      if(!this.selectedSubsection || this.allSubsections.length === 0) return
      const currentIndex = this.currentSubsectionIndex
      const prevIndex = currentIndex === 0 ? this.allSubsections.length - 1 : currentIndex - 1 // circular navigation
      this.selectedSubsection = this.allSubsections[prevIndex]
      console.log("Previous subsection:", this.selectedSubsection.name)
      // Apply current fitstate
      this.$nextTick(() => {
        setTimeout(() => {
          this.applyCurrentFit()
        }, 100)
      })
    },

    // Métodos de zoom
    zoomIn() {
      const newZoom = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep)
      this.zoomLevel = Math.round(newZoom * 10) / 10
      console.log("Zoom in:", this.zoomLevel)
    },

    zoomOut() {
      const newZoom = Math.max(this.minZoom, this.zoomLevel - this.zoomStep)
      this.zoomLevel = Math.round(newZoom * 10) / 10
      console.log("Zoom out:", this.zoomLevel)
    },

    applyCurrentFit() {
      // Apply fit based on current fitstate
      if(this.fitstate === "height") {
        this.fitToHeight()
      } else {
        this.fitToWidth()
      }
    },

    fitToWidth() {
      // Set fitstate to 'width'
      this.fitstate = "width"
      // Calcular el zoom óptimo basado en el ancho disponible
      if(!this.sections || this.sections.length === 0) {
        console.warn("No sections available for fit calculation")
        this.zoomLevel = 0.7
        return
      }

      // Usar setTimeout para asegurar que el DOM esté completamente renderizado (especialmente en mobile)
      setTimeout(() => {
        try {
          // Usar el ancho del contenedor calculado
          const actualWidth = this.containerWidth

          // Calcular el ancho real del contenido según si hay subsección seleccionada o no
          let maxContentWidth
          if(this.selectedSubsection) {
            // Si hay subsección seleccionada, incluir todos los offsets y elementos adicionales
            // - v-group x: 0
            // - v-rect x: 1, width: subsectionWidth + 18
            // - Total width: 1 + subsectionWidth + 18 + small margin (5px) = subsectionWidth + 24
            const subsectionContentWidth = this.getSubsectionWidth(this.selectedSubsection)
            maxContentWidth = subsectionContentWidth + 20 // rect x + content + rect extra + margin
            console.log("Subsection selected, width:", maxContentWidth)
          } else {
            // Si no hay subsección, calcular el ancho total considerando TODAS las secciones
            // Necesitamos el ancho máximo entre todas las secciones (ya que están una debajo de la otra)
            // getSectionWidth ya incluye extraWidthPadding, no agregar padding adicional
            maxContentWidth = Math.max(...this.sections.map((section) => this.getSectionWidth(section))) + 25
          }

          if(maxContentWidth > 0 && actualWidth > 0) {
            // Calcular zoom óptimo sin margen adicional ya que el contenido tiene su propio padding
            const optimalZoom = actualWidth / maxContentWidth
            // Establecer un mínimo de 0.3 y máximo según maxZoom
            this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, Math.round(optimalZoom * 10) / 10))
          } else {
            this.zoomLevel = 0.7 // Default más grande
          }

          // Establecer modo de arrastre en ambos ejes (permite movimiento en X e Y)
          this.dragMode = null

          // Resetear la posición del stage al centro
          this.$nextTick(() => {
            const stage = this.$refs.konvaStage?.getStage()
            if(stage) {
              stage.position({ x: 0, y: 0 })
              stage.batchDraw()
            }
          })
        } catch(error) {
          console.error("Error calculating fit:", error)
          this.zoomLevel = 0.7
        }
      }, 50) // Pequeño delay para asegurar que el DOM esté listo en mobile
    },

    fitToHeight() {
      // Set fitstate to 'height'
      this.fitstate = "height"
      // Calcular el zoom óptimo basado en la altura disponible
      if(!this.sections || this.sections.length === 0) {
        this.zoomLevel = 0.7
        return
      }

      // Usar setTimeout para asegurar que el DOM esté completamente renderizado (especialmente en mobile)
      setTimeout(() => {
        try {
          // Usar la altura del contenedor calculado
          const availableHeight = this.containerHeightPx

          // Calcular la altura total del contenido según si hay subsección seleccionada o no
          let totalContentHeight
          if(this.selectedSubsection) {
            const subsectionContentHeight = this.getSubsectionHeight(this.selectedSubsection)
            totalContentHeight = subsectionContentHeight + 35 // rect y + content + rect extra + label space
          } else {
            // Si no hay subsección, calcular altura total de todas las secciones
            totalContentHeight =
              this.sections.reduce((acc, section, idx) => {
                return acc + this.getSectionHeight(section) + (idx > 0 ? DEFAULT_SETTINGS.SECTION_TOP_MARGIN : 0)
              }, 0) + 40 // padding extra
          }

          if(totalContentHeight > 0 && availableHeight > 0) {
            // Calcular zoom óptimo sin margen adicional ya que el contenido tiene su propio padding
            const optimalZoom = availableHeight / totalContentHeight
            // Establecer un mínimo de 0.3 y máximo según maxZoom
            this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, Math.round(optimalZoom * 10) / 10))
          } else {
            this.zoomLevel = 0.7 // Default más grande
          }

          console.log("Fit to height zoom level:", this.zoomLevel)

          // Establecer modo de arrastre en ambos ejes (permite movimiento en X e Y)
          this.dragMode = null

          // Resetear la posición del stage al centro
          this.$nextTick(() => {
            const stage = this.$refs.konvaStage?.getStage()
            if(stage) {
              stage.position({ x: 0, y: 0 })
              stage.batchDraw()
            }
          })
        } catch(error) {
          console.error("Error calculating fit:", error)
          this.zoomLevel = 0.7
        }
      }, 50) // Pequeño delay para asegurar que el DOM esté listo en mobile
    },

    getDragBoundFunc() {
      const mode = this.dragMode
      return function(pos) {
        if(mode === "y") {
          // Solo permitir movimiento en eje X
          return {
            x: pos.x,
            y: 0,
          }
        } else if(mode === "x") {
          // Solo permitir movimiento en eje Y
          return {
            x: 0,
            y: pos.y,
          }
        }
        // Si no hay modo, permitir ambos ejes
        return pos
      }
    },
    handleSeatClick(payload) {
      const { seat } = payload

      this.isIOS = this.$uaParser.isIOS()
      this.isAndroid = this.$uaParser.isAndroid()
      const deviceInfo = this.$uaParser.getDeviceInfo()
      console.log("OS detected:", deviceInfo?.os.name, "isIOS:", this.isIOS, " SeatId:", seat.id)

      this.eventArrays.push("handleSeatClick " + deviceInfo?.os.name + " " + this.isIOS + "/" + this.isAndroid + " " + seat.id)

      // Only allow selection when a subsection is selected
      if(!this.selectedSubsection) {
        return
      }

      // Only check for drag if we actually detected a drag happening
      // isDraggingStage indicates an active drag, not just small movements
      if(this.isDraggingStage) {
        return
      }

      // Check if this was a significant drag operation after drag ended
      const stage = this.$refs.konvaStage?.getStage()
      if(stage && this.dragStartPos) {
        const currentPos = stage.position()
        const dragDistance = Math.sqrt(
          Math.pow(currentPos.x - this.dragStartPos.x, 2) +
          Math.pow(currentPos.y - this.dragStartPos.y, 2)
        )

        // Use threshold from constants to be more mobile-friendly
        // Small movements during taps shouldn't prevent selection
        if(dragDistance > DEFAULT_SETTINGS.DRAG_THRESHOLD) {
          return
        }
      }

      // It was a click/tap, toggle seat selection
      const seatId = seat.id
      const index = this.selectedSeatsArray.indexOf(seatId)

      if(index > -1) {
        // Seat is already selected, remove it
        this.selectedSeatsArray.splice(index, 1)
      } else {
        // Seat is not selected, add it
        this.selectedSeatsArray.push(seatId)
      }
    },

    setEventSeat(status) {
      if(this.selectedSeatsArray.length === 0) {
        console.warn("No seats selected")
        return
      }

      // Filter out seats that already have the target status – no need to resend them.
      // For the 'clear' action (status === null), skip seats that have no status.
      const seatIdsToSend = this.selectedSeatsArray.filter((seatId) => {
        const seat = this.findSeatById(seatId)
        if(!seat) return true // unknown seat – include it
        const currentStatus = seat.status || null
        return currentStatus !== status
      })

      // Deselect the skipped seats (already at target status)
      this.selectedSeatsArray = this.selectedSeatsArray.filter((id) => seatIdsToSend.includes(id))

      if(seatIdsToSend.length === 0) {
        console.info("All selected seats already have status:", status)
        this.selectedSeatsArray = []
        return
      }

      // Emit only the seats that need updating
      this.$emit("setEventSeat", {
        seatIds: seatIdsToSend,
        status,
      })

      // Clear selection after emitting
      this.selectedSeatsArray = []
    },

    clearSelectedSeats() {
      this.selectedSeatsArray = []
    },

    findSeatById(seatId) {
      for(const section of this.sections) {
        const rawSubs = section.ss || section.subsections
        if(!rawSubs) continue
        for(const sub of rawSubs) {
          const seatsSource = sub.s || sub.seats
          if(!seatsSource) continue
          for(const row of seatsSource) {
            for(const seat of row) {
              if(seat && (seat.i || seat.id) === seatId) return seat
            }
          }
        }
      }
      return null
    },

    handleSeatHover(e) {
      const container = e.target.getStage().container()
      container.style.cursor = e.target.attrs.opacity < 1 ? "not-allowed" : "pointer"
    },

    handleSeatLeave(e) {
      e.target.getStage().container().style.cursor = "default"
    },

    handleWheel(e) {
      // Prevent default scroll behavior
      e.evt.preventDefault()

      const stage = this.$refs.konvaStage?.getStage()
      if(!stage) return

      const oldScale = this.zoomLevel
      const pointer = stage.getPointerPosition()

      // Calculate zoom direction and amount
      const scaleBy = 1.05
      const direction = e.evt.deltaY > 0 ? -1 : 1

      // Calculate new zoom level
      let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

      // Clamp to min/max zoom
      newScale = Math.max(this.minZoom, Math.min(this.maxZoom, newScale))
      newScale = Math.round(newScale * 100) / 100

      // Only update if scale changed
      if(newScale === oldScale) return

      // Get mouse point relative to stage
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      }

      // Calculate new position to keep mouse point stable
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      }

      // Update zoom level
      this.zoomLevel = newScale

      // Update stage position to zoom toward mouse
      this.$nextTick(() => {
        stage.position(newPos)
        stage.batchDraw()
      })

      // Clear fitstate since user is manually zooming
      this.fitstate = null
    },

    handleTouchStart(e) {
      const touch1 = e.evt.touches[0]
      const touch2 = e.evt.touches[1]

      if(touch1 && touch2) {
        // Two fingers detected - prepare for pinch zoom
        this.isTwoFingerGesture = true
        this.lastDist = this.getDistance(touch1, touch2)
        this.lastCenter = this.getCenter(touch1, touch2)
      } else {
        this.isTwoFingerGesture = false
      }
    },

    handleTouchMove(e) {
      const touch1 = e.evt.touches[0]
      const touch2 = e.evt.touches[1]

      if(touch1 && touch2) {
        // Prevent default to avoid page scroll
        e.evt.preventDefault()

        const stage = this.$refs.konvaStage?.getStage()
        if(!stage) return

        const dist = this.getDistance(touch1, touch2)
        const center = this.getCenter(touch1, touch2)

        if(!this.lastDist) {
          this.lastDist = dist
        }

        const oldScale = this.zoomLevel
        const pointTo = {
          x: (center.x - stage.x()) / oldScale,
          y: (center.y - stage.y()) / oldScale,
        }

        // Calculate scale change
        const scale = dist / this.lastDist
        let newScale = oldScale * scale

        // Clamp to min/max zoom
        newScale = Math.max(this.minZoom, Math.min(this.maxZoom, newScale))
        newScale = Math.round(newScale * 100) / 100

        // Update zoom level
        this.zoomLevel = newScale

        // Calculate new position to zoom toward center of pinch
        const newPos = {
          x: center.x - pointTo.x * newScale,
          y: center.y - pointTo.y * newScale,
        }

        // Update stage position
        stage.position(newPos)
        stage.batchDraw()

        this.lastDist = dist
        this.lastCenter = center

        // Clear fitstate since user is manually zooming
        this.fitstate = null
      }
    },

    handleTouchEnd() {
      // Reset touch tracking
      this.lastDist = 0
      this.lastCenter = null
      this.isTwoFingerGesture = false
    },

    getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX
      const dy = touch1.clientY - touch2.clientY
      return Math.sqrt(dx * dx + dy * dy)
    },

    getCenter(touch1, touch2) {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      }
    },

    handleDragStart() {
      // Store initial position when drag starts
      const stage = this.$refs.konvaStage?.getStage()
      if(stage) {
        this.dragStartPos = { ...stage.position() }
        this.isDraggingStage = true
      }
    },

    handleDragEnd() {
      // Mark drag as complete
      this.isDraggingStage = false
      // Keep dragStartPos for a short time to detect clicks after drag
      setTimeout(() => {
        this.dragStartPos = null
      }, 100)
    },

    getStatusColor(status) {
      const STATUS_COLORS = {
        a: 'green',
        p: 'orange',
        r: 'red',
        e: 'grey',
      }
      return STATUS_COLORS[status] || 'blue-grey'
    },

    formatSeatId(seatId) {
      // Convert "seg1-seg2-row-col" to "rowLETTER", e.g. "1-2-1-4" -> "1D"
      if(!seatId) return seatId
      const parts = seatId.split('-')
      if(parts.length < 4) return seatId
      const row = parts[parts.length - 2]
      const col = parseInt(parts[parts.length - 1], 10)
      if(isNaN(col)) return seatId
      const letter = String.fromCharCode(64 + col) // 1=A, 2=B, 3=C, 4=D, 5=E ...
      return `${row}${letter}`
    },

    async openHistory() {
      this.historyDialog = true
      this.historyLoading = true
      this.historyLog = []
      this.historyIconFilter = null
      const prefix = this.sectionPrefix || (this.selectedSubsection ? (this.selectedSubsection.i || this.selectedSubsection.id) : null)
      try {
        const response = await this.$repository.AuditoriumEventSeatLog.index(
          { auditorium_event_id: this.auditoriumEventId, section_prefix: prefix + "-" }
        )
        this.historyLog = response?.seatsLog || []
        this.historyUsers = response?.users || []
      } catch(e) {
        console.error('Error fetching seat history:', e)
      } finally {
        this.historyLoading = false
      }
    },

    getHistoryUser(createdBy) {
      const user = this.historyUsers.find((u) => u.id === createdBy)
      if(!user) return `#${createdBy}`
      const lastName = user.last_name ? ` ${user.last_name.charAt(0)}.` : ''
      return `${user.name}${lastName}`
    },

  },
}
</script>

<style scoped>
.stage-container {
  position: relative;
  /* width: 100%; */
}

/* Mejorar scroll en mobile */
@media (max-width: 600px) {
  .stage-container {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
