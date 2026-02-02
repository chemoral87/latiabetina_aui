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
    
        >
          <v-layer :config="{ x: contentOffsetX, scaleX: zoomLevel, scaleY: zoomLevel }">
            <!-- Show only selected subsection if one is selected -->
            <template v-if="selectedSubsection">
              <AuditoriumSeatsStageSubsection :subsection="selectedSubsection"  :categories="categories" :selected-seats-array="selectedSeatsArray" :blink-state="blinkState" @seat-click="handleSeatClick" />
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

      <div :style="{ backgroundColor: 'lightblue', width: '70px', minWidth: '70px', overflow: 'auto', height: containerOuterHeight }">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px">
          <h4 style="margin: 0; ">Selected Seats</h4>
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
           <v-btn class="mb-2"  icon  title="Hombre" style="background-color: #1976D2  !important; color: white" @click="setEventSeat('hom')">
            <v-icon >mdi-human-male</v-icon>
          </v-btn> 
           <v-btn class="mb-4"  icon  title="Mujer" style="background-color: #E91E63 !important; color: white" @click="setEventSeat('muj')">
            <v-icon >mdi-human-female</v-icon>
          </v-btn>
               <v-btn class="mb-2"  icon  title="Nuevo" style="background-color: #2E7D32  !important; color: white" @click="setEventSeat('nue')">
            <v-icon >mdi-star</v-icon>
          </v-btn> 
         
          <v-btn class="mb-2"  icon  title="Adolescente" style="background-color: #F57C00 !important; color: white" @click="setEventSeat('ado')">
            <v-icon >mdi-human-scooter</v-icon>
          </v-btn>
          <v-btn class="mb-2"  icon  title="Niño" style="background-color: #00BCD4 !important; color: white" @click="setEventSeat('niñ')">
            <v-icon >mdi-human-child</v-icon>
          </v-btn>
          <v-btn  icon title="Porteador" style="background-color: #7B1FA2 !important; color: white" @click="setEventSeat('por')">
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
import { getPercentageColor, DEFAULT_SETTINGS } from "./constants.js"
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
    }
  },
  computed: {
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
        const width = s.isLabel ? ((s.width || 40) - 20) : this.getSubsectionWidth(s)
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
                s.subsections.reduce((acc, sub) => acc + (sub.isLabel ? ((sub.width || 40) - 20) : this.getSubsectionWidth(sub)), 0) +
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
        section.subsections.reduce((acc, s) => acc + (s.isLabel ? ((s.width || 40) - 20) : this.getSubsectionWidth(s)), 0) +
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
        this.fitstate = 'width'
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
      if (this.fitstate === 'height') {
        this.fitToHeight()
      } else {
        this.fitToWidth()
      }
    },

    fitToWidth() {
      // Set fitstate to 'width'
      this.fitstate = 'width'
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
            maxContentWidth =  subsectionContentWidth + 20  // rect x + content + rect extra + margin
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
      // Set fitstate to 'height'
      this.fitstate = 'height'
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
            totalContentHeight =  subsectionContentHeight + 35  // rect y + content + rect extra + label space
          
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
    handleSeatClick(payload) {
      const { seat, event } = payload
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

    handleSeatHover(e) {
      const container = e.target.getStage().container()
      container.style.cursor = e.target.attrs.opacity < 1 ? "not-allowed" : "pointer"
    },

    handleSeatLeave(e) {
      e.target.getStage().container().style.cursor = "default"
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
