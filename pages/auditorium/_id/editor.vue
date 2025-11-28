<template>
  <v-container fluid>
    Auditorio: {{ auditorium.name }}
    <v-row>
      <!-- Panel de Control -->

      <v-col cols="12" md="3">
        <v-btn color="primary" class="mb-4" @click="saveAuditorium">
          <v-icon left>mdi-content-save</v-icon>
          Guardar
        </v-btn>
        <v-btn color="primary" block class="mb-2" @click="addSection">
          <v-icon left>mdi-plus</v-icon>
          Agregar sección
        </v-btn>

        <v-btn color="secondary" block class="mb-2" @click="addLabelSection">
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

        <v-slider v-model="SEAT_SIZE" :min="5" :max="40" :step="1" label="Tamaño de asiento" thumb-label class="mb-2" />

        <v-slider v-model="SEATS_DISTANCE" :min="0" :max="60" :step="1" label="Distancia entre asientos" thumb-label class="mb-4" />

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
              <v-btn small block color="secondary" class="mb-2" @click="addSubsection(sIdx)">
                <v-icon left small>mdi-plus</v-icon>
                Agregar subsección
              </v-btn>

              <v-btn small block color="accent" class="mb-2" @click="addSubsectionLabel(sIdx)">
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
                    <v-col cols="5">
                      <v-text-field v-model.number="sub.tempRows" label="Filas" type="number" :min="1" :max="20" dense hide-details />
                    </v-col>
                    <v-col cols="5">
                      <v-text-field v-model.number="sub.tempCols" label="Columnas" type="number" :min="1" :max="30" dense hide-details />
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
                      <v-btn x-small color="primary" :disabled="selectedRow[`${sIdx}-${subIdx}`] === undefined || selectedRow[`${sIdx}-${subIdx}`] === null" @click="addSeatToRow(sIdx, subIdx, 'left')">
                        <v-icon x-small>mdi-arrow-left-circle</v-icon>
                        Izq
                      </v-btn>
                      <v-btn x-small color="primary" :disabled="selectedRow[`${sIdx}-${subIdx}`] === undefined || selectedRow[`${sIdx}-${subIdx}`] === null" @click="addSeatToRow(sIdx, subIdx, 'right')">
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
              <v-group v-for="(section, sIdx) in sections" :key="`section-${sIdx}`" :config="getSectionConfig(section, sIdx)">
                <!-- Fondo de sección (solo si NO es etiqueta) -->
                <v-rect
                  v-if="!section.isLabel"
                  :config="{
                    width: getSectionWidth(section),
                    height: getSectionHeight(section),
                    fill: '#222d3b',
                    strokeWidth: 1,
                    stroke: 'lightgrey',
                    cornerRadius: 5,
                  }"
                />

                <!-- Título de sección -->
                <v-text :config="getSectionTitleConfig(section)" />

                <!-- Subsecciones (solo si NO es etiqueta de sección) -->
                <template v-if="!section.isLabel">
                  <v-group v-for="(sub, subIdx) in section.subsections" :key="`sub-${sIdx}-${subIdx}`" :config="getSubsectionPosition(section, subIdx)">
                    <!-- Si la subsección es una etiqueta/área -->
                    <template v-if="sub.isLabel">
                      <v-rect
                        :config="{
                          width: sub.width || 100,
                          height: getSectionHeight(section) - SECTION_TOP_PADDING - SECTION_BOTTOM_PADDING,
                          fill: '#424242',
                          opacity: 0.3,
                          strokeWidth: 2,
                          stroke: '#ff9800',
                          strokeDashArray: [5, 5],
                        }"
                      />
                      <v-text :config="getSubsectionLabelConfig(sub, section)" />
                    </template>

                    <!-- Si la subsección tiene asientos -->
                    <template v-else>
                      <!-- Etiquetas del eje Y (números de fila) -->
                      <v-text
                        v-for="(row, rowIdx) in sub.seats"
                        :key="`row-label-${rowIdx}`"
                        :config="{
                          x: -15,
                          y: rowIdx * seatSpacing + SEAT_SIZE / 2,
                          text: (rowIdx + 1).toString(),
                          fontSize: 8,
                          fill: 'yellow',
                          fontFamily: 'Arial',
                          align: 'right',
                          verticalAlign: 'middle',
                          offsetY: 3,
                        }"
                      />

                      <!-- Etiquetas del eje X (letras de columna) -->
                      <v-text
                        v-for="colIdx in getMaxColumns(sub)"
                        :key="`col-label-${colIdx}`"
                        :config="{
                          x: (colIdx - 1) * seatSpacing + SEAT_SIZE / 2,
                          y: getSubsectionHeight(sub) + 5,
                          text: String.fromCharCode(64 + colIdx),
                          fontSize: 8,
                          fill: 'yellow',
                          fontFamily: 'Arial',
                          align: 'center',
                          offsetX: 3,
                        }"
                      />

                      <!-- Fondo de subsección -->
                      <v-rect :config="getSubsectionRectConfig(sub)" />

                      <!-- Título de subsección -->
                      <v-text :config="getSubsectionTitleConfig(sub)" />

                      <!-- Asientos -->
                      <v-circle
                        v-for="seat in getSubsectionSeats(sub)"
                        :key="seat.id"
                        :config="getSeatConfig(seat)"
                        @mouseenter="handleSeatHover"
                        @mouseleave="handleSeatLeave"
                        @click="handleSeatClick(seat, sIdx, subIdx)"
                      />
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
// (Eliminado export default duplicado. El export default correcto está más abajo en el archivo)
import Vue from "vue"
import VueKonva from "vue-konva"
Vue.use(VueKonva)

