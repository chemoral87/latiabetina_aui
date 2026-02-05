<template>
  <div>
    <!-- Navigation and Zoom Controls -->
    <v-row ref="controlRow" dense>
      {{ eventArrays }}
      <v-col>
        <!-- Subsection navigation - only show when subsection is selected -->
        <template v-if="selectedSubsection">
          <!-- <span class="text-body">{{ selectedSubsection.name }}</span> -->
          <v-btn color="primary" small prepend-icon="mdi-arrow-left" @click="goBackToFullView">All</v-btn>
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
      </v-col>
    </v-row>

    <div style="display: flex; gap: 2px">
      <div id="subsectionPanel" :style="{ backgroundColor: 'blueviolet', flex: 1, height: containerOuterHeight, overflow: 'hidden' }">
        <v-stage ref="konvaStage" :config="adjustedStageConfig" :style="{ backgroundColor: selectedSubsection ? 'lightgray' : 'pink' }" @wheel="handleWheel" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" @dragstart="handleDragStart" @dragend="handleDragEnd">
          <v-layer :config="{ x: contentOffsetX, scaleX: zoomLevel, scaleY: zoomLevel }">
            <!-- Show only selected subsection if one is selected -->
            <template v-if="selectedSubsection">
              <AuditoriumSeatsStageSubsection :subsection="selectedSubsection" :categories="categories" :selected-seats-array="selectedSeatsArray" :blink-state="blinkState" @seat-click="handleSeatClick" />
            </template>

            <!-- Show all sections when no subsection is selected -->
            <template v-else>
              <v-group v-for="(section, sIdx) in sections" :key="`section-${sIdx}`" :config="getSectionConfig(sIdx)">
                <v-rect :config="getSectionBgConfig(section)" />
                <v-rect v-if="!section.isLabel" :config="getSectionBgConfig(section)" />
                <v-text :config="getSectionTitleConfig(section)" />

                <template v-if="!section.isLabel">
                  <v-group
                    v-for="(sub, subIdx) in section.subsections"
                    :key="`sub-${sIdx}-${subIdx}`"
                    :config="getSubsectionPosition(section, subIdx)"
                    @click="handleSubsectionClick(sub)"
                    @tap="handleSubsectionClick(sub)"
                    @mouseenter="handleSeatHover"
                    @mouseleave="handleSeatLeave"
                  >
                    <template v-if="sub.isLabel">
                      <AuditoriumSeatsStageSubsectionLabel :subsection="sub" :section-height="getSectionHeight(section)" />
                    </template>

                    <template v-else>
                      <!-- general  -->
                      <AuditoriumSeatsStageSubsection :subsection="sub" :categories="categories" :selected-seats-array="selectedSeatsArray" :blink-state="blinkState" />
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
    <div v-if="selectedSeatsArray.length > 0" id="markPanel" class="floating-mark-panel" :style="panelStyle">
      <div 
        class="panel-title"
        style="display: flex; align-items: center; justify-content: space-between; padding: 2px 5px; background-color: #1976d2; color: white; position: relative; z-index: 1; cursor: move"
        @mousedown="startPanelDrag"
        @touchstart="startPanelDrag"
      >
        <h4 style="margin: 0; font-size: 14px">Seats: {{ selectedSeatsArray.length }}</h4>
        <v-btn outlined fab x-small icon color="white" title="Clear all" @click.stop="clearSelectedSeats" @mousedown.stop @touchstart.stop>
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="mt-0" style="padding: 2px 4px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; ">
        <!-- Loop through active status configs -->
        <div v-for="(config, key) in activeStatusConfig" :key="key" style="display: flex; flex-direction: column; align-items: center">
          <v-btn class="mb-1" icon :title="config.label" :style="`background-color: ${config.color} !important; color: white`" @click="setEventSeat(key == 'vac' ? null : key)">
            <v-icon>{{ getIconName(key) }}</v-icon>
          </v-btn>
          <span style="font-size: 9px; text-align: center">{{ config.label }}</span>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import VueKonva from "vue-konva"
import { getPercentageColor, DEFAULT_SETTINGS, STATUS_CONFIG } from "./constants.js"
Vue.use(VueKonva)

