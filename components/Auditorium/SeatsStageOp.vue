<template>
  <div>
    <!-- Navigation and Zoom Controls -->
    <v-row ref="controlRow" dense>
      <v-col>
        <!-- Subsection navigation - only show when subsection is selected -->
        <template v-if="selectedSubsection">
          <!-- <span class="text-body">{{ selectedSubsection.name }}</span> -->
          <v-btn color="primary" small prepend-icon="mdi-arrow-left" @click="goBackToFullView">Full</v-btn>
          <v-btn color="primary" small class="ml-1" @click="previousSubsection">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-btn color="primary" small class="ml-1" @click="nextSubsection">
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
        </template>

        <!-- Zoom controls - always visible -->
        <!-- <div class="d-inline-flex">
          <v-btn color="info" small :disabled="zoomLevel <= minZoom" class="rounded-r-0" @click="zoomOut">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <v-btn color="info" small disabled class="px-3 rounded-0">{{ Math.round(zoomLevel * 100) }}%</v-btn>
          <v-btn color="info" small :disabled="zoomLevel >= maxZoom" class="rounded-l-0" @click="zoomIn">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div> -->

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
      <div :style="{ backgroundColor: 'blueviolet', flex: 1, height: containerOuterHeight, overflow: 'hidden' }">
        <v-stage
          ref="konvaStage"
          :config="adjustedStageConfig"
          :style="{ backgroundColor: selectedSubsection ? 'lightgray' : 'pink' }"
          @click="handleStageClick"
          @tap="handleStageClick"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <v-layer :config="{ x: contentOffsetX, scaleX: zoomLevel, scaleY: zoomLevel }">
            <!-- Show only selected subsection if one is selected -->
            <template v-if="selectedSubsection">
              <v-group :config="{ x: 17, y: 20 }">
                <v-rect
                  :config="{
                    x: -15,
                    y: -17,
                    width: getSubsectionWidth(selectedSubsection) + 22,
                    height: getSubsectionHeight(selectedSubsection) + 31,
                    fill: 'black',
                    stroke: 'red',
                    strokeWidth: 1,
                  }"
                />
                <v-text v-for="rowIdx in selectedSubsection.seats.length" :key="`row-label-${rowIdx}`" :config="getRowLabelConfig(rowIdx - 1)" />
                <v-text v-for="colIdx in getMaxColumns(selectedSubsection)" :key="`col-label-${colIdx}`" :config="getColLabelConfig(colIdx - 1, selectedSubsection)" />
                <v-text :config="getSubsectionTitleConfig(selectedSubsection)" />

                <template v-for="seat in getSubsectionSeats(selectedSubsection)">
                  <v-group :key="seat.id" :config="{ x: seat.x, y: seat.y }">
                    <v-circle :config="Object.assign({}, getSeatConfig(seat), { x: 0, y: 0, listening: true })" @click="handleSeatClick(seat)" @tap="handleSeatClick(seat)" @touchend="handleSeatClick(seat)" />
                  </v-group>
                </template>
              </v-group>
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
                      <v-rect :config="getSubsectionLabelBgConfig(sub, section)" />
                      <v-text :config="getSubsectionLabelTextConfig(sub, section)" />
                    </template>

                    <template v-else>
                      <v-group>
                        <v-rect
                          :config="{
                            x: -15,
                            y: -17,
                            width: getSubsectionWidth(sub) + 22,
                            height: getSubsectionHeight(sub) + 31,
                            fill: 'black',
                            stroke: 'red',
                            strokeWidth: 1,
                          }"
                        />
                        <v-text v-for="rowIdx in sub.seats.length" :key="`row-label-${rowIdx}`" :config="getRowLabelConfig(rowIdx - 1)" />
                        <v-text v-for="colIdx in getMaxColumns(sub)" :key="`col-label-${colIdx}`" :config="getColLabelConfig(colIdx - 1, sub)" />
                        <v-text :config="getSubsectionTitleConfig(sub)" />
                      </v-group>

                      <template v-for="seat in getSubsectionSeats(sub)">
                        <v-group :key="seat.id" :config="{ x: seat.x, y: seat.y }">
                          <v-circle :config="Object.assign({}, getSeatConfig(seat), { x: 0, y: 0 })" />
                        </v-group>
                      </template>
                    </template>
                  </v-group>
                </template>
              </v-group>
            </template>
          </v-layer>
        </v-stage>
      </div>

      <div :style="{ backgroundColor: 'lightblue', width: '70px', minWidth: '70px', overflow: 'auto', height: containerOuterHeight }">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px">
          <h3 style="margin: 0; ">Seats</h3>
        </div>

        <p style="margin: 0; font-weight: bold;  padding: 0 5px">
          {{ selectedSeatsArray.length }}

          <v-btn v-if="selectedSeatsArray.length > 0" outlined fab x-small icon color="error" title="Clear all" @click="selectedSeatsArray = []">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </p>

        <div v-if="selectedSeatsArray.length > 0" class="mt-3" style="padding: 5px; display: flex; flex-wrap: wrap; gap: 3px; justify-content: center">
          <v-btn class="mb-2" icon  title="Disponible" style="background-color: #ffeb3b !important; color: black" @click="setEventSeat(null)">
            <v-icon >mdi-account-outline</v-icon>
          </v-btn>
          <v-btn class="mb-6"  icon  title="Ocupado" style="background-color: #0000ff  !important; color: white" @click="setEventSeat('ocupado')">
            <v-icon >mdi-account</v-icon>
          </v-btn>
          <v-btn class="mb-2"  icon  title="Adulto" style="background-color: #6B7280 !important; color: white" @click="setEventSeat('adulto')">
            <v-icon >mdi-human</v-icon>
          </v-btn>
          <v-btn class="mb-2"  icon  title="Adolescente" style="background-color: #8B5CF6 !important; color: white" @click="setEventSeat('adolescente')">
            <v-icon >mdi-human-scooter</v-icon>
          </v-btn>
          <v-btn class="mb-2"  icon  title="Niño" style="background-color: #EC4899 !important; color: white" @click="setEventSeat('niño')">
            <v-icon >mdi-human-child</v-icon>
          </v-btn>
          <v-btn  icon title="Porteador" style="background-color: #F97316 !important; color: white" @click="setEventSeat('porteador')">
            <v-icon >mdi-human-male-child</v-icon>
          </v-btn>
        </div>

        <!-- <div v-for="seatId in selectedSeatsArray" :key="seatId" style="padding: 3px; margin: 3px; background: white; border-radius: 3px; font-size: 10px; word-break: break-all">
          {{ seatId }} -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import VueKonva from "vue-konva"
