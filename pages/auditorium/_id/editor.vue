<template>
  <v-container fluid>
    <span v-if="auditorium && auditorium.name">Auditorio: {{ auditorium.name }}</span>
    <v-row>
      <!-- Panel de Control -->
      <v-col cols="12" md="3">
        <v-btn color="primary" class="mb-4" @click="saveAuditorium">
          <v-icon left>mdi-content-save</v-icon>
          Guardar
        </v-btn>
        <v-btn color="primary" block class="mb-2" @click="addSection(false)">
          <v-icon left>mdi-plus</v-icon>
          Agregar sección
        </v-btn>

        <v-btn color="secondary" block class="mb-2" @click="addSection(true)">
          <v-icon left>mdi-label</v-icon>
          Agregar etiqueta sección
        </v-btn>

        <!-- Botones de Importar/Exportar -->
        <v-card outlined class="mb-4 pa-2">
          <div class="text-caption mb-2 font-weight-bold">Configuración</div>
          <v-btn x-small color="success" block class="mb-2" @click="exportConfiguration">
            <v-icon left x-small>mdi-download</v-icon>
            Exportar JSON
          </v-btn>
          <v-btn x-small color="info" block @click="$refs.fileInput.click()">
            <v-icon left x-small>mdi-upload</v-icon>
            Importar JSON
          </v-btn>
          <input ref="fileInput" type="file" accept=".json" style="display: none" @change="importConfiguration" />
        </v-card>

        <v-slider v-model="settings.SEAT_SIZE" :min="5" :max="40" :step="1" label="Tamaño de asiento" thumb-label class="mb-2" />

        <v-slider v-model="settings.SEATS_DISTANCE" :min="0" :max="60" :step="1" label="Distancia entre asientos" thumb-label class="mb-4" />

        <!-- Lista de Secciones -->
        <v-expansion-panels accordion>
          <v-expansion-panel v-for="(section, sIdx) in sections" :key="`section-${sIdx}`">
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-text-field v-model="section.name" dense solo hide-details style="max-width: 140px" @click.stop />
                <v-chip v-if="section.isLabel" x-small color="secondary" class="ml-2">Etiqueta</v-chip>
                <v-spacer />
                <v-btn icon small color="error" @click.stop="removeSection(sIdx)">
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-expansion-panel-header>

            <v-expansion-panel-content v-if="!section.isLabel">
              <v-btn small block color="secondary" class="mb-2" @click="addSubsection(sIdx, false)">
                <v-icon left small>mdi-plus</v-icon>
                Agregar subsección
              </v-btn>

              <v-btn small block color="accent" class="mb-2" @click="addSubsection(sIdx, true)">
                <v-icon left small>mdi-label-outline</v-icon>
                Agregar área
              </v-btn>

              <!-- Subsecciones -->
              <v-card v-for="(sub, subIdx) in section.subsections" :key="`sub-${subIdx}`" outlined class="mb-2 pa-2">
                <div class="d-flex align-center mb-2">
                  <v-text-field v-model="sub.name" :label="sub.isLabel ? 'Nombre área' : 'Nombre subsección'" dense hide-details />
                  <v-chip v-if="sub.isLabel" x-small color="accent" class="ml-2">Área</v-chip>
                </div>

                <!-- Ancho de área (solo para etiquetas) -->
                <v-slider v-if="sub.isLabel" v-model="sub.width" :min="50" :max="300" :step="10" label="Ancho del área" thumb-label dense hide-details class="mb-2" />

                <template v-if="!sub.isLabel">
                  <!-- Definir filas y columnas -->
                  <v-row dense class="mb-2">
                    <v-col cols="3">
                      <v-text-field v-model.number="sub.tempRows" label="Filas" type="text" dense hide-details />
                    </v-col>
                    <v-col cols="3">
                      <v-text-field v-model.number="sub.tempCols" label="Columnas" type="text" dense hide-details />
                    </v-col>
                    <v-col cols="2">
                      <v-btn small color="primary" @click="setSubsectionGrid(sIdx, subIdx)">Set</v-btn>
                    </v-col>
                  </v-row>

                  <!-- Agregar asiento individual por fila -->
                  <v-divider class="my-2" />
                  <div class="text-caption mb-1">Agregar asiento individual:</div>
                  <v-row dense>
                    <v-col cols="6">
                      <v-select v-model="selectedRow[`${sIdx}-${subIdx}`]" :items="getRowOptions(sub)" label="Seleccionar fila" dense hide-details />
                    </v-col>
                    <v-col cols="6" class="d-flex gap-1">
                      <v-btn x-small color="primary" :disabled="!isRowSelected(sIdx, subIdx)" @click="addSeatToRow(sIdx, subIdx, 'left')">
                        <v-icon x-small>mdi-arrow-left-circle</v-icon>
                        Izq
                      </v-btn>
                      <v-btn x-small color="primary" :disabled="!isRowSelected(sIdx, subIdx)" @click="addSeatToRow(sIdx, subIdx, 'right')">
                        <v-icon x-small>mdi-arrow-right-circle</v-icon>
                        Der
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-divider class="my-2" />
                </template>

                <div class="d-flex gap-2">
                  <v-spacer />
                  <v-btn icon x-small color="error" @click="removeSubsection(sIdx, subIdx)">
                    <v-icon x-small>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <!-- Canvas de Asientos -->
      <v-col cols="12" md="9">
        <v-sheet elevation="2" class="pa-2" style="background: #f5f5f5; min-height: 500px">
          <v-stage :config="stageConfig">
            <v-layer>
              <v-group v-for="(section, sIdx) in sections" :key="`section-${sIdx}`" :config="getSectionConfig(sIdx)">
                <!-- Fondo de sección (solo si NO es etiqueta) -->
                <v-rect v-if="!section.isLabel" :config="getSectionBgConfig(section)" />

                <!-- Título de sección -->
                <v-text :config="getSectionTitleConfig(section)" />

                <!-- Subsecciones (solo si NO es etiqueta de sección) -->
                <template v-if="!section.isLabel">
                  <v-group v-for="(sub, subIdx) in section.subsections" :key="`sub-${sIdx}-${subIdx}`" :config="getSubsectionPosition(section, subIdx)">
                    <!-- Si la subsección es una etiqueta/área -->
                    <template v-if="sub.isLabel">
                      <v-rect :config="getSubsectionLabelBgConfig(sub, section)" />
                      <v-text :config="getSubsectionLabelTextConfig(sub, section)" />
                    </template>

                    <!-- Si la subsección tiene asientos -->
                    <template v-else>
                      <!-- Etiquetas del eje Y (números de fila) -->
                      <v-text v-for="rowIdx in sub.seats.length" :key="`row-label-${rowIdx}`" :config="getRowLabelConfig(rowIdx - 1)" />

                      <!-- Etiquetas del eje X (letras de columna) -->
                      <v-text v-for="colIdx in getMaxColumns(sub)" :key="`col-label-${colIdx}`" :config="getColLabelConfig(colIdx - 1, sub)" />

                      <!-- Fondo de subsección -->
                      <v-rect :config="getSubsectionRectConfig(sub)" />

                      <!-- Título de subsección -->
                      <v-text :config="getSubsectionTitleConfig(sub)" />

                      <!-- Asientos -->
                      <v-circle v-for="seat in getSubsectionSeats(sub)" :key="seat.id" :config="getSeatConfig(seat)" @mouseenter="handleSeatHover" @mouseleave="handleSeatLeave" @click="handleSeatClick(seat)" />
                    </template>
                  </v-group>
                </template>
              </v-group>
            </v-layer>
          </v-stage>
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
  SEAT_SIZE: 10,
  SEATS_DISTANCE: 15,
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
      stageConfig: { width: 900, height: 700 },
      sections: [],
      selectedRow: {},
      settings: { ...DEFAULT_SETTINGS },
    }
  },

  computed: {
    seatSpacing() {
      return this.settings.SEAT_SIZE + this.settings.SEATS_DISTANCE
    },
    configData() {
      return {
        version: "1.0",
        timestamp: new Date().toISOString(),
        settings: this.settings,
        sections: this.sections,
      }
    },
  },

  watch: {
    "settings.SEAT_SIZE": "forceUpdate",
    "settings.SEATS_DISTANCE": "forceUpdate",
  },

  mounted() {
    // Configurar navbar directamente sin mixin
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Editor Auditorio",
      icon: "mdi-seat-outline",
      back: "/auditorium",
    })
    this.loadConfiguration()
  },

  methods: {
    forceUpdate() {
      this.$forceUpdate()
    },

    loadConfiguration() {
      if (!this.auditorium?.config) {
        console.warn("No se encontró configuración para cargar")
        return
      }

      let config = this.auditorium.config
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

    async saveAuditorium() {
      try {
        this.auditorium.config = this.configData
        const payload = {
          ...this.auditorium,
          name: this.auditorium.name,
          org_id: this.auditorium.org_id?.id ?? this.auditorium.org_id,
          config: JSON.stringify(this.configData),
        }
        await this.$repository.Auditorium.update(this.auditorium.id, payload)
        this.$toast?.success("Auditorio guardado")
      } catch (e) {
        this.$handleError(e)
        this.$toast?.error("Error al guardar")
      }
    },

    // ============ OPERACIONES DE SECCIÓN ============
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
    },

    removeSection(sIdx) {
      this.sections.splice(sIdx, 1)
    },

    addSubsection(sIdx, isLabel) {
      const section = this.sections[sIdx]
      const subIdx = section.subsections.length
      const name = `${isLabel ? "Área" : "Subsección"} ${subIdx + 1}`
      section.subsections.push(this.createSubsection(name, isLabel, 3, 5, sIdx, subIdx, section.id))
    },

    removeSubsection(sIdx, subIdx) {
      this.sections[sIdx].subsections.splice(subIdx, 1)
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
      return sub
    },

    setSubsectionGrid(sIdx, subIdx) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      const rows = Math.max(1, Math.min(20, parseInt(sub.tempRows) || 3))
      const cols = Math.max(1, Math.min(30, parseInt(sub.tempCols) || 5))
      sub.seats = this.createSeatsGrid(rows, cols, sIdx, subIdx, section.id)
      this.$forceUpdate()
    },

    getRowOptions(sub) {
      return sub.seats.map((_, idx) => ({
        text: `Fila ${idx + 1}`,
        value: idx,
      }))
    },

    getMaxColumns(sub) {
      return sub.seats?.length ? Math.max(...sub.seats.map((row) => row.length)) : 0
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
      this.$forceUpdate()
    },

    // ============ CREACIÓN DE ASIENTOS ============
    createSeatsGrid(rows, cols, sectionIdx, subIdx, sectionId = "") {
      return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => this.createSeat(c, r, sectionIdx, subIdx, sectionId)))
    },

    createSeat(col, row, sectionIdx = "", subIdx = "", sectionId = "") {
      // sectionId: 'section-1', subIdx: 0, row: 0, col: 0 => 'section-1-1-1-1'
      return {
        id: `${sectionId}-${subIdx + 1}-${row + 1}-${col + 1}`,
        row,
        col,
      }
    },

    // ============ MANEJO DE EVENTOS ============
    handleSeatClick(seat) {
      if (seat.state !== "reserved") {
        seat.state = seat.state === "selected" ? "free" : "selected"
      }
    },

    handleSeatHover(e) {
      const container = e.target.getStage().container()
      container.style.cursor = e.target.attrs.opacity < 1 ? "not-allowed" : "pointer"
    },

    handleSeatLeave(e) {
      e.target.getStage().container().style.cursor = "default"
    },

    // ============ CONFIGURACIONES DE KONVA ============
    getSectionConfig(sIdx) {
      const section = this.sections[sIdx]
      const y = this.sections.slice(0, sIdx).reduce((acc, s) => acc + this.getSectionHeight(s) + this.settings.SECTIONS_MARGIN, 60)

      return {
        x: (this.stageConfig.width - this.getSectionWidth(section)) / 2,
        y,
      }
    },

    getSectionBgConfig(section) {
      return {
        width: this.getSectionWidth(section),
        height: this.getSectionHeight(section),
        fill: COLORS.SECTION_BG,
        strokeWidth: 1,
        stroke: "lightgrey",
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
        fontFamily: "Arial",
        align: "center",
        offsetX: width / 2 - 5,
        offsetY: 7,
      }
    },

    getRowLabelConfig(rowIdx) {
      return {
        x: -15,
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

    getColLabelConfig(colIdx, sub) {
      return {
        x: colIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
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

      return {
        x: seat.x,
        y: seat.y,
        radius: this.settings.SEAT_SIZE / 2,
        fill: isSelected ? COLORS.SEAT_SELECTED : isReserved ? COLORS.SEAT_RESERVED : COLORS.SEAT_FREE,
        stroke: isSelected ? COLORS.SEAT_SELECTED : "#757575",
        strokeWidth: 1,
        opacity: isReserved ? 0.6 : 1,
      }
    },

    // ============ CÁLCULOS DE DIMENSIONES ============
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

    // ============ IMPORTAR/EXPORTAR ============
    exportConfiguration() {
      const jsonStr = JSON.stringify(this.configData, null, 2)
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
            alert("Archivo JSON inválido: falta estructura requerida")
            return
          }

          this.auditorium.config = config
          Object.assign(this.settings, DEFAULT_SETTINGS, config.settings)
          // Reasignar IDs consecutivos al importar
          const cleanSections = JSON.parse(JSON.stringify(config.sections))
          cleanSections.forEach((section, sIdx) => {
            section.id = `${sIdx + 1}`
            section.subsections?.forEach((sub, subIdx) => {
              sub.id = `${section.id}-${subIdx + 1}`
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
          event.target.value = ""
          this.$forceUpdate()
          alert("Configuración importada correctamente")
        } catch (error) {
          alert("Error al importar: " + error.message)
        }
      }
      reader.readAsText(file)
    },
  },
}
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
</style>
