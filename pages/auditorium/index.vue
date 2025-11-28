<template>
  <v-container fluid>
    <v-row>
      <!-- Panel de Control -->
      <v-col cols="12" md="3">
        <v-btn color="primary" block class="mb-4" @click="addSection">
          <v-icon left>mdi-plus</v-icon>
          Agregar sección
        </v-btn>

        <v-slider v-model="SEAT_SIZE" :min="5" :max="40" :step="1" label="Tamaño de asiento" thumb-label class="mb-2" />

        <v-slider v-model="SEATS_DISTANCE" :min="0" :max="60" :step="1" label="Distancia entre asientos" thumb-label class="mb-4" />

        <!-- Lista de Secciones -->
        <v-expansion-panels accordion>
          <v-expansion-panel v-for="(section, sIdx) in sections" :key="`section-${sIdx}`">
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-text-field v-model="section.name" dense solo hide-details style="max-width: 140px" @click.stop />
                <v-spacer />
                <v-btn icon small color="error" @click.stop="removeSection(sIdx)">
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-btn small block color="secondary" class="mb-2" @click="addSubsection(sIdx)">
                <v-icon left small>mdi-plus</v-icon>
                Agregar subsección
              </v-btn>

              <!-- Subsecciones -->
              <v-card v-for="(sub, subIdx) in section.subsections" :key="`sub-${subIdx}`" outlined class="mb-2 pa-2">
                <v-text-field v-model="sub.name" label="Nombre subsección" dense hide-details class="mb-2" />

                <div class="d-flex gap-2 mb-2">
                  <v-btn x-small color="success" @click="addRow(sIdx, subIdx)">
                    <v-icon left x-small>mdi-table-row-plus-after</v-icon>
                    + Fila
                  </v-btn>
                  <v-btn x-small color="success" @click="addColumn(sIdx, subIdx)">
                    <v-icon left x-small>mdi-table-column-plus-after</v-icon>
                    + Col
                  </v-btn>
                </div>

                <div class="d-flex gap-2">
                  <v-btn x-small color="warning" @click="removeRow(sIdx, subIdx)">
                    <v-icon left x-small>mdi-table-row-remove</v-icon>
                    - Fila
                  </v-btn>
                  <v-btn x-small color="warning" @click="removeColumn(sIdx, subIdx)">
                    <v-icon left x-small>mdi-table-column-remove</v-icon>
                    - Col
                  </v-btn>
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
                <!-- Fondo de sección -->
                <v-rect
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

                <!-- Subsecciones -->
                <v-group v-for="(sub, subIdx) in section.subsections" :key="`sub-${sIdx}-${subIdx}`" :config="getSubsectionPosition(section, subIdx)">
                  <!-- Etiquetas del eje Y (números de fila) - ANTES del fondo -->
                  <v-text
                    v-for="(row, rowIdx) in sub.seats"
                    :key="`row-label-${rowIdx}`"
                    :config="{
                      x: -15,
                      y: rowIdx * seatSpacing + SEAT_SIZE / 2,
                      text: (rowIdx + 1).toString(),
                      fontSize: 11,
                      fill: '#fff',
                      fontFamily: 'Arial',
                      align: 'right',
                      verticalAlign: 'middle',
                      offsetY: 5,
                    }"
                  />

                  <!-- Etiquetas del eje X (letras de columna) - ANTES del fondo -->
                  <v-text
                    v-for="colIdx in sub.seats[0]?.length || 0"
                    :key="`col-label-${colIdx}`"
                    :config="{
                      x: (colIdx - 1) * seatSpacing + SEAT_SIZE / 2,
                      y: getSubsectionHeight(sub) + 5,
                      text: String.fromCharCode(64 + colIdx),
                      fontSize: 11,
                      fill: '#fff',
                      fontFamily: 'Arial',
                      align: 'center',
                      offsetX: 5,
                    }"
                  />

                  <!-- Fondo de subsección -->
                  <v-rect :config="getSubsectionRectConfig(sub)" />

                  <!-- Título de subsección -->
                  <v-text :config="getSubsectionTitleConfig(sub)" />

                  <!-- Asientos -->
                  <v-circle v-for="seat in getSubsectionSeats(sub)" :key="seat.id" :config="getSeatConfig(seat)" @mouseenter="handleSeatHover" @mouseleave="handleSeatLeave" @click="handleSeatClick(seat, sIdx, subIdx)" />
                </v-group>
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