import { CLASS_STROKE_MAP } from "~/constants/auditorium.js"
Vue.use(VueKonva)

const COLORS = {
  SEAT_SELECTED: "#1976d2",

  SEAT_FREE: "#ffeb3b", // "#1b728d",
  SEAT_RESERVED: "lightgrey",
  SECTION_BG: "#222d3b",
  SUBSECTION_BG: "#e0e0e0",
  LABEL_TEXT: "#ff9800",
}

export default {
  name: "SeatsStageOp",
  props: {
    sections: { type: Array, required: true },
    settings: { type: Object, required: true },
    stageConfig: { type: Object, required: true },
    categories: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectedSubsection: null,
      zoomLevel: 1,
      minZoom: 0.3,
      maxZoom: 8.0,
      zoomStep: 0.1,
      dragMode: null, // 'x', 'y', or null for both axes
      cachedControlHeight: 50, // altura inicial del control row
      lastDistance: 0, // distancia entre dedos en el último evento touch
      lastCenter: null, // centro del pinch en el último evento
      selectedSeatsArray: [], // Array of selected seat IDs
      blinkState: false, // Toggle for blinking animation
      blinkInterval: null, // Interval reference
    }
  },
  computed: {
    seatSpacing() {
      return this.settings.SEAT_SIZE + this.settings.SEATS_DISTANCE
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
        draggable: true,
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
          return acc + this.getSectionHeight(section) + (idx > 0 ? this.settings.SECTIONS_MARGIN : 0)
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
      // Ancho del contenedor: 100% - 70px (sidebar) - gap
      if (typeof window === "undefined") return 800
      const gap = 2 // gap between panels (matches template gap: 2px)
      return window.innerWidth - 70 - gap
    },

    containerHeightPx() {
      // Altura del contenedor en píxeles
      if (typeof window === "undefined") return 600
      const controlH = this.controlHeight
      const appBarH = this.appBarHeight
      return window.innerHeight - controlH - appBarH - 34
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
    }, 500) // Toggle every second
  },
  beforeDestroy() {
    // Clean up interval
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval)
    }
  },
  methods: {
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
      let y = this.sections.slice(0, sIdx).reduce((acc, s, idx) => {
        return acc + this.getSectionHeight(s) + this.settings.SECTIONS_MARGIN
      }, 10)

      // Add extra spacing between major sections
      if (sIdx > 0) {
        y += 20
      }

      // Add 10px top margin for label sections (like "Altar")
      if (section.isLabel) {
        y += 10
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
        fontSize: section.isLabel ? 24 : 20,
        fill: section.isLabel ? "#1976d2" : "#fff",
        fontStyle: "bold",
        fontFamily: "Arial",
        align: "center",
        width: section.isLabel ? this.getSectionWidth(section) : this.getSectionWidth(section),
      }
    },

    getSubsectionPosition(section, subIdx) {
      const x = section.subsections.slice(0, subIdx).reduce((acc, s) => acc + (s.isLabel ? s.width || 100 : this.getSubsectionWidth(s)), 0) + subIdx * this.settings.SUBSECTION_PADDING + this.settings.SECTION_SIDE_PADDING
      return { x, y: this.settings.SECTION_TOP_PADDING }
    },

    getSubsectionRectConfig(sub) {
      return {
        width: this.getSubsectionWidth(sub),
        height: this.getSubsectionHeight(sub),
        fill: COLORS.SUBSECTION_BG,
        stroke: "green",
        strokeWidth: 2,
      }
    },

    getSubsectionTitleConfig(sub) {
      return {
        x: -13,
        y: -15,
        text: sub.name,
        fontSize: 11,
        fill: "#fff",
        fontFamily: "Arial",
        align: "left",
        width: this.getSubsectionWidth(sub) + 13,
      }
    },

    getSubsectionLabelBgConfig(sub, section) {
      return {
        width: sub.width || 100,
        height: this.getSectionHeight(section) - this.settings.SECTION_TOP_PADDING - 10,
        fill: "#424242",
        opacity: 0.3,
        strokeWidth: 2,
        stroke: COLORS.LABEL_TEXT,
        strokeDashArray: [5, 5],
      }
    },

    getSubsectionLabelTextConfig(sub, section) {
      const width = sub.width || 100
      const height = this.getSectionHeight(section) - this.settings.SECTION_TOP_PADDING - this.settings.SECTION_BOTTOM_PADDING
      return {
        x: width / 2,
        y: height / 2,
        text: sub.name,
        fontSize: 14,
        fill: COLORS.LABEL_TEXT,
        fontStyle: "bold",
        align: "center",
        offsetX: width / 2 - 5,
        offsetY: 7,
      }
    },

    getRowLabelConfig(rowIdx) {
      return {
        x: -12,
        y: rowIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
        text: (rowIdx + 1).toString(),
        fontSize: 8,
        fill: "yellow",
        fontFamily: "Arial",
        align: "right",
        verticalAlign: "middle",
        offsetY: 3,
      }
    },

    getMaxColumns(sub) {
      if (!sub || !Array.isArray(sub.seats) || sub.seats.length === 0) return 0
      return Math.max(...sub.seats.map((row) => (row ? row.length : 0)))
    },

    getColLabelConfig(colIdx, sub) {
      const labelSpacing = this.seatSpacing // small extra gap between column letters
      return {
        x: colIdx * labelSpacing + this.settings.SEAT_SIZE / 2,
        y: this.getSubsectionHeight(sub) + 5,
        text: String.fromCharCode(65 + colIdx),
        fontSize: 8,
        fill: "yellow",
        fontFamily: "Arial",
        align: "center",
        offsetX: 3,
      }
    },

    getSubsectionSeats(sub) {
      const allSeats = []
      sub.seats.forEach((row, rowIdx) => {
        row.forEach((seat, colIdx) => {
          if (seat.state !== "invisible") {
            allSeats.push({
              ...seat,
              x: colIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
              y: rowIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
            })
          }
        })
      })
      return allSeats
    },

    getSeatConfig(seat) {
      const isReserved = seat.state === "reserved"
      const isSelected = seat.state === "selected"
      const isInSelectedArray = this.selectedSeatsArray.includes(seat.id)
      const category = seat.category ? String(seat.category).toLowerCase() : null
      const status = seat.status ? String(seat.status).toLowerCase() : null
      const classStrokeMap = CLASS_STROKE_MAP

      let stroke = isSelected ? COLORS.SEAT_SELECTED : "#757575"
      let strokeWidth = 1

      if (category) {
        // prefer category color from passed `categories` prop when available
        try {
          const def = (this.categories || []).find((c) => String(c.label).toLowerCase() === category || String(c.value).toLowerCase() === category)
          // Do NOT apply border when the matched category represents "Ninguno" (value === null)
          if (def && typeof def.value !== "undefined" && def.value !== null && def.fill) {
            stroke = def.fill
            strokeWidth = 2
          } else if (classStrokeMap[category]) {
            stroke = classStrokeMap[category]
            strokeWidth = 2
          }
        } catch (err) {}
      }

      // Apply blinking effect for seats in selectedSeatsArray
      let fill = isSelected ? COLORS.SEAT_SELECTED : isReserved ? COLORS.SEAT_RESERVED : COLORS.SEAT_FREE
      if (isInSelectedArray) {
        fill = this.blinkState ? "#ffeb3b" : "#f44336" // Yellow and Red blinking
        strokeWidth = 0
      } else if (status) {
        // Set fill color based on status
        const statusColors = {
          ocupado: "#0000ff",
          adulto: "#6B7280",
          adolescente: "#8B5CF6",
          niño: "#EC4899",
          porteador: "#F97316",
        }
        fill = statusColors[status] || fill
      }

      return {
        x: seat.x,
        y: seat.y,
        radius: this.settings.SEAT_SIZE / 2,
        fill,
        stroke,
        strokeWidth,
        opacity: isReserved ? 0.6 : 1,
      }
    },

    getSubsectionWidth(sub) {
      if (sub.isLabel) return sub.width || 100
      if (!sub.seats?.length) return 0
      const maxCols = Math.max(...sub.seats.map((row) => row.length))
      return maxCols * this.seatSpacing - this.settings.SEATS_DISTANCE
    },

    getSubsectionHeight(sub) {
      if (sub.isLabel) return 0
      if (!sub.seats?.length) return 40
      return sub.seats.length * this.seatSpacing - this.settings.SEATS_DISTANCE
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
                s.subsections.reduce((acc, sub) => acc + (sub.isLabel ? sub.width || 100 : this.getSubsectionWidth(sub)), 0) +
                (s.subsections.length - 1) * this.settings.SUBSECTION_PADDING +
                this.settings.SECTION_SIDE_PADDING * 2
              )
            })
        )
        return maxSectionWidth || 800 // Use max section width or default
      }
      if (!section.subsections.length) return 0
      return (
        section.subsections.reduce((acc, s) => acc + (s.isLabel ? s.width || 100 : this.getSubsectionWidth(s)), 0) +
        (section.subsections.length - 1) * this.settings.SUBSECTION_PADDING +
        this.settings.SECTION_SIDE_PADDING * 2
      )
    },

    getSectionHeight(section) {
      if (section.isLabel) return 30
      if (!section.subsections?.length) return this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING
      const maxRows = Math.max(...section.subsections.map((sub) => (sub.isLabel ? 0 : sub.seats?.length || 0)))
      if (maxRows === 0) return this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING + 40
      return maxRows * this.seatSpacing - this.settings.SEATS_DISTANCE + this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING
    },

    // Events & interactions
    handleSubsectionClick(subSection) {
      this.selectedSubsection = subSection
      console.log("Selected subsection:", subSection.id, subSection.name)
      // Automatically fit to width when a subsection is selected
      this.$nextTick(() => {
        setTimeout(() => {
          this.cachedControlHeight = this.getControlRowHeight()
          this.fitToWidth()
        }, 100)
      })
    },

    goBackToFullView() {
      this.selectedSubsection = null
      this.$nextTick(() => {
        setTimeout(() => {
          this.cachedControlHeight = this.getControlRowHeight()
          this.fitToWidth()
        }, 100)
      })
    },

    nextSubsection() {
      if (!this.selectedSubsection || this.allSubsections.length === 0) return
      const currentIndex = this.currentSubsectionIndex
      const nextIndex = (currentIndex + 1) % this.allSubsections.length // circular navigation
      this.selectedSubsection = this.allSubsections[nextIndex]
      console.log("Next subsection:", this.selectedSubsection.name)
    },

    previousSubsection() {
      if (!this.selectedSubsection || this.allSubsections.length === 0) return
      const currentIndex = this.currentSubsectionIndex
      const prevIndex = currentIndex === 0 ? this.allSubsections.length - 1 : currentIndex - 1 // circular navigation
      this.selectedSubsection = this.allSubsections[prevIndex]
      console.log("Previous subsection:", this.selectedSubsection.name)
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

    fitToWidth() {
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
            // - v-group offset x: 17
            // - rectangle offset x: -15
            // - rectangle width: getSubsectionWidth + 22
            // Total: 17 + (getSubsectionWidth + 22) = 17 + width + 22
            const subsectionContentWidth = this.getSubsectionWidth(this.selectedSubsection) + 22 // rectangle width
            maxContentWidth = 5 + subsectionContentWidth // group x + content width
            console.log("Subsection selected, width:", maxContentWidth)
          } else {
            // Si no hay subsección, calcular el ancho total considerando TODAS las secciones
            // Necesitamos el ancho máximo entre todas las secciones (ya que están una debajo de la otra)
            maxContentWidth = Math.max(...this.sections.map((section) => this.getSectionWidth(section)))
            // Agregar padding adicional para el contenido completo
            maxContentWidth += 20 // padding lateral
            console.log("Full view, max section width:", maxContentWidth)
          }

          console.log("Actual container width:", actualWidth, "Max content width:", maxContentWidth)

          if (maxContentWidth > 0 && actualWidth > 0) {
            // Calcular zoom óptimo sin margen adicional ya que el contenido tiene su propio padding
            const optimalZoom = actualWidth / maxContentWidth
            // Establecer un mínimo de 0.3 y máximo según maxZoom
            this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, Math.round(optimalZoom * 10) / 10))
          } else {
            this.zoomLevel = 0.7 // Default más grande
          }

          console.log("Fit to width zoom level:", this.zoomLevel)

          // Establecer modo de arrastre en X (permite solo movimiento vertical Y)
          this.dragMode = "x"

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
      // Calcular el zoom óptimo basado en la altura disponible
      if (!this.sections || this.sections.length === 0) {
        console.warn("No sections available for fit calculation")
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
            // Si hay subsección seleccionada, incluir todos los offsets y elementos adicionales
            // - v-group offset y: 20
            // - rectangle offset y: -17
            // - rectangle height: getSubsectionHeight + 31
            // - column labels below: ~15px
            const subsectionContentHeight = this.getSubsectionHeight(this.selectedSubsection) + 31 // rectangle height
            totalContentHeight = 0 + subsectionContentHeight + 5 // group y + content + column labels
            console.log("Subsection selected, height:", totalContentHeight)
          } else {
            // Si no hay subsección, calcular altura total de todas las secciones
            totalContentHeight =
              this.sections.reduce((acc, section, idx) => {
                return acc + this.getSectionHeight(section) + (idx > 0 ? this.settings.SECTIONS_MARGIN : 0)
              }, 0) + 40 // padding extra
            console.log("Full view, total content height:", totalContentHeight)
          }

          console.log("Available container height:", availableHeight, "Total content height:", totalContentHeight)

          if (totalContentHeight > 0 && availableHeight > 0) {
            // Calcular zoom óptimo sin margen adicional ya que el contenido tiene su propio padding
            const optimalZoom = availableHeight / totalContentHeight
            // Establecer un mínimo de 0.3 y máximo según maxZoom
            this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, Math.round(optimalZoom * 10) / 10))
          } else {
            this.zoomLevel = 0.7 // Default más grande
          }

          console.log("Fit to height zoom level:", this.zoomLevel)

          // Establecer modo de arrastre en Y (permite solo movimiento horizontal X)
          this.dragMode = "y"

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

    findSeatById(id) {
      if (!id) return null
      for (let s = 0; s < this.sections.length; s++) {
        const section = this.sections[s]
        for (let subIdx = 0; subIdx < (section.subsections?.length || 0); subIdx++) {
          const sub = section.subsections[subIdx]
          if (!sub.seats) continue
          for (let r = 0; r < sub.seats.length; r++) {
            const row = sub.seats[r]
            for (let c = 0; c < row.length; c++) {
              const seat = row[c]
              if (seat && seat.id === id) return seat
            }
          }
        }
      }
      return null
    },

    handleStageClick(e) {
      // Optional: handle stage background clicks if needed
    },

    handleSeatClick(seat, event) {
      // Stop event propagation to prevent stage drag
      if (event && event.cancelBubble !== undefined) {
        event.cancelBubble = true
      }
      if (event && event.evt) {
        event.evt.stopPropagation()
        event.evt.preventDefault()
      }

      // Only allow selection when a subsection is selected
      if (!this.selectedSubsection) {
        return
      }

      const seatId = seat.id
      const index = this.selectedSeatsArray.indexOf(seatId)

      if (index > -1) {
        // Seat is already selected, remove it
        this.selectedSeatsArray.splice(index, 1)
        console.log("Seat removed from selection:", seatId)
      } else {
        // Seat is not selected, add it
        this.selectedSeatsArray.push(seatId)
        console.log("Seat added to selection:", seatId)
      }

      console.log("Selected seats array:", this.selectedSeatsArray)
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

    handleTouchStart(e) {
      const touches = e.evt.touches
      if (touches && touches.length === 2) {
        // Inicio del gesto de pinch con dos dedos
        const touch1 = touches[0]
        const touch2 = touches[1]

        this.lastDistance = this.getDistance(touch1, touch2)
        this.lastCenter = this.getCenter(touch1, touch2)
      }
    },

    handleTouchMove(e) {
      const touches = e.evt.touches
      if (touches && touches.length === 2) {
        e.evt.preventDefault()

        const touch1 = touches[0]
        const touch2 = touches[1]

        const currentDistance = this.getDistance(touch1, touch2)
        const currentCenter = this.getCenter(touch1, touch2)

        if (this.lastDistance > 0) {
          // Calcular el factor de zoom basado en el cambio de distancia
          const scale = currentDistance / this.lastDistance
          const newZoom = this.zoomLevel * scale

          // Aplicar el zoom dentro de los límites
          this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom))

          // Ajustar la posición del stage para hacer zoom hacia el centro del pinch
          const stage = this.$refs.konvaStage?.getStage()
          if (stage) {
            const oldPos = stage.position()
            const mousePointTo = {
              x: currentCenter.x - oldPos.x,
              y: currentCenter.y - oldPos.y,
            }

            const newPos = {
              x: currentCenter.x - mousePointTo.x * scale,
              y: currentCenter.y - mousePointTo.y * scale,
            }

            stage.position(newPos)
            stage.batchDraw()
          }
        }

        this.lastDistance = currentDistance
        this.lastCenter = currentCenter
      }
    },

    handleTouchEnd(e) {
      // Resetear cuando se levanten los dedos
      const touches = e.evt.touches
      if (!touches || touches.length < 2) {
        this.lastDistance = 0
        this.lastCenter = null
      }
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

    handleSeatHover(e) {
      const container = e.target.getStage().container()
      container.style.cursor = e.target.attrs.opacity < 1 ? "not-allowed" : "pointer"
    },

    handleSeatLeave(e) {
      e.target.getStage().container().style.cursor = "default"
    },

    // Parse seat id robustly: extract numeric parts and map to section/sub indexes
    parseSeatId(id) {
      if (!id) return { sectionIdx: 0, subIdx: 0 }
      const nums = String(id).match(/\d+/g)
      if (!nums || nums.length === 0) return { sectionIdx: 0, subIdx: 0 }
      // Expecting at least [section, subsection, row, col] or ['section','1','2','3'] formats
      const sectionIdx = Math.max(0, parseInt(nums[0], 10) - 1)
      const subIdx = Math.max(0, parseInt(nums[1] || 1, 10) - 1)
      return { sectionIdx, subIdx }
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
