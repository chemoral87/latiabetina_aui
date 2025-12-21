<template>
  <v-container fluid class="editor-wrapper pa-0">
    <!-- Header fijo para móvil -->
    <div class="mobile-header">
      <v-btn icon small @click="drawer = !drawer">
        <v-icon small>mdi-menu</v-icon>
      </v-btn>
      <span class="mobile-title">
        <span v-if="auditorium && auditorium.name">Auditorio: {{ auditorium.name }}</span>
      </span>
      <v-btn color="primary" small @click="saveAuditorium">
        <v-icon left small>mdi-content-save</v-icon>
        Guardar
      </v-btn>
    </div>

    <v-row no-gutters class="main-row">
      <!-- Panel de Control -->
      <v-col cols="12" md="3" class="sidebar-col">
        <v-navigation-drawer v-model="drawer" :permanent="$vuetify.breakpoint.mdAndUp" :temporary="$vuetify.breakpoint.smAndDown" width="100%" class="control-sidebar">
          <div class="sidebar-content">
            <div v-if="$vuetify.breakpoint.mdAndUp" class="desktop-header mb-4">
              <span v-if="auditorium && auditorium.name" class="auditorium-name">Auditorio: {{ auditorium.name }}</span>
              <v-btn color="primary" small class="save-btn" @click="saveAuditorium">
                <v-icon left small>mdi-content-save</v-icon>
                Guardar
              </v-btn>
            </div>

            <v-btn color="primary" block small class="mb-2" @click="addSection(false)">
              <v-icon left small>mdi-plus</v-icon>
              Agregar sección
            </v-btn>

            <v-btn color="secondary" block small class="mb-4" @click="addSection(true)">
              <v-icon left small>mdi-label</v-icon>
              Agregar etiqueta sección
            </v-btn>

            <!-- Configuración -->
            <v-card outlined class="mb-4">
              <v-card-text class="pa-3">
                <div class="text-caption mb-3 font-weight-bold">Configuración</div>
                <v-btn small color="success" block class="mb-2" @click="exportConfiguration">
                  <v-icon left small>mdi-download</v-icon>
                  Exportar JSON
                </v-btn>
                <v-btn small color="info" block @click="$refs.fileInput.click()">
                  <v-icon left small>mdi-upload</v-icon>
                  Importar JSON
                </v-btn>
                <input ref="fileInput" type="file" accept=".json" style="display: none" @change="importConfiguration" />
              </v-card-text>
            </v-card>

            <!-- Sliders -->
            <v-card outlined class="mb-4">
              <v-card-text class="pa-3">
                <v-slider v-model="settings.SEAT_SIZE" :min="8" :max="20" :step="1" label="Tamaño de asiento" thumb-label="always" hide-details dense class="mb-3" />

                <v-slider v-model="settings.SEATS_DISTANCE" :min="4" :max="12" :step="1" label="Distancia entre asientos" thumb-label="always" hide-details dense />
              </v-card-text>
            </v-card>

            <!-- Lista de Secciones -->
            <div class="sections-scroll-container">
              <div class="text-caption font-weight-bold mb-2">Secciones ({{ sections.length }})</div>

              <v-expansion-panels accordion multiple>
                <v-expansion-panel v-for="(section, sIdx) in sections" :key="`section-${sIdx}`" class="mb-2">
                  <v-expansion-panel-header class="py-2">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-text-field v-model="section.name" dense solo hide-details style="max-width: 100px" class="mr-2 section-name-input" @click.stop />
                        <v-chip v-if="section.isLabel" x-small color="secondary">Etiqueta</v-chip>
                      </div>
                      <v-btn icon x-small color="error" @click.stop="removeSection(sIdx)">
                        <v-icon x-small>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </v-expansion-panel-header>

                  <v-expansion-panel-content v-if="!section.isLabel">
                    <div class="d-flex gap-1 mb-3">
                      <v-btn x-small color="secondary" @click="addSubsection(sIdx, false)">
                        <v-icon left x-small>mdi-plus</v-icon>
                        Agregar subsección
                      </v-btn>
                      <v-btn x-small color="accent" @click="addSubsection(sIdx, true)">
                        <v-icon left x-small>mdi-label-outline</v-icon>
                        Agregar área
                      </v-btn>
                    </div>

                    <!-- Lista de subsecciones -->
                    <div v-for="(sub, subIdx) in section.subsections" :key="`sub-${subIdx}`" class="subsection-item mb-3">
                      <v-card outlined class="pa-2">
                        <div class="d-flex align-center mb-2">
                          <v-text-field v-model="sub.name" :label="sub.isLabel ? 'Nombre área' : 'Nombre subsección'" dense hide-details class="mr-2" />
                          <v-chip v-if="sub.isLabel" x-small color="accent">Área</v-chip>
                        </div>

                        <!-- Ancho de área -->
                        <v-slider v-if="sub.isLabel" v-model="sub.width" :min="60" :max="200" :step="10" label="Ancho del área" thumb-label="always" dense hide-details class="mb-3" />

                        <template v-if="!sub.isLabel">
                          <!-- Configurar filas y columnas -->
                          <div class="grid-config mb-3">
                            <div class="text-caption mb-1">Filas × Columnas</div>
                            <div class="d-flex align-center gap-2">
                              <v-text-field v-model.number="sub.tempRows" label="Filas" type="number" dense hide-details style="max-width: 70px" />
                              <span>×</span>
                              <v-text-field v-model.number="sub.tempCols" label="Columnas" type="number" dense hide-details style="max-width: 70px" />
                              <v-btn x-small color="primary" @click="setSubsectionGrid(sIdx, subIdx)">Aplicar</v-btn>
                            </div>
                          </div>

                          <!-- Información de debug -->
                          <div v-if="showDebug" class="debug-info text-caption mb-2">
                            <div>Filas: {{ sub.seats?.length || 0 }}</div>
                            <div>Columnas: {{ getMaxColumns(sub) }}</div>
                          </div>

                          <!-- Agregar asiento individual -->
                          <v-divider class="my-2" />
                          <div class="text-caption mb-1">Agregar asiento individual:</div>
                          <div class="d-flex align-center gap-1 mb-2">
                            <v-select v-model="selectedRow[`${sIdx}-${subIdx}`]" :items="getRowOptions(sub)" label="Fila" dense hide-details style="min-width: 120px" class="mr-2" />
                            <div class="d-flex gap-1">
                              <v-btn x-small color="primary" :disabled="!isRowSelected(sIdx, subIdx)" @click="addSeatToRow(sIdx, subIdx, 'left')">
                                <v-icon x-small>mdi-chevron-left</v-icon>
                                Izq
                              </v-btn>
                              <v-btn x-small color="primary" :disabled="!isRowSelected(sIdx, subIdx)" @click="addSeatToRow(sIdx, subIdx, 'right')">
                                <v-icon x-small>mdi-chevron-right</v-icon>
                                Der
                              </v-btn>
                            </div>
                          </div>
                        </template>

                        <div class="d-flex justify-end">
                          <v-btn icon x-small color="error" @click="removeSubsection(sIdx, subIdx)">
                            <v-icon x-small>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </v-card>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
        </v-navigation-drawer>
      </v-col>

      <!-- Canvas de Asientos -->
      <v-col cols="12" md="9" class="canvas-col">
        <v-sheet
          elevation="2"
          class="canvas-sheet pa-2"
          :style="{
            minHeight: $vuetify.breakpoint.smAndDown ? '400px' : '500px',
            backgroundColor: '#f5f5f5',
          }"
        >
          <!-- Debug info -->
          <div v-if="showDebug" class="debug-header pa-2 mb-2">
            <div>Stage: {{ stageWidth }}x{{ stageHeight }} | Zoom: {{ zoom.toFixed(1) }}x</div>
            <div>Secciones: {{ sections.length }} | Asientos totales: {{ totalSeats }}</div>
          </div>

          <!-- Controles de zoom para móvil -->
          <div v-if="$vuetify.breakpoint.smAndDown" class="mobile-zoom-controls mb-2">
            <v-btn x-small :disabled="zoom <= 0.5" @click="zoomOut">
              <v-icon x-small>mdi-minus</v-icon>
            </v-btn>
            <span class="zoom-text mx-2">{{ Math.round(zoom * 100) }}%</span>
            <v-btn x-small :disabled="zoom >= 2" @click="zoomIn">
              <v-icon x-small>mdi-plus</v-icon>
            </v-btn>
            <v-btn x-small class="ml-2" @click="resetZoom">
              <v-icon x-small>mdi-refresh</v-icon>
            </v-btn>
          </div>

          <!-- Contenedor del canvas -->
          <div ref="canvasContainer" class="canvas-scroll-container" @wheel.prevent="handleWheel">
            <div
              class="canvas-transform-wrapper"
              :style="{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: stageWidth + 'px',
                height: stageHeight + 'px',
              }"
            >
              <v-stage ref="stage" :config="stageConfig" @click="handleStageClick">
                <v-layer>
                  <!-- Secciones -->
                  <v-group v-for="(section, sIdx) in sections" :key="`section-${sIdx}`" :config="getSectionConfig(sIdx)">
                    <!-- Fondo de sección -->
                    <v-rect v-if="!section.isLabel" :config="getSectionBgConfig(sIdx)" />

                    <!-- Título de sección -->
                    <v-text :config="getSectionTitleConfig(sIdx)" />

                    <!-- Debug info para sección -->
                    <v-text
                      v-if="showDebug"
                      :config="{
                        x: 5,
                        y: -10,
                        text: `S${sIdx}: ${section.name} (${section.subsections?.length || 0} subs)`,
                        fontSize: 10,
                        fill: 'red',
                      }"
                    />

                    <!-- Subsecciones -->
                    <template v-if="!section.isLabel">
                      <v-group v-for="(sub, subIdx) in section.subsections" :key="`sub-${sIdx}-${subIdx}`" :config="getSubsectionPosition(sIdx, subIdx)">
                        <!-- Si es área/etiqueta -->
                        <template v-if="sub.isLabel">
                          <v-rect :config="getSubsectionLabelBgConfig(sIdx, subIdx)" />
                          <v-text :config="getSubsectionLabelTextConfig(sIdx, subIdx)" />
                        </template>

                        <!-- Si tiene asientos -->
                        <template v-else>
                          <!-- Debug info para subsección -->
                          <v-text
                            v-if="showDebug"
                            :config="{
                              x: 5,
                              y: -5,
                              text: `Sub${subIdx}: ${sub.seats?.length || 0}x${getMaxColumns(sub)}`,
                              fontSize: 8,
                              fill: 'blue',
                            }"
                          />

                          <!-- Etiquetas de filas (números) -->
                          <template v-if="sub.seats && sub.seats.length > 0">
                            <v-text v-for="(row, rowIdx) in sub.seats" :key="`row-label-${sIdx}-${subIdx}-${rowIdx}`" :config="getRowLabelConfig(sIdx, subIdx, rowIdx)" />
                          </template>

                          <!-- Etiquetas de columnas (letras) -->
                          <template v-if="getMaxColumns(sub) > 0">
                            <v-text v-for="colIdx in getMaxColumns(sub)" :key="`col-label-${sIdx}-${subIdx}-${colIdx}`" :config="getColLabelConfig(sIdx, subIdx, colIdx - 1)" />
                          </template>

                          <!-- Fondo de subsección -->
                          <v-rect :config="getSubsectionRectConfig(sIdx, subIdx)" />

                          <!-- Título de subsección -->
                          <v-text :config="getSubsectionTitleConfig(sIdx, subIdx)" />

                          <!-- Asientos -->
                          <template v-if="sub.seats && sub.seats.length > 0">
                            <template v-for="(row, rowIdx) in sub.seats">
                              <v-group
                                v-for="(seat, colIdx) in row"
                                :key="`seat-${sIdx}-${subIdx}-${rowIdx}-${colIdx}`"
                                :config="{
                                  x: colIdx * seatSpacing + settings.SEAT_SIZE / 2,
                                  y: rowIdx * seatSpacing + settings.SEAT_SIZE / 2,
                                }"
                              >
                                <v-circle :config="getSeatConfig(seat)" @mouseenter="handleSeatHover" @mouseleave="handleSeatLeave" @click="handleSeatClick(seat, $event)" />

                                <!-- Texto de debug en asiento -->
                                <v-text
                                  v-if="showDebug && seat"
                                  :config="{
                                    x: 0,
                                    y: 0,
                                    text: `${rowIdx + 1}${String.fromCharCode(65 + colIdx)}`,
                                    fontSize: 6,
                                    fill: 'white',
                                    align: 'center',
                                    verticalAlign: 'middle',
                                  }"
                                />
                              </v-group>
                            </template>
                          </template>
                        </template>
                      </v-group>
                    </template>
                  </v-group>
                </v-layer>

                <!-- Tooltip -->
                <v-layer>
                  <v-group v-if="activeSeat" :config="{ x: tooltipPos.x, y: tooltipPos.y }">
                    <v-rect :config="tooltipBgConfig" />
                    <v-text
                      :config="{
                        x: 8,
                        y: 8,
                        text: 'Clasificación:',
                        fontSize: 10,
                        fill: '#fff',
                        fontStyle: 'bold',
                      }"
                    />
                    <v-group v-for="(cat, idx) in seatCategories" :key="cat.label">
                      <v-rect
                        :config="{
                          x: idx < 2 ? 8 : 90,
                          y: 24 + (idx % 2) * 20,
                          width: 80,
                          height: 18,
                          fill: 'transparent',
                          listening: true,
                        }"
                        @click="setSeatCategory(activeSeat, cat.value)"
                      />
                      <v-text
                        :config="{
                          x: idx < 2 ? 8 : 90,
                          y: 24 + (idx % 2) * 20,
                          text: cat.label,
                          fontSize: 10,
                          fill: cat.color,
                          listening: false,
                        }"
                      />
                    </v-group>
                  </v-group>
                </v-layer>
              </v-stage>
            </div>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from "vue"
