<template>
  <div>
    <!-- Navigation and Zoom Controls -->
    <v-row class="mb-3">
      <v-col>
        <!-- Subsection navigation - only show when subsection is selected -->
        <template v-if="selectedSubsection">
          <span class="ml-3 text-h6">{{ selectedSubsection.name }}</span>
          <v-btn color="primary" prepend-icon="mdi-arrow-left" @click="goBackToFullView">Todo</v-btn>
          <v-btn color="primary" prepend-icon="mdi-arrow-left" class="ml-2" @click="previousSubsection">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-arrow-right" class="ml-2" @click="nextSubsection">
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
          <v-spacer class="d-inline-block" style="width: 20px"></v-spacer>
        </template>

        <!-- Zoom controls - always visible -->
        <div class="d-inline-flex ml-3">
          <v-btn color="info" size="small" :disabled="zoomLevel <= minZoom" class="rounded-r-0" @click="zoomOut">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <v-btn color="info" size="small" disabled class="px-3 rounded-0">{{ Math.round(zoomLevel * 100) }}%</v-btn>
          <v-btn color="info" size="small" :disabled="zoomLevel >= maxZoom" class="rounded-l-0" @click="zoomIn">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>

        <v-btn color="secondary" size="small" class="ml-2" @click="fitToWidth">
          <v-icon>mdi-arrow-expand-horizontal</v-icon>
          Fit Width
        </v-btn>
        <v-btn color="secondary" size="small" class="ml-2" @click="fitToHeight">
          <v-icon>mdi-arrow-expand-vertical</v-icon>
          Fit Height
        </v-btn>
      </v-col>
    </v-row>

    <v-sheet elevation="2" class="pa-0 stage-container" :style="{ background: 'green', height: 'auto', overflowX: 'hidden', overflowY: 'auto' }">
      <v-stage :config="adjustedStageConfig" style="background-color: pink" @click="handleStageClick" @tap="handleStageClick">
        <v-layer :config="{ x: contentOffsetX, scaleX: zoomLevel, scaleY: zoomLevel }">
          <!-- Show only selected subsection if one is selected -->
          <template v-if="selectedSubsection">
            <v-group :config="{ x: (adjustedStageConfig.width - getSubsectionWidth(selectedSubsection)) / 2, y: 50 }">
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
                  <v-circle :config="Object.assign({}, getSeatConfig(seat), { x: 0, y: 0 })" />
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
    </v-sheet>
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
      maxZoom: 3.0,
      zoomStep: 0.1,
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
      // Usar el ancho completo del contenedor disponible
      const containerWidth = typeof window !== "undefined" ? window.innerWidth : this.stageConfig.width

      // Calcular altura total del contenido
      const totalContentHeight =
        this.sections.reduce((acc, section, idx) => {
          return acc + this.getSectionHeight(section) + (idx > 0 ? this.settings.SECTIONS_MARGIN : 0)
        }, this.settings.SECTION_TOP_PADDING) + 100

      // El stage debe tener el tamaño del contenido escalado
      const scaledHeight = totalContentHeight * this.zoomLevel

      return {
        ...this.stageConfig,
        width: containerWidth,
        height: scaledHeight, // Altura escalada para que todo sea visible
        x: 0, // Asegurar que el stage comienza en x=0
      }
    },

    contentOffsetX() {
      // Calcular el offset para centrar el contenido
      if (!this.sections || this.sections.length === 0) return 0
      const maxSectionWidth = Math.max(...this.sections.map((section) => this.getSectionWidth(section)))
      const scaledWidth = maxSectionWidth * this.zoomLevel
      const containerWidth = this.adjustedStageConfig.width
      return Math.max(0, (containerWidth - scaledWidth) / 2)
    },

    containerHeight() {
      // Calcular altura del contenedor basada en el contenido escalado
      if (!this.sections || this.sections.length === 0) return "500px"

      const totalContentHeight =
        this.sections.reduce((acc, section, idx) => {
          return acc + this.getSectionHeight(section) + (idx > 0 ? this.settings.SECTIONS_MARGIN : 0)
        }, this.settings.SECTION_TOP_PADDING) + 100

      // La altura del contenedor debe ser el contenido escalado por el zoom
      const scaledHeight = totalContentHeight * this.zoomLevel
      // Usar altura fija suficientemente grande para mostrar todo el contenido
      return `${Math.max(700, scaledHeight + 100)}px`
    },
  },
  mounted() {
    // Aplicar fit to width automáticamente al cargar
    this.$nextTick(() => {
      this.fitToWidth()
    })
  },
  methods: {
    getSectionConfig(sIdx) {
      const section = this.sections[sIdx]
      const y = this.sections.slice(0, sIdx).reduce((acc, s) => acc + this.getSectionHeight(s) + this.settings.SECTIONS_MARGIN, this.settings.SECTION_TOP_PADDING)
      // Center each section within the original stage width
      const maxSectionWidth = Math.max(...this.sections.map((s) => this.getSectionWidth(s)))
      return { x: (maxSectionWidth - this.getSectionWidth(section)) / 2, y }
    },

    getSectionBgConfig(section) {
      return {
        width: this.getSectionWidth(section),
        height: this.getSectionHeight(section),
        fill: "black", // COLORS.SECTION_BG,
        strokeWidth: 1,
        stroke: "red",
        cornerRadius: 5,
      }
    },

    getSectionTitleConfig(section) {
      return {
        x: 0,
        y: section.isLabel ? 0 : this.settings.SECTION_TOP_PADDING / 4,
        text: section.name,
        fontSize: section.isLabel ? 24 : 20,
        fill: section.isLabel ? "#1976d2" : "#fff",
        fontStyle: "bold",
        fontFamily: "Arial",
        align: section.isLabel ? "left" : "center",
        width: section.isLabel ? undefined : this.getSectionWidth(section),
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
        x: 0,
        y: -15,
        text: sub.name,
        fontSize: 11,
        fill: "#fff",
        fontFamily: "Arial",
        align: "left",
        width: this.getSubsectionWidth(sub),
      }
    },

    getSubsectionLabelBgConfig(sub, section) {
      return {
        width: sub.width || 100,
        height: this.getSectionHeight(section) - this.settings.SECTION_TOP_PADDING - this.settings.SECTION_BOTTOM_PADDING,
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
      const category = seat.category ? String(seat.category).toLowerCase() : null
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
            strokeWidth = 4
          } else if (classStrokeMap[category]) {
            stroke = classStrokeMap[category]
            strokeWidth = 4
          }
        } catch (err) {
          if (classStrokeMap[category]) {
            stroke = classStrokeMap[category]
            strokeWidth = 4
          }
        }
      }

      return {
        x: seat.x,
        y: seat.y,
        radius: this.settings.SEAT_SIZE / 2,
        fill: isSelected ? COLORS.SEAT_SELECTED : isReserved ? COLORS.SEAT_RESERVED : COLORS.SEAT_FREE,
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
      if (section.isLabel) return 0
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
    },

    goBackToFullView() {
      this.selectedSubsection = null
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

      try {
        // Usar el ancho real del contenedor en lugar de window.innerWidth
        const stageContainer = document.querySelector(".stage-container")
        const actualWidth = stageContainer ? stageContainer.clientWidth : window.innerWidth

        // Calcular el ancho real del contenido
        const maxContentWidth = Math.max(...this.sections.map((section) => this.getSectionWidth(section)))

        console.log("Actual container width:", actualWidth, "Max content width:", maxContentWidth)

        if (maxContentWidth > 0 && actualWidth > 0) {
          // Usar menos margen para aprovechar mejor el espacio disponible
          const optimalZoom = (actualWidth - 20) / maxContentWidth
          // Establecer un mínimo de 0.6 para que no se vea demasiado pequeño
          this.zoomLevel = Math.max(0.6, Math.min(this.maxZoom, Math.round(optimalZoom * 10) / 10))
        } else {
          this.zoomLevel = 0.7 // Default más grande
        }

        console.log("Fit to width zoom level:", this.zoomLevel)
      } catch (error) {
        console.error("Error calculating fit:", error)
        this.zoomLevel = 0.7
      }
    },

    fitToHeight() {
      // Calcular el zoom óptimo basado en la altura disponible
      if (!this.sections || this.sections.length === 0) {
        console.warn("No sections available for fit calculation")
        this.zoomLevel = 0.7
        return
      }

      try {
        // Usar la altura real del contenedor
        const stageContainer = document.querySelector(".stage-container")
        const actualHeight = stageContainer ? stageContainer.clientHeight : window.innerHeight

        // Calcular la altura total del contenido
        const totalContentHeight =
          this.sections.reduce((acc, section, idx) => {
            return acc + this.getSectionHeight(section) + (idx > 0 ? this.settings.SECTIONS_MARGIN : 0)
          }, this.settings.SECTION_TOP_PADDING) + 100 // padding extra

        console.log("Actual container height:", actualHeight, "Total content height:", totalContentHeight)

        if (totalContentHeight > 0 && actualHeight > 0) {
          // Usar menos margen para aprovechar mejor el espacio disponible
          const optimalZoom = (actualHeight - 20) / totalContentHeight
          // Establecer un mínimo de 0.6 para que no se vea demasiado pequeño
          this.zoomLevel = Math.max(0.6, Math.min(this.maxZoom, Math.round(optimalZoom * 10) / 10))
        } else {
          this.zoomLevel = 0.7 // Default más grande
        }

        console.log("Fit to height zoom level:", this.zoomLevel)
      } catch (error) {
        console.error("Error calculating fit:", error)
        this.zoomLevel = 0.7
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
  width: 100%;
}

/* Mejorar scroll en mobile */
@media (max-width: 600px) {
  .stage-container {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