export default {
  middleware: ["authenticated"],

  data() {
    return {
      stageConfig: { width: 900, height: 700 },
      sections: [],
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
    // Calcular configuraciones una sola vez
    seatSpacing() {
      return this.SEAT_SIZE + this.SEATS_DISTANCE
    },
  },

  watch: {
    // Simplificado - Vue ya maneja la reactividad
    SEAT_SIZE() {
      this.$forceUpdate()
    },
    SEATS_DISTANCE() {
      this.$forceUpdate()
    },
  },

  created() {
    this.$nuxt.$emit("setNavBar", { title: "Auditorio", icon: "theater" })
  },

  methods: {
    // ============ OPERACIONES DE SECCIÓN ============
    addSection() {
      this.sections.push({
        name: `Sección ${this.sections.length + 1}`,
        subsections: [
          {
            name: "Subsección 1",
            seats: this.createSeatsGrid(4, 4),
          },
        ],
      })
    },

    removeSection(sIdx) {
      this.sections.splice(sIdx, 1)
    },

    addSubsection(sIdx) {
      const section = this.sections[sIdx]
      section.subsections.push({
        name: `Subsección ${section.subsections.length + 1}`,
        seats: this.createSeatsGrid(3, 5),
      })
    },

    removeSubsection(sIdx, subIdx) {
      this.sections[sIdx].subsections.splice(subIdx, 1)
    },

    addRow(sIdx, subIdx) {
      const sub = this.sections[sIdx].subsections[subIdx]
      const cols = sub.seats[0]?.length || 5
      const newRow = Array.from({ length: cols }, (_, colIdx) => this.createSeat(colIdx, sub.seats.length))
      sub.seats.push(newRow)
    },

    removeRow(sIdx, subIdx) {
      const sub = this.sections[sIdx].subsections[subIdx]
      if (sub.seats.length > 1) {
        sub.seats.pop()
      }
    },

    addColumn(sIdx, subIdx) {
      const sub = this.sections[sIdx].subsections[subIdx]
      sub.seats.forEach((row, rowIdx) => {
        row.push(this.createSeat(row.length, rowIdx))
      })
    },

    removeColumn(sIdx, subIdx) {
      const sub = this.sections[sIdx].subsections[subIdx]
      if (sub.seats[0]?.length > 1) {
        sub.seats.forEach((row) => row.pop())
      }
    },

    // ============ CREACIÓN DE ASIENTOS ============
    createSeatsGrid(rows, cols) {
      return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => this.createSeat(c, r)))
    },

    createSeat(col, row) {
      return {
        id: `seat-${row}-${col}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        row,
        col,
        state: "free", // 'free' | 'selected' | 'reserved'
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
      // Calcular Y acumulativa basada en alturas previas
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
        y: this.SECTION_TOP_PADDING / 4,
        text: section.name,
        fontSize: 20,
        fill: "#fff",
        fontStyle: "bold",
        fontFamily: "Arial",
        align: "center",
        width,
      }
    },

    getSubsectionPosition(section, subIdx) {
      const x = section.subsections.slice(0, subIdx).reduce((acc, s) => acc + this.getSubsectionWidth(s), 0) + subIdx * this.SUBSECTION_PADDING + this.SECTION_SIDE_PADDING

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
        fontSize: 14,
        fill: "red",
        fontStyle: "bold",
        fontFamily: "Arial",
        align: "left",
        width,
      }
    },

    getSubsectionSeats(sub) {
      // Aplanar la matriz de asientos con posiciones calculadas
      return sub.seats.flatMap((row) =>
        row.map((seat) => ({
          ...seat,
          x: seat.col * this.seatSpacing + this.SEAT_SIZE / 2,
          y: seat.row * this.seatSpacing + this.SEAT_SIZE / 2,
        }))
      )
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
      if (!sub.seats?.[0]) return 0
      return sub.seats[0].length * this.seatSpacing - this.SEATS_DISTANCE
    },

    getSubsectionHeight(sub) {
      if (!sub.seats?.length) return 40
      return sub.seats.length * this.seatSpacing - this.SEATS_DISTANCE
    },

    getSectionWidth(section) {
      if (!section.subsections.length) return 0
      return section.subsections.reduce((acc, sub) => acc + this.getSubsectionWidth(sub), 0) + (section.subsections.length - 1) * this.SUBSECTION_PADDING + this.SECTION_SIDE_PADDING * 2
    },

    getSectionHeight(section) {
      if (!section.subsections?.length) return this.SECTION_TOP_PADDING + this.SECTION_BOTTOM_PADDING

      const maxRows = Math.max(...section.subsections.map((sub) => sub.seats?.length || 0))

      if (maxRows === 0) return this.SECTION_TOP_PADDING + this.SECTION_BOTTOM_PADDING + 40

      return maxRows * this.seatSpacing - this.SEATS_DISTANCE + this.SECTION_TOP_PADDING + this.SECTION_BOTTOM_PADDING
    },

    getSectionX(section) {
      return (this.stageConfig.width - this.getSectionWidth(section)) / 2
    },
  },
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