import VueKonva from "vue-konva"

Vue.use(VueKonva)

const DEFAULT_SETTINGS = {
  SEAT_SIZE: 12,
  SEATS_DISTANCE: 8,
  SUBSECTION_PADDING: 30,
  SECTIONS_MARGIN: 10,
  SECTION_TOP_PADDING: 40,
  SECTION_SIDE_PADDING: 20,
  SECTION_BOTTOM_PADDING: 20,
}

const COLORS = {
  SEAT_SELECTED: "#1976d2",
  SEAT_FREE: "#1b728d",
  SEAT_RESERVED: "lightgrey",
  SECTION_BG: "#222d3b",
  SUBSECTION_BG: "#e0e0e0",
  LABEL_TEXT: "#ff9800",
}

export default {
  middleware: ["authenticated"],

  async asyncData({ params, app, error }) {
    let auditorium = {}
    try {
      auditorium = await app.$repository.Auditorium.show(params.id)
    } catch (e) {
      error(app.$handleError(e))
    }
    return { auditorium }
  },

  data() {
    return {
      auditorium: {},
      activeSeat: null,
      sections: [],
      selectedRow: {},
      settings: { ...DEFAULT_SETTINGS },
      drawer: true,
      zoom: 1,
      stageWidth: 800,
      stageHeight: 600,
      showDebug: true, // Cambiar a false después de depurar
      tooltipBgConfig: {
        width: 170,
        height: 72,
        fill: "#333",
        cornerRadius: 6,
        opacity: 0.95,
      },
      seatCategories: [
        { label: "Servidores", value: "Servidores", color: "#9e9e9e" },
        { label: "Nuevos", value: "Nuevos", color: "#1976d2" },
        { label: "Incapacitados", value: "Incapacitados", color: "#f44336" },
        { label: "Ninguno", value: null, color: "#fff" },
      ],
    }
  },

  computed: {
    seatSpacing() {
      return this.settings.SEAT_SIZE + this.settings.SEATS_DISTANCE
    },

    stageConfig() {
      return {
        width: this.stageWidth,
        height: this.stageHeight,
        draggable: true,
        dragBoundFunc: (pos) => {
          const containerWidth = this.$refs.canvasContainer?.clientWidth || this.stageWidth
          const containerHeight = this.$refs.canvasContainer?.clientHeight || this.stageHeight
          const scaledWidth = this.stageWidth * this.zoom
          const scaledHeight = this.stageHeight * this.zoom

          const maxX = Math.max(0, scaledWidth - containerWidth)
          const maxY = Math.max(0, scaledHeight - containerHeight)

          return {
            x: Math.max(-maxX, Math.min(0, pos.x)),
            y: Math.max(-maxY, Math.min(0, pos.y)),
          }
        },
      }
    },

    tooltipPos() {
      if (!this.activeSeat) return { x: 0, y: 0 }
      try {
        const parts = String(this.activeSeat.id).split("-")
        const sectionIdx = Math.max(0, parseInt(parts[1], 10) - 1)
        const subIdx = Math.max(0, parseInt(parts[2], 10) - 1)
        const section = this.sections[sectionIdx]
        if (!section) return { x: this.activeSeat.x, y: this.activeSeat.y }
        const sectionPos = this.getSectionConfig(sectionIdx)
        const subPos = this.getSubsectionPosition(sectionIdx, subIdx)
        const x = sectionPos.x + subPos.x + this.activeSeat.x + (this.settings.SEAT_SIZE / 2 + 6)
        const y = sectionPos.y + subPos.y + this.activeSeat.y - (this.settings.SEAT_SIZE / 2 + 8)
        return { x, y }
      } catch (err) {
        return { x: this.activeSeat.x, y: this.activeSeat.y }
      }
    },

    totalSeats() {
      let count = 0
      this.sections.forEach((section) => {
        if (!section.isLabel && section.subsections) {
          section.subsections.forEach((sub) => {
            if (!sub.isLabel && sub.seats) {
              sub.seats.forEach((row) => {
                count += row.length
              })
            }
          })
        }
      })
      return count
    },

    configData() {
      const cleaned = JSON.parse(
        JSON.stringify({
          version: "1.0",
          timestamp: new Date().toISOString(),
          settings: this.settings,
          sections: this.sections,
        })
      )

      if (Array.isArray(cleaned.sections)) {
        cleaned.sections.forEach((section) => {
          if (!Array.isArray(section.subsections)) return
          section.subsections.forEach((sub) => {
            if (!Array.isArray(sub.seats)) return
            sub.seats.forEach((row) => {
              if (!Array.isArray(row)) return
              row.forEach((seat) => {
                if (seat && seat.category === "Ninguno") delete seat.category
              })
            })
          })
        })
      }

      return cleaned
    },
  },

  watch: {
    "settings.SEAT_SIZE": "forceUpdate",
    "settings.SEATS_DISTANCE": "forceUpdate",
    sections: {
      handler() {
        this.updateStageSize()
      },
      deep: true,
    },
  },

  mounted() {
    // Configurar navbar
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Editor Auditorio",
      icon: "mdi-seat-outline",
      back: "/auditorium",
    })

    this.loadConfiguration()

    // En móvil, cerrar drawer por defecto
    if (this.$vuetify.breakpoint.smAndDown) {
      this.drawer = false
    }
  },

  methods: {
    updateStageSize() {
      console.log("updateStageSize llamado")

      // Calcular dimensiones basadas en las secciones
      if (this.sections.length === 0) {
        console.log("No hay secciones, usando dimensiones por defecto")
        this.stageWidth = 800
        this.stageHeight = 600
        return
      }

      // Calcular ancho máximo
      let maxWidth = 0
      this.sections.forEach((section, idx) => {
        const sectionWidth = this.getSectionWidth(section)
        console.log(`Sección ${idx} (${section.name}): ancho = ${sectionWidth}`)
        maxWidth = Math.max(maxWidth, sectionWidth)
      })

      // Calcular altura total
      let totalHeight = 60 // Margen superior inicial
      this.sections.forEach((section, idx) => {
        const sectionHeight = this.getSectionHeight(section)
        console.log(`Sección ${idx} (${section.name}): alto = ${sectionHeight}`)
        totalHeight += sectionHeight + this.settings.SECTIONS_MARGIN
      })

      console.log(`Ancho máximo: ${maxWidth}, Altura total: ${totalHeight}`)

      // Ajustar para responsividad
      if (this.$vuetify.breakpoint.smAndDown) {
        this.stageWidth = Math.max(320, maxWidth)
        this.stageHeight = Math.max(400, totalHeight)
      } else {
        this.stageWidth = Math.max(600, maxWidth + 100)
        this.stageHeight = Math.max(500, totalHeight)
      }

      console.log(`Stage final: ${this.stageWidth}x${this.stageHeight}`)

      this.$nextTick(() => {
        if (this.$refs.stage && this.$refs.stage.getNode()) {
          this.$refs.stage.getNode().draw()
        }
      })
    },

    zoomIn() {
      this.zoom = Math.min(2, this.zoom + 0.1)
    },

    zoomOut() {
      this.zoom = Math.max(0.5, this.zoom - 0.1)
    },

    resetZoom() {
      this.zoom = 1
    },

    handleWheel(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        this.zoom = Math.max(0.5, Math.min(2, this.zoom + delta))
      }
    },

    forceUpdate() {
      console.log("forceUpdate llamado")
      this.updateStageSize()
    },

    loadConfiguration() {
      console.log("loadConfiguration llamado")

      if (!this.auditorium?.config) {
        console.warn("No se encontró configuración para cargar, creando ejemplo")
        // Crear configuración de ejemplo
        this.createSampleSections()
        return
      }

      let config = this.auditorium.config
      if (typeof config === "string") {
        try {
          config = JSON.parse(config)
        } catch (e) {
          console.error("Error parsing config:", e)
          this.createSampleSections()
          return
        }
      }

      if (config.settings && config.sections) {
        Object.assign(this.settings, DEFAULT_SETTINGS, config.settings)
        const cleanSections = JSON.parse(JSON.stringify(config.sections))
        cleanSections.forEach((section, sIdx) => {
          section.id = `${sIdx + 1}`
          section.subsections?.forEach((sub, subIdx) => {
            sub.id = `${subIdx + 1}`
            sub.seats?.forEach((row, rowIdx) => {
              row.forEach((seat, colIdx) => {
                if ("state" in seat) delete seat.state
                seat.id = `${section.id}-${subIdx + 1}-${rowIdx + 1}-${colIdx + 1}`
              })
            })
          })
        })
        this.sections = cleanSections
        console.log(`Cargadas ${this.sections.length} secciones`)
        this.forceUpdate()
      } else {
        this.createSampleSections()
      }
    },

    createSampleSections() {
      console.log("Creando secciones de ejemplo")

      // Crear dos secciones como en la imagen
      this.addSection(false)
      this.addSection(false)

      if (this.sections[0]) {
        this.sections[0].name = "Sección 1"
        // Agregar 3 subsections
        this.addSubsection(0, false)
        this.addSubsection(0, false)
        this.addSubsection(0, false)

        // Configurar nombres y asientos
        if (this.sections[0].subsections[0]) {
          this.sections[0].subsections[0].name = "Subsección 1"
          this.setSubsectionGrid(0, 0)
        }
        if (this.sections[0].subsections[1]) {
          this.sections[0].subsections[1].name = "Subsección 2"
          this.setSubsectionGrid(0, 1)
        }
        if (this.sections[0].subsections[2]) {
          this.sections[0].subsections[2].name = "Subsección 3"
          this.setSubsectionGrid(0, 2)
        }
      }

      if (this.sections[1]) {
        this.sections[1].name = "Sección 2"
        this.addSubsection(1, false)

        if (this.sections[1].subsections[0]) {
          this.sections[1].subsections[0].name = "Subsección 1"
          this.setSubsectionGrid(1, 0)
        }
      }

      console.log("Secciones de ejemplo creadas:", this.sections)
      this.forceUpdate()
    },

    async saveAuditorium() {
      try {
        this.auditorium.config = this.configData
        await this.$repository.Auditorium.update(this.auditorium.id, {
          ...this.auditorium,
          name: this.auditorium.name,
          org_id: this.auditorium.org_id?.id ?? this.auditorium.org_id,
          config: JSON.stringify(this.configData),
        })
        this.$toast?.success("Auditorio guardado")
      } catch (e) {
        this.$handleError(e)
        this.$toast?.error("Error al guardar")
      }
    },

    addSection(isLabel) {
      const sectionIdx = this.sections.length
      const sectionId = `section-${sectionIdx + 1}`
      const section = {
        id: sectionId,
        name: `${isLabel ? "Etiqueta" : "Sección"} ${sectionIdx + 1}`,
        isLabel,
        subsections: [],
      }
      if (!isLabel) {
        section.subsections.push(this.createSubsection("Subsección 1", false, 4, 4, sectionIdx, 0, sectionId))
      }
      this.sections.push(section)
      console.log(`Sección agregada: ${section.name}`)
      this.forceUpdate()
    },

    removeSection(sIdx) {
      this.sections.splice(sIdx, 1)
      this.forceUpdate()
    },

    addSubsection(sIdx, isLabel) {
      const section = this.sections[sIdx]
      const subIdx = section.subsections.length
      const name = `${isLabel ? "Área" : "Subsección"} ${subIdx + 1}`
      section.subsections.push(this.createSubsection(name, isLabel, 3, 5, sIdx, subIdx, section.id))
      console.log(`Subsección agregada a sección ${sIdx}: ${name}`)
      this.forceUpdate()
    },

    removeSubsection(sIdx, subIdx) {
      this.sections[sIdx].subsections.splice(subIdx, 1)
      this.forceUpdate()
    },

    createSubsection(name, isLabel, rows = 3, cols = 5, sectionIdx = "", subIdx = "", sectionId = "") {
      const subId = `sub-${sectionId}-${subIdx + 1}`
      const sub = { id: subId, name, isLabel, seats: [] }
      if (isLabel) {
        sub.width = 100
      } else {
        sub.seats = this.createSeatsGrid(rows, cols, sectionIdx, subIdx, sectionId)
        sub.tempRows = rows
        sub.tempCols = cols
      }
      console.log(`Subsección creada: ${name} (${rows}x${cols})`)
      return sub
    },

    setSubsectionGrid(sIdx, subIdx) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      const rows = Math.max(1, Math.min(20, parseInt(sub.tempRows) || 3))
      const cols = Math.max(1, Math.min(30, parseInt(sub.tempCols) || 5))
      console.log(`Configurando grid para ${sub.name}: ${rows}x${cols}`)
      sub.seats = this.createSeatsGrid(rows, cols, sIdx, subIdx, section.id)
      this.forceUpdate()
    },

    getRowOptions(sub) {
      if (!sub.seats || sub.seats.length === 0) return []
      return sub.seats.map((_, idx) => ({
        text: `Fila ${idx + 1}`,
        value: idx,
      }))
    },

    getMaxColumns(sub) {
      if (!sub.seats || sub.seats.length === 0) return 0
      return Math.max(...sub.seats.map((row) => (row ? row.length : 0)))
    },

    isRowSelected(sIdx, subIdx) {
      const key = `${sIdx}-${subIdx}`
      return this.selectedRow[key] !== undefined && this.selectedRow[key] !== null
    },

    addSeatToRow(sIdx, subIdx, side) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      const selectedRowIdx = this.selectedRow[`${sIdx}-${subIdx}`]
      if (!this.isRowSelected(sIdx, subIdx)) return
      const selectedRow = sub.seats[selectedRowIdx]
      if (side === "left") {
        selectedRow.unshift(this.createSeat(0, selectedRowIdx, sIdx, subIdx, section.id))
      } else {
        selectedRow.push(this.createSeat(selectedRow.length, selectedRowIdx, sIdx, subIdx, section.id))
      }
      this.forceUpdate()
    },

    createSeatsGrid(rows, cols, sectionIdx, subIdx, sectionId = "") {
      console.log(`Creando grid ${rows}x${cols}`)
      const grid = []
      for (let r = 0; r < rows; r++) {
        const row = []
        for (let c = 0; c < cols; c++) {
          row.push(this.createSeat(c, r, sectionIdx, subIdx, sectionId))
        }
        grid.push(row)
      }
      console.log(`Grid creado con ${grid.length} filas y ${grid[0]?.length || 0} columnas`)
      return grid
    },

    createSeat(col, row, sectionIdx = "", subIdx = "", sectionId = "") {
      const seat = {
        id: `${sectionId}-${subIdx + 1}-${row + 1}-${col + 1}`,
        row,
        col,
        state: "free",
      }
      console.log(`Asiento creado: ${seat.id}`)
      return seat
    },

    handleSeatClick(seat, e) {
      if (seat.state !== "reserved") {
        seat.state = seat.state === "selected" ? "free" : "selected"
      }
      this.activeSeat = seat
      this.forceUpdate()
    },

    setSeatCategory(seat, category) {
      const original = this.findSeatById(seat.id)
      const value = category == null ? "Ninguno" : category
      if (original) {
        original.category = value
      } else {
        seat.category = value
      }
      this.activeSeat = null
      this.forceUpdate()
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
      let node = e.target
      while (node) {
        const cls = node.getClassName && node.getClassName()
        if (cls === "Circle") return
        if (cls === "Stage") break
        node = node.getParent()
      }
      this.activeSeat = null
      this.forceUpdate()
    },

    handleSeatHover(e) {
      const container = e.target.getStage().container()
      container.style.cursor = e.target.attrs.opacity < 1 ? "not-allowed" : "pointer"
    },

    handleSeatLeave(e) {
      e.target.getStage().container().style.cursor = "default"
    },

    // Métodos de Konva actualizados
    getSectionConfig(sIdx) {
      const section = this.sections[sIdx]
      let y = 60
      for (let i = 0; i < sIdx; i++) {
        y += this.getSectionHeight(this.sections[i]) + this.settings.SECTIONS_MARGIN
      }

      const sectionWidth = this.getSectionWidth(section)
      const x = (this.stageWidth - sectionWidth) / 2

      console.log(`Posición sección ${sIdx}: x=${x}, y=${y}, ancho=${sectionWidth}`)
      return { x, y }
    },

    getSectionWidth(section) {
      if (section.isLabel) return 0
      if (!section.subsections || section.subsections.length === 0) return 200

      let totalWidth = this.settings.SECTION_SIDE_PADDING * 2
      // Determine section index for calls that require it
      const sIdx = this.sections.indexOf(section)
      section.subsections.forEach((sub, idx) => {
        if (idx > 0) totalWidth += this.settings.SUBSECTION_PADDING
        totalWidth += sub.isLabel ? sub.width || 100 : this.getSubsectionWidth(sIdx, sub)
      })

      return Math.max(200, totalWidth)
    },

    getSubsectionWidth(sIdx, sub) {
      if (sub.isLabel) return sub.width || 100
      if (!sub.seats || sub.seats.length === 0) return 100

      const maxCols = this.getMaxColumns(sub)
      const width = maxCols * this.seatSpacing - this.settings.SEATS_DISTANCE
      console.log(`Subsección ancho: ${maxCols} columnas * ${this.seatSpacing} - ${this.settings.SEATS_DISTANCE} = ${width}`)
      return width
    },

    getSectionHeight(section) {
      if (section.isLabel) return 30
      if (!section.subsections || section.subsections.length === 0) {
        return this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING + 40
      }

      let maxRows = 0
      section.subsections.forEach((sub) => {
        if (!sub.isLabel && sub.seats) {
          maxRows = Math.max(maxRows, sub.seats.length)
        }
      })

      if (maxRows === 0) {
        return this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING + 40
      }

      const height = maxRows * this.seatSpacing - this.settings.SEATS_DISTANCE + this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING
      console.log(`Sección alto: ${maxRows} filas * ${this.seatSpacing} = ${height}`)
      return height
    },

    getSubsectionPosition(sIdx, subIdx) {
      const section = this.sections[sIdx]
      let x = this.settings.SECTION_SIDE_PADDING
      for (let i = 0; i < subIdx; i++) {
        const sub = section.subsections[i]
        x += (sub.isLabel ? sub.width || 100 : this.getSubsectionWidth(sIdx, sub)) + this.settings.SUBSECTION_PADDING
      }

      const y = this.settings.SECTION_TOP_PADDING
      console.log(`Posición subsección ${sIdx}-${subIdx}: x=${x}, y=${y}`)
      return { x, y }
    },

    getSectionBgConfig(sIdx) {
      const section = this.sections[sIdx]
      const width = this.getSectionWidth(section)
      const height = this.getSectionHeight(section)

      return {
        width,
        height,
        fill: COLORS.SECTION_BG,
        stroke: "lightgrey",
        strokeWidth: 1,
        cornerRadius: 5,
      }
    },

    getSectionTitleConfig(sIdx) {
      const section = this.sections[sIdx]
      const width = this.getSectionWidth(section)

      return {
        x: width / 2,
        y: section.isLabel ? 15 : this.settings.SECTION_TOP_PADDING / 2,
        text: section.name,
        fontSize: section.isLabel ? 16 : 14,
        fill: section.isLabel ? "#1976d2" : "#fff",
        fontStyle: "bold",
        align: "center",
        width,
        verticalAlign: "middle",
      }
    },

    getSubsectionRectConfig(sIdx, subIdx) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      const width = this.getSubsectionWidth(sIdx, sub)
      const height = this.getSubsectionHeight(sIdx, subIdx)

      return {
        width,
        height,
        fill: COLORS.SUBSECTION_BG,
        stroke: "green",
        strokeWidth: 2,
      }
    },

    getSubsectionHeight(sIdx, subIdx) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      if (sub.isLabel) return 0
      if (!sub.seats || sub.seats.length === 0) return 40

      const height = sub.seats.length * this.seatSpacing - this.settings.SEATS_DISTANCE
      console.log(`Subsección ${sIdx}-${subIdx} alto: ${sub.seats.length} filas * ${this.seatSpacing} = ${height}`)
      return height
    },

    getSubsectionTitleConfig(sIdx, subIdx) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      const width = this.getSubsectionWidth(sIdx, sub)

      return {
        x: 0,
        y: -15,
        text: sub.name,
        fontSize: 11,
        fill: "#333",
        align: "left",
        width,
      }
    },

    getRowLabelConfig(sIdx, subIdx, rowIdx) {
      const y = rowIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2

      return {
        x: -15,
        y,
        text: (rowIdx + 1).toString(),
        fontSize: 9,
        fill: "#333",
        align: "right",
        verticalAlign: "middle",
      }
    },

    getColLabelConfig(sIdx, subIdx, colIdx) {
      const x = colIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2
      const height = this.getSubsectionHeight(sIdx, subIdx)

      return {
        x,
        y: height + 5,
        text: String.fromCharCode(65 + colIdx),
        fontSize: 9,
        fill: "#333",
        align: "center",
      }
    },

    getSeatConfig(seat) {
      const isReserved = seat.state === "reserved"
      const isSelected = seat.state === "selected"
      const category = seat.category ? String(seat.category).toLowerCase() : null
      const classStrokeMap = {
        servidores: "#9e9e9e",
        nuevos: COLORS.SEAT_SELECTED,
        incapacitados: "#f44336",
        discapacitados: "#f44336",
      }

      let stroke = isSelected ? COLORS.SEAT_SELECTED : "#757575"
      let strokeWidth = 1

      if (category && classStrokeMap[category]) {
        stroke = classStrokeMap[category]
        strokeWidth = 3
      }

      return {
        radius: this.settings.SEAT_SIZE / 2,
        fill: isSelected ? COLORS.SEAT_SELECTED : isReserved ? COLORS.SEAT_RESERVED : COLORS.SEAT_FREE,
        stroke,
        strokeWidth,
        opacity: isReserved ? 0.6 : 1,
      }
    },

    getSubsectionLabelBgConfig(sIdx, subIdx) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      const width = sub.width || 100
      const height = this.getSectionHeight(section) - this.settings.SECTION_TOP_PADDING - this.settings.SECTION_BOTTOM_PADDING

      return {
        width,
        height,
        fill: "#424242",
        opacity: 0.3,
        stroke: COLORS.LABEL_TEXT,
        strokeWidth: 2,
        strokeDashArray: [5, 5],
      }
    },

    getSubsectionLabelTextConfig(sIdx, subIdx) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      const width = sub.width || 100
      const height = this.getSectionHeight(section) - this.settings.SECTION_TOP_PADDING - this.settings.SECTION_BOTTOM_PADDING

      return {
        x: width / 2,
        y: height / 2,
        text: sub.name,
        fontSize: 12,
        fill: COLORS.LABEL_TEXT,
        fontStyle: "bold",
        align: "center",
        verticalAlign: "middle",
      }
    },

    exportConfiguration() {
      const cleaned = JSON.parse(JSON.stringify(this.configData))
      const jsonStr = JSON.stringify(cleaned, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `auditorio-config-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },

    importConfiguration(event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result)
          if (!config.sections || !config.settings) {
            alert("Archivo JSON inválido")
            return
          }
          this.auditorium.config = config
          Object.assign(this.settings, DEFAULT_SETTINGS, config.settings)
          const cleanSections = JSON.parse(JSON.stringify(config.sections))
          cleanSections.forEach((section, sIdx) => {
            section.id = `${sIdx + 1}`
            section.subsections?.forEach((sub, subIdx) => {
              sub.id = `${section.id}-${subIdx + 1}`
              sub.seats?.forEach((row, rowIdx) => {
                row.forEach((seat, colIdx) => {
                  if ("state" in seat) delete seat.state
                  seat.id = `${section.id}-${subIdx + 1}-${rowIdx + 1}-${colIdx + 1}`
                })
              })
            })
          })
          this.sections = cleanSections
          event.target.value = ""
          this.forceUpdate()
          this.$toast?.success("Configuración importada")
        } catch (error) {
          this.$toast?.error("Error al importar")
        }
      }
      reader.readAsText(file)
    },
  },
}
</script>

<style scoped>
/* Estilos igual que antes... */
.editor-wrapper {
  height: 100vh;
  overflow: hidden;
  background: #f5f5f5;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.mobile-title {
  font-size: 14px;
  font-weight: 500;
  color: #1976d2;
  flex: 1;
  margin-left: 12px;
}

.main-row {
  height: calc(100vh - 56px);
  overflow: hidden;
}

.sidebar-col {
  height: 100%;
  overflow: hidden;
}

.control-sidebar {
  height: 100% !important;
  border-right: 1px solid #e0e0e0;
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fafafa;
}

.desktop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.auditorium-name {
  font-size: 14px;
  font-weight: 500;
  color: #1976d2;
}

.save-btn {
  min-width: 90px;
}

.sections-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px 8px 8px;
}

.canvas-col {
  height: 100%;
  overflow: hidden;
}

.canvas-sheet {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.debug-header {
  background: rgba(255, 0, 0, 0.1);
  border: 1px dashed red;
  font-size: 11px;
  font-family: monospace;
}

.debug-info {
  background: rgba(0, 0, 255, 0.1);
  padding: 4px;
  border-radius: 4px;
  font-size: 10px;
  font-family: monospace;
}

.mobile-zoom-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.zoom-text {
  font-size: 12px;
  min-width: 50px;
  text-align: center;
}

.canvas-scroll-container {
  flex: 1;
  overflow: auto;
  position: relative;
  background: #f8f9fa;
  border-radius: 4px;
}

.canvas-transform-wrapper {
  min-width: 100%;
  min-height: 100%;
  transition: transform 0.2s ease;
}

@media (max-width: 959px) {
  .sidebar-col {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    max-width: 360px;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .sidebar-col .v-navigation-drawer--active {
    transform: translateX(0);
  }

  .canvas-col {
    width: 100%;
  }
}

@media (min-width: 960px) {
  .mobile-header {
    display: none;
  }

  .sections-scroll-container {
    padding-right: 12px;
  }
}

.sections-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.sections-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sections-scroll-container::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 3px;
}

.canvas-scroll-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.canvas-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.canvas-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

@media (hover: none) and (pointer: coarse) {
  .v-btn {
    min-height: 36px;
  }

  .v-text-field input {
    font-size: 14px;
  }

  .canvas-scroll-container {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