export default {
  name: "SeatsStageOpCopy",
  props: {
    sections: { type: Array, required: true },

    stageConfig: { type: Object, required: true },
    categories: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      eventArrays : [],
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
      isPanelDragging: false, // Track if floating panel is being dragged
      panelDragOffset: { x: 0, y: 0 }, // Offset for panel dragging
      panelPosition: null, // Custom position for dragged panel (null = use default CSS)
    }
  },
  computed: {
    activeStatusConfig() {
      // Filter STATUS_CONFIG to only include active items
      return Object.keys(STATUS_CONFIG)
        .filter(key => STATUS_CONFIG[key].active !== false)
        .reduce((acc, key) => {
          acc[key] = STATUS_CONFIG[key]
          return acc
        }, {})
    },

    seatSpacing() {
      return DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    allSubsections() {
      const subsections = []
      this.sections.forEach((section) => {
        if (!section.isLabel && section.subsections) {
          section.subsections.forEach((sub) => {
            if (!sub.isLabel && sub.seats) {
              subsections.push(sub)
            }
          })
        }
      })
      return subsections
    },

    currentSubsectionIndex() {
      if (!this.selectedSubsection || this.allSubsections.length === 0) return -1
      return this.allSubsections.findIndex((sub) => sub.id === this.selectedSubsection.id)
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
      if (this.selectedSubsection) return 0

      // Calcular el offset para centrar el contenido
      if (!this.sections || this.sections.length === 0) return 0
      const maxSectionWidth = Math.max(...this.sections.map((section) => this.getSectionWidth(section)))
      const scaledWidth = maxSectionWidth * this.zoomLevel
      const containerWidth = this.adjustedStageConfig.width
      return Math.max(0, (containerWidth - scaledWidth) / 2)
    },

    containerHeight() {
      // Usar la altura del stage para que coincidan
      if (this.selectedSubsection) {
        const subsectionHeight = this.getSubsectionHeight(this.selectedSubsection) + 40
        return `${subsectionHeight * this.zoomLevel}px`
      }

      if (!this.sections || this.sections.length === 0) return "500px"

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
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768
      return isMobile ? 56 : 64
    },

    containerOuterHeight() {
      // Calcular: 100vh - altura del controlRow - altura del v-app-bar
      const controlH = this.controlHeight
      const appBarH = this.appBarHeight
      return `calc(100vh - ${controlH}px - ${appBarH}px - 34px)`
    },

    containerWidth() {
      // Ancho del contenedor: 100%
      if (typeof window === "undefined") return 800
      return window.innerWidth
    },

    containerHeightPx() {
      // Altura del contenedor en píxeles
      if (typeof window === "undefined") return 600
      const controlH = this.controlHeight
      const appBarH = this.appBarHeight
      return window.innerHeight - controlH - appBarH - 34
    },

    subsectionStats() {
      if (!this.selectedSubsection || !this.selectedSubsection.seats) {
        return { withStatus: 0, total: 0, percent: 0 }
      }

      let total = 0
      let withStatus = 0

      this.selectedSubsection.seats.forEach((row) => {
        row.forEach((seat) => {
          if (seat) {
            total++
            if (seat.status && seat.status !== null) {
              withStatus++
            }
          }
        })
      })

      const percent = total > 0 ? Math.round((withStatus / total) * 100) : 0

      return { withStatus, total, percent }
    },

    panelStyle() {
      if (this.panelPosition) {
        return {
          left: `${this.panelPosition.x}px`,
          top: `${this.panelPosition.y}px`,
          transform: 'none',
          right: 'auto',
        }
      }
      return {}
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

        this.fitToWidth()
      }, 100)
    })

    // Start blinking interval for selected seats
    this.blinkInterval = setInterval(() => {
      this.blinkState = !this.blinkState
    }, 330) // Toggle every second
  },
  beforeDestroy() {
    // Clean up interval
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval)
    }
  },
  methods: {
    getIconName(key) {
      const iconMap = {
        hom: "mdi-human-male",
        muj: "mdi-human-female",
        nue: "mdi-face-man-shimmer",
        nua: "mdi-face-woman-shimmer",
        ado: "mdi-human-scooter",
        niñ: "mdi-human-child",
        por: "mdi-human-male-child"
      }
      return iconMap[key] || ""
    },

    getSubsectionStatsFor(sub) {
      if (!sub || !sub.seats) {
        return { withStatus: 0, total: 0, percent: 0 }
      }

      let total = 0
      let withStatus = 0

      sub.seats.forEach((row) => {
        row.forEach((seat) => {
          if (seat) {
            total++
            if (seat.status && seat.status !== null) {
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
      if (this.$refs.controlRow) {
        // Vuetify v-row puede ser accedido directamente o a través de $el
        const element = this.$refs.controlRow.$el || this.$refs.controlRow

        if (element && element.offsetHeight) {
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
      for (let i = 0; i < sIdx; i++) {
        y += this.getSectionHeight(this.sections[i])
      }

      // Add spacing between sections (not for the first section)
      if (sIdx > 0) {
        y += sIdx * 20 // 20px spacing between each section
      }

      // Add 10px top margin for label sections (like "Altar")
      if (section.isLabel) {
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
      return {
        x: 0,
        y: 4,
        text: section.name,
        fontSize: 22,
        fill: section.isLabel ? "#1976d2" : "#fff",
        fontStyle: "bold",
        fontFamily: "Arial",
        align: "center",
        width: section.isLabel ? this.getSectionWidth(section) : this.getSectionWidth(section),
      }
    },

    getSubsectionPosition(section, subIdx) {
      // Calculate x position by summing widths and padding of previous subsections
      let x = DEFAULT_SETTINGS.SECTION_SIDE_PADDING

      for (let i = 0; i < subIdx; i++) {
        const s = section.subsections[i]
        // Add subsection width (use explicit width for labels with -20 reduction, calculate for regular subsections)
        // Labels use (width || 40) - 20 to make them more compact (20px instead of 40px)
        const width = s.isLabel ? (s.width || 40) - 20 : this.getSubsectionWidth(s)
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
      if (sub.isLabel) return sub.width || 40
      if (!sub.seats?.length) return 0
      const maxCols = Math.max(...sub.seats.map((row) => row.length))
      return maxCols * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    getSubsectionHeight(sub) {
      if (sub.isLabel) return 0
      if (!sub.seats?.length) return 40
      return sub.seats.length * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    getSectionWidth(section) {
      if (section.isLabel) {
        // Calculate the max width of all regular sections to center the label
        const maxSectionWidth = Math.max(
          ...this.sections
            .filter((s) => !s.isLabel)
            .map((s) => {
              if (!s.subsections.length) return 0
              return (
                s.subsections.reduce((acc, sub) => acc + (sub.isLabel ? (sub.width || 40) - 20 : this.getSubsectionWidth(sub)), 0) +
                (s.subsections.length - 1) * DEFAULT_SETTINGS.SUBSECTION_SPACING +
                DEFAULT_SETTINGS.SECTION_SIDE_PADDING * 2 +
                20 // Extra padding to cover last subsection
              )
            })
        )
        return maxSectionWidth || 800 // Use max section width or default
      }
      if (!section.subsections.length) return 0
      // Calculate extra width: subsection border (2px) + title padding (13px) + safety margin (5px) = 20px
      const extraWidthPadding = 20
      return (
        section.subsections.reduce((acc, s) => acc + (s.isLabel ? (s.width || 40) - 20 : this.getSubsectionWidth(s)), 0) +
        (section.subsections.length - 1) * DEFAULT_SETTINGS.SUBSECTION_SPACING +
        DEFAULT_SETTINGS.SECTION_SIDE_PADDING * 2 +
        extraWidthPadding
      )
    },

    getSectionHeight(section) {
      if (section.isLabel) return 30
      if (!section.subsections?.length) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
      const maxRows = Math.max(...section.subsections.map((sub) => (sub.isLabel ? 0 : sub.seats?.length || 0)))
      if (maxRows === 0) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING + 40
      // Calculate extra height: column label offset (5px) + font size (8px) + spacing (7px) + stats area (20px) = 40px
      const extraHeightPadding = 40
      return maxRows * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE + DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING + extraHeightPadding
    },

    // Events & interactions
    handleSubsectionClick(subSection) {
      this.selectedSubsection = subSection

      // Set fitstate to 'width' if null, then apply the current fitstate
      if (this.fitstate === null) {
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
      if (!this.selectedSubsection || this.allSubsections.length === 0) return
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
      if (!this.selectedSubsection || this.allSubsections.length === 0) return
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
      if (this.fitstate === "height") {
        this.fitToHeight()
      } else {
        this.fitToWidth()
      }
    },

    fitToWidth() {
      // Set fitstate to 'width'
      this.fitstate = "width"
      // Calcular el zoom óptimo basado en el ancho disponible
      if (!this.sections || this.sections.length === 0) {
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
          if (this.selectedSubsection) {
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

          if (maxContentWidth > 0 && actualWidth > 0) {
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
            if (stage) {
              stage.position({ x: 0, y: 0 })
              stage.batchDraw()
            }
          })
        } catch (error) {
          console.error("Error calculating fit:", error)
          this.zoomLevel = 0.7
        }
      }, 50) // Pequeño delay para asegurar que el DOM esté listo en mobile
    },

    fitToHeight() {
      // Set fitstate to 'height'
      this.fitstate = "height"
      // Calcular el zoom óptimo basado en la altura disponible
      if (!this.sections || this.sections.length === 0) {
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
          if (this.selectedSubsection) {
            const subsectionContentHeight = this.getSubsectionHeight(this.selectedSubsection)
            totalContentHeight = subsectionContentHeight + 35 // rect y + content + rect extra + label space
          } else {
            // Si no hay subsección, calcular altura total de todas las secciones
            totalContentHeight =
              this.sections.reduce((acc, section, idx) => {
                return acc + this.getSectionHeight(section) + (idx > 0 ? DEFAULT_SETTINGS.SECTION_TOP_MARGIN : 0)
              }, 0) + 40 // padding extra
          }

          if (totalContentHeight > 0 && availableHeight > 0) {
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
            if (stage) {
              stage.position({ x: 0, y: 0 })
              stage.batchDraw()
            }
          })
        } catch (error) {
          console.error("Error calculating fit:", error)
          this.zoomLevel = 0.7
        }
      }, 50) // Pequeño delay para asegurar que el DOM esté listo en mobile
    },

    getDragBoundFunc() {
      const mode = this.dragMode
      return function (pos) {
        if (mode === "y") {
          // Solo permitir movimiento en eje X
          return {
            x: pos.x,
            y: 0,
          }
        } else if (mode === "x") {
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
      console.log("OS detected:", deviceInfo?.os.name, "isIOS:", this.isIOS)

      this.eventArrays.push(  "handleSeatClick " + deviceInfo?.os.name + " " + this.isIOS + "/" + this.isAndroid + " " + seat.id)
      
      // Only allow selection when a subsection is selected
      if (!this.selectedSubsection) {
        return
      }

      // Only check for drag if we actually detected a drag happening
      // isDraggingStage indicates an active drag, not just small movements
      if (this.isDraggingStage) {
        return
      }

      // Check if this was a significant drag operation after drag ended
      const stage = this.$refs.konvaStage?.getStage()
      if (stage && this.dragStartPos) {
        const currentPos = stage.position()
        const dragDistance = Math.sqrt(
          Math.pow(currentPos.x - this.dragStartPos.x, 2) + 
          Math.pow(currentPos.y - this.dragStartPos.y, 2)
        )
        
        // Use threshold from constants to be more mobile-friendly
        // Small movements during taps shouldn't prevent selection
        if (dragDistance > DEFAULT_SETTINGS.DRAG_THRESHOLD) {
          return
        }
      }

      // It was a click/tap, toggle seat selection
      const seatId = seat.id
      const index = this.selectedSeatsArray.indexOf(seatId)

      if (index > -1) {
        // Seat is already selected, remove it
        this.selectedSeatsArray.splice(index, 1)
      } else {
        // Seat is not selected, add it
        this.selectedSeatsArray.push(seatId)
      }
    },

    setEventSeat(status) {
      if (this.selectedSeatsArray.length === 0) {
        console.warn("No seats selected")
        return
      }

      // Emit event with selected seats and category
      this.$emit("setEventSeat", {
        seatIds: [...this.selectedSeatsArray],
        status,
      })

      // Clear selection after emitting
      this.selectedSeatsArray = []
    },

    clearSelectedSeats() {
      this.selectedSeatsArray = []
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
      if (!stage) return

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
      if (newScale === oldScale) return

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

      if (touch1 && touch2) {
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

      if (touch1 && touch2) {
        // Prevent default to avoid page scroll
        e.evt.preventDefault()

        const stage = this.$refs.konvaStage?.getStage()
        if (!stage) return

        const dist = this.getDistance(touch1, touch2)
        const center = this.getCenter(touch1, touch2)

        if (!this.lastDist) {
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
      if (stage) {
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

    startPanelDrag(e) {
      e.preventDefault()
      this.isPanelDragging = true

      const panel = document.getElementById('markPanel')
      if (!panel) return

      // Get current position of panel
      const rect = panel.getBoundingClientRect()
      
      // Determine if mouse or touch event
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      // Store offset from cursor to panel top-left
      this.panelDragOffset = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }

      // Add global listeners
      document.addEventListener('mousemove', this.movePanelDrag)
      document.addEventListener('touchmove', this.movePanelDrag)
      document.addEventListener('mouseup', this.endPanelDrag)
      document.addEventListener('touchend', this.endPanelDrag)
    },

    movePanelDrag(e) {
      if (!this.isPanelDragging) return

      // Determine if mouse or touch event
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      // Calculate new position
      const newX = clientX - this.panelDragOffset.x
      const newY = clientY - this.panelDragOffset.y

      // Set panel position
      this.panelPosition = {
        x: Math.max(0, Math.min(window.innerWidth - 200, newX)),
        y: Math.max(0, Math.min(window.innerHeight - 100, newY)),
      }
    },

    endPanelDrag() {
      this.isPanelDragging = false

      // Remove global listeners
      document.removeEventListener('mousemove', this.movePanelDrag)
      document.removeEventListener('touchmove', this.movePanelDrag)
      document.removeEventListener('mouseup', this.endPanelDrag)
      document.removeEventListener('touchend', this.endPanelDrag)
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

<style>
/* Floating mark panel - unscoped for proper z-index */
.floating-mark-panel {
  position: fixed;
  top: 60px;
  right: 0px;
  transform: none;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  pointer-events: auto;
}

@media (min-width: 768px) {
  .floating-mark-panel {
    top: 75px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
}
</style>