export default {
  middleware: ["authenticated"],
  async asyncData({ params, app }) {
    let auditorium = {}
    try {
      auditorium = (await app.$repository.Auditorium?.show?.(params.id)) || {}
    } catch (e) {}
    return { auditorium }
  },

  data() {
    return {
      stageConfig: { width: 900, height: 700 },
      sections: [],
      selectedRow: {},
      SEAT_SELECTED_COLOR: "#1976d2",
      SEAT_SIZE: 10,
      SEATS_DISTANCE: 15,
      SUBSECTION_PADDING: 30,
      SECTIONS_MARGIN: 10,
      SECTION_TOP_PADDING: 40,
      SECTION_SIDE_PADDING: 20,
      SECTION_BOTTOM_PADDING: 20,
    }
  },

  computed: {
    seatSpacing() {
      return this.SEAT_SIZE + this.SEATS_DISTANCE
    },
  },

  watch: {
    SEAT_SIZE() {
      this.$forceUpdate()
    },
    SEATS_DISTANCE() {
      this.$forceUpdate()
    },
  },

  created() {
    this.$nuxt.$emit("setNavBar", { title: "Auditorio", icon: "theater", back: "/auditorium" })
    // Si el auditorio tiene configuración previa, cargarla desde auditorium.config
    if (this.auditorium && this.auditorium.config) {
      let config = this.auditorium.config
      if (typeof config === "string") {
        try {
          config = JSON.parse(config)
        } catch (e) {
          // Si falla el parseo, no cargar nada
          return
        }
      }
      if (config.settings && config.sections) {
        this.SEAT_SIZE = config.settings.SEAT_SIZE || 10
        this.SEATS_DISTANCE = config.settings.SEATS_DISTANCE || 15
        this.SUBSECTION_PADDING = config.settings.SUBSECTION_PADDING || 30
        this.SECTIONS_MARGIN = config.settings.SECTIONS_MARGIN || 10
        this.SECTION_TOP_PADDING = config.settings.SECTION_TOP_PADDING || 40
        this.SECTION_SIDE_PADDING = config.settings.SECTION_SIDE_PADDING || 20
        this.SECTION_BOTTOM_PADDING = config.settings.SECTION_BOTTOM_PADDING || 20
        this.sections = JSON.parse(JSON.stringify(config.sections))
      }
    }
  },
  methods: {
    async saveAuditorium() {
      try {
        // Generar el JSON de configuración actualizado
        const config = {
          settings: {
            SEAT_SIZE: this.SEAT_SIZE,
            SEATS_DISTANCE: this.SEATS_DISTANCE,
            SUBSECTION_PADDING: this.SUBSECTION_PADDING,
            SECTIONS_MARGIN: this.SECTIONS_MARGIN,
            SECTION_TOP_PADDING: this.SECTION_TOP_PADDING,
            SECTION_SIDE_PADDING: this.SECTION_SIDE_PADDING,
            SECTION_BOTTOM_PADDING: this.SECTION_BOTTOM_PADDING,
          },
          sections: this.sections,
        }
        // Asignar a auditorium.config
        this.auditorium.config = config

        const payload = {
          ...this.auditorium,
          name: this.auditorium.name,
          config: JSON.stringify(config),
        }
        await this.$repository.Auditorium.update(this.auditorium.id, payload)
        this.$toast && this.$toast.success("Auditorio guardado")
      } catch (e) {
        this.$toast && this.$toast.error("Error al guardar")
      }
    },
    // ============ OPERACIONES DE SECCIÓN ============
    addSection() {
      this.sections.push({
        name: `Sección ${this.sections.length + 1}`,
        isLabel: false,
        subsections: [
          {
            name: "Subsección 1",
            isLabel: false,
            seats: this.createSeatsGrid(4, 4),
          },
        ],
      })
    },

    addLabelSection() {
      this.sections.push({
        name: `Etiqueta ${this.sections.length + 1}`,
        isLabel: true,
        subsections: [],
      })
    },

    removeSection(sIdx) {
      this.sections.splice(sIdx, 1)
    },

    addSubsection(sIdx) {
      const section = this.sections[sIdx]
      section.subsections.push({
        name: `Subsección ${section.subsections.length + 1}`,
        isLabel: false,
        seats: this.createSeatsGrid(3, 5),
        tempRows: 3,
        tempCols: 5,
      })
    },

    addSubsectionLabel(sIdx) {
      const section = this.sections[sIdx]
      section.subsections.push({
        name: `Área ${section.subsections.length + 1}`,
        isLabel: true,
        width: 100,
        seats: [],
      })
    },

    removeSubsection(sIdx, subIdx) {
      this.sections[sIdx].subsections.splice(subIdx, 1)
    },

    setSubsectionGrid(sIdx, subIdx) {
      const sub = this.sections[sIdx].subsections[subIdx]
      const rows = parseInt(sub.tempRows) || 3
      const cols = parseInt(sub.tempCols) || 5

      // Validar valores
      if (rows < 1 || rows > 20 || cols < 1 || cols > 30) {
        alert("Filas: 1-20, Columnas: 1-30")
        return
      }

      // Crear nueva grilla
      sub.seats = this.createSeatsGrid(rows, cols)
      this.$forceUpdate()
    },

    getRowOptions(sub) {
      return sub.seats.map((_, idx) => ({
        text: `Fila ${idx + 1}`,
        value: idx,
      }))
    },

    getMaxColumns(sub) {
      if (!sub.seats?.length) return 0
      return Math.max(...sub.seats.map((row) => row.length))
    },

    addSeatToRow(sIdx, subIdx, side) {
      const sub = this.sections[sIdx].subsections[subIdx]
      const selectedRowIdx = this.selectedRow[`${sIdx}-${subIdx}`]

      if (selectedRowIdx === undefined || selectedRowIdx === null) return

      if (side === "left") {
        const selectedRow = sub.seats[selectedRowIdx]
        const hasPlaceholder = selectedRow[0] && selectedRow[0].state === "invisible"

        if (hasPlaceholder) {
          selectedRow[0] = {
            id: `s${selectedRowIdx}c0-${Date.now().toString(36)}`,
            row: selectedRowIdx,
            col: 0,
            state: "free",
          }
        } else {
          sub.seats.forEach((row, rowIdx) => {
            if (rowIdx === selectedRowIdx) {
              const newSeat = {
                id: `s${rowIdx}c0-${Date.now().toString(36)}`,
                row: rowIdx,
                col: 0,
                state: "free",
              }
              row.unshift(newSeat)
            } else {
              const placeholder = {
                id: `p${rowIdx}c0-${Date.now().toString(36)}`,
                row: rowIdx,
                col: 0,
                state: "invisible",
              }
              row.unshift(placeholder)
            }
          })
        }
      } else {
        const selectedRow = sub.seats[selectedRowIdx]
        const lastIdx = selectedRow.length - 1

        if (selectedRow[lastIdx] && selectedRow[lastIdx].state === "invisible") {
          selectedRow[lastIdx] = {
            id: `s${selectedRowIdx}c${lastIdx}-${Date.now().toString(36)}`,
            row: selectedRowIdx,
            col: lastIdx,
            state: "free",
          }
        } else {
          const newSeat = {
            id: `s${selectedRowIdx}c${selectedRow.length}-${Date.now().toString(36)}`,
            row: selectedRowIdx,
            col: selectedRow.length,
            state: "free",
          }
          selectedRow.push(newSeat)
        }
      }

      this.$forceUpdate()
    },

    // ============ CREACIÓN DE ASIENTOS ============
    createSeatsGrid(rows, cols) {
      return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => this.createSeat(c, r)))
    },

    createSeat(col, row) {
      return {
        id: `s${row}c${col}-${Date.now().toString(36)}`,
        row,
        col,
        state: "free",
      }
    },

    // ============ MANEJO DE EVENTOS ============
    handleSeatClick(seat, sIdx, subIdx) {
      if (seat.state === "reserved") return
      seat.state = seat.state === "selected" ? "free" : "selected"
    },

    handleSeatHover(e) {
      const seat = e.target.attrs
      const container = e.target.getStage().container()
      container.style.cursor = seat.opacity < 1 ? "not-allowed" : "pointer"
    },

    handleSeatLeave(e) {
      const container = e.target.getStage().container()
      container.style.cursor = "default"
    },

    // ============ CONFIGURACIONES DE KONVA ============
    getSectionConfig(section, sIdx) {
      const y = this.sections.slice(0, sIdx).reduce((acc, s) => acc + this.getSectionHeight(s) + this.SECTIONS_MARGIN, 60)

      return {
        x: this.getSectionX(section),
        y,
      }
    },

    getSectionTitleConfig(section) {
      const width = this.getSectionWidth(section)
      return {
        x: 0,
        y: section.isLabel ? 0 : this.SECTION_TOP_PADDING / 4,
        text: section.name,
        fontSize: section.isLabel ? 24 : 20,
        fill: section.isLabel ? "#1976d2" : "#fff",
        fontStyle: "bold",
        fontFamily: "Arial",
        align: section.isLabel ? "left" : "center",
        width: section.isLabel ? undefined : width,
      }
    },

    getSubsectionPosition(section, subIdx) {
      const x =
        section.subsections.slice(0, subIdx).reduce((acc, s) => {
          if (s.isLabel) return acc + (s.width || 100)
          return acc + this.getSubsectionWidth(s)
        }, 0) +
        subIdx * this.SUBSECTION_PADDING +
        this.SECTION_SIDE_PADDING

      return {
        x,
        y: this.SECTION_TOP_PADDING,
      }
    },

    getSubsectionRectConfig(sub) {
      return {
        width: this.getSubsectionWidth(sub),
        height: this.getSubsectionHeight(sub),
        fill: "#e0e0e0",
        stroke: "green",
        strokeWidth: 2,
      }
    },

    getSubsectionTitleConfig(sub) {
      const width = this.getSubsectionWidth(sub)
      return {
        x: 0,
        y: -15,
        text: sub.name,
        fontSize: 11,
        fill: "#fff",
        fontFamily: "Arial",
        align: "left",
        width,
      }
    },

    getSubsectionLabelConfig(sub, section) {
      const height = this.getSectionHeight(section) - this.SECTION_TOP_PADDING - this.SECTION_BOTTOM_PADDING
      return {
        x: (sub.width || 100) / 2,
        y: height / 2,
        text: sub.name,
        fontSize: 14,
        fill: "#ff9800",
        fontStyle: "bold",
        fontFamily: "Arial",
        align: "center",
        offsetX: (sub.width || 100) / 2 - 5,
        offsetY: 7,
      }
    },

    getSubsectionSeats(sub) {
      const allSeats = []
      sub.seats.forEach((row, rowIdx) => {
        row.forEach((seat, colIdx) => {
          if (seat.state !== "invisible") {
            allSeats.push({
              ...seat,
              row: rowIdx,
              col: colIdx,
              x: colIdx * this.seatSpacing + this.SEAT_SIZE / 2,
              y: rowIdx * this.seatSpacing + this.SEAT_SIZE / 2,
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
        radius: this.SEAT_SIZE / 2,
        fill: this.getSeatColor(isReserved, isSelected),
        stroke: isSelected ? this.SEAT_SELECTED_COLOR : "#757575",
        strokeWidth: 1,
        opacity: isReserved ? 0.6 : 1,
      }
    },

    getSeatColor(isReserved, isSelected) {
      if (isSelected) return this.SEAT_SELECTED_COLOR
      if (isReserved) return "lightgrey"
      return "#1b728d"
    },

    // ============ CÁLCULOS DE DIMENSIONES ============
    getSubsectionWidth(sub) {
      if (sub.isLabel) return sub.width || 100
      if (!sub.seats?.length) return 0
      const maxCols = Math.max(...sub.seats.map((row) => row.length))
      return maxCols * this.seatSpacing - this.SEATS_DISTANCE
    },

    getSubsectionHeight(sub) {
      if (sub.isLabel) return 0
      if (!sub.seats?.length) return 40
      return sub.seats.length * this.seatSpacing - this.SEATS_DISTANCE
    },

    getSectionWidth(section) {
      if (section.isLabel) return 0
      if (!section.subsections.length) return 0

      return (
        section.subsections.reduce((acc, sub) => {
          if (sub.isLabel) return acc + (sub.width || 100)
          return acc + this.getSubsectionWidth(sub)
        }, 0) +
        (section.subsections.length - 1) * this.SUBSECTION_PADDING +
        this.SECTION_SIDE_PADDING * 2
      )
    },

    getSectionHeight(section) {
      if (section.isLabel) return 30

      if (!section.subsections?.length) return this.SECTION_TOP_PADDING + this.SECTION_BOTTOM_PADDING

      const maxRows = Math.max(...section.subsections.map((sub) => (sub.isLabel ? 0 : sub.seats?.length || 0)))

      if (maxRows === 0) return this.SECTION_TOP_PADDING + this.SECTION_BOTTOM_PADDING + 40

      return maxRows * this.seatSpacing - this.SEATS_DISTANCE + this.SECTION_TOP_PADDING + this.SECTION_BOTTOM_PADDING
    },

    getSectionX(section) {
      return (this.stageConfig.width - this.getSectionWidth(section)) / 2
    },

    // ============ IMPORTAR/EXPORTAR ============
    exportConfiguration() {
      const config = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        settings: {
          SEAT_SIZE: this.SEAT_SIZE,
          SEATS_DISTANCE: this.SEATS_DISTANCE,
          SUBSECTION_PADDING: this.SUBSECTION_PADDING,
          SECTIONS_MARGIN: this.SECTIONS_MARGIN,
          SECTION_TOP_PADDING: this.SECTION_TOP_PADDING,
          SECTION_SIDE_PADDING: this.SECTION_SIDE_PADDING,
          SECTION_BOTTOM_PADDING: this.SECTION_BOTTOM_PADDING,
        },
        sections: this.sections,
      }

      const jsonStr = JSON.stringify(config, null, 2)
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

          // Actualizar auditorium.config
          this.auditorium.config = config

          this.SEAT_SIZE = config.settings.SEAT_SIZE || 10
          this.SEATS_DISTANCE = config.settings.SEATS_DISTANCE || 15
          this.SUBSECTION_PADDING = config.settings.SUBSECTION_PADDING || 30
          this.SECTIONS_MARGIN = config.settings.SECTIONS_MARGIN || 10
          this.SECTION_TOP_PADDING = config.settings.SECTION_TOP_PADDING || 40
          this.SECTION_SIDE_PADDING = config.settings.SECTION_SIDE_PADDING || 20
          this.SECTION_BOTTOM_PADDING = config.settings.SECTION_BOTTOM_PADDING || 20

          this.sections = config.sections

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
.gap-2 {
  gap: 8px;
}
</style>
