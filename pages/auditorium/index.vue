<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="3">
        <v-btn color="primary" @click="addSection">Agregar sección</v-btn>
        <v-slider v-model="SEAT_SIZE" :min="5" :max="40" :step="1" label="Tamaño de asiento" class="mt-4 mb-2" />
        <v-slider v-model="SEATS_DISTANCE" :min="0" :max="60" :step="1" label="Distancia entre asientos" class="mb-4" />
        <v-list dense>
          <v-list-item v-for="(section, sIdx) in sections" :key="'section-' + sIdx">
            <v-list-item-content>
              <v-list-item-title>
                <b>{{ section.name }}</b>
                <v-btn icon small color="error" @click="removeSection(sIdx)"><v-icon small>mdi-delete</v-icon></v-btn>
              </v-list-item-title>
              <v-btn small @click="addSubsection(sIdx)">Agregar subsección</v-btn>
              <v-list dense>
                <v-list-item v-for="(sub, subIdx) in section.subsections" :key="'sub-' + subIdx">
                  <v-list-item-content>
                    <v-text-field v-model="sub.name" label="Nombre subsección" dense hide-details />
                    <v-btn small @click="addRow(sIdx, subIdx)">Agregar fila</v-btn>
                    <v-btn small @click="addColumn(sIdx, subIdx)">Agregar columna</v-btn>
                    <v-btn icon small color="error" @click="removeSubsection(sIdx, subIdx)"><v-icon small>mdi-delete</v-icon></v-btn>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="12" md="9">
        <v-sheet elevation="2" class="pa-2" style="background: #f5f5f5; min-height: 500px">
          <v-stage :key="'stage-' + SEAT_SIZE + '-' + SEATS_DISTANCE" :config="stageConfig">
            <v-layer>
              <template v-for="(section, sIdx) in sections">
                <v-group :key="'section-' + sIdx" :x="getSectionX(section)" :y="60 + sIdx * 220">
                  <v-rect :width="getSectionWidth(section)" :height="getSectionHeight(section)" fill="green" :stroke-width="1" stroke="lightgrey" :corner-radius="5" />
                  <v-text :x="0" :y="0" :width="getSectionWidth(section)" :height="SECTION_TOP_PADDING" align="center" vertical-align="middle" :font-size="20" :fill="'#333'">
                    {{ section.name }}
                  </v-text>
                  <template v-for="(sub, subIdx) in section.subsections">
                    <v-group :key="'subg-' + sIdx + '-' + subIdx" :x="section.subsections.slice(0, subIdx).reduce((acc, s) => acc + getSubsectionWidth(s), 0) + subIdx * SUBSECTION_PADDING" :y="SECTION_TOP_PADDING">
                      <v-rect :width="getSubsectionWidth(sub)" :height="(sub.seats.length || 1) * (SEAT_SIZE + SEATS_DISTANCE) - SEATS_DISTANCE" :fill="'#e0e0e0'" :stroke="'black'" :stroke-width="2" />
                      <v-group v-for="(row, rowIdx) in sub.seats" :key="'rownum-' + rowIdx">
                        <v-group v-for="(seat, colIdx) in row" :key="seat.id">
                          <v-circle
                            :x="colIdx * (SEAT_SIZE + SEATS_DISTANCE) + SEAT_SIZE / 2"
                            :y="rowIdx * (SEAT_SIZE + SEATS_DISTANCE) + SEAT_SIZE / 2"
                            :radius="SEAT_SIZE / 2"
                            :width="SEAT_SIZE"
                            :height="SEAT_SIZE"
                            :fill="getSeatColor(seat.state === 'reserved', seat.state === 'selected')"
                            :stroke="seat.state === 'selected' ? SEAT_SELECTED_COLOR : '#757575'"
                            :stroke-width="1"
                            :opacity="seat.state === 'reserved' ? 0.6 : 1"
                            @mouseenter.native="onSeatHover($event, seat)"
                            @mouseleave.native="onSeatLeave($event, seat)"
                            @click="
                              () => {
                                if (seat.state !== 'reserved') toggleSeatState(sIdx, subIdx, rowIdx, colIdx)
                              }
                            "
                          />
                          <v-text
                            :x="colIdx * (SEAT_SIZE + SEATS_DISTANCE) + SEAT_SIZE / 2 - 6"
                            :y="rowIdx * (SEAT_SIZE + SEATS_DISTANCE) + SEAT_SIZE / 2 + 5"
                            :font-size="11"
                            :fill="seat.state === 'selected' ? '#fff' : '#333'"
                          >
                            {{ colIdx + 1 }}
                          </v-text>
                        </v-group>
                      </v-group>
                    </v-group>
                  </template>
                </v-group>
              </template>
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

// ...existing code...
export default {
  middleware: ["authenticated"],
  data() {
    return {
      stageKey: 0,
      stageConfig: { width: 900, height: 700 },
      sections: [],
      SEAT_SELECTED_COLOR: "#1976d2",
      SEAT_SIZE: 10,
      SEATS_DISTANCE: 15,
      SUBSECTION_PADDING: 30,
      SECTIONS_MARGIN: 10,
      SECTION_TOP_PADDING: 40,
    }
  },
  watch: {
    SEAT_SIZE() {
      this.forceStageUpdate()
    },
    SEATS_DISTANCE() {
      this.forceStageUpdate()
    },
  },

  created() {
    this.$nuxt.$emit("setNavBar", { title: "Auditorio", icon: "theater" })
  },
  methods: {
    forceStageUpdate() {
      // Forzar la actualización reactiva de las secciones
      this.sections = [...this.sections]
    },
    regenerateSeats() {
      // Crear una nueva referencia del array para forzar reactividad
      this.sections = this.sections.map((section) => ({
        ...section,
        subsections: section.subsections.map((sub) => ({
          ...sub,
          seats: sub.seats && sub.seats.length > 0 ? this.createSeats(sub.seats.length, sub.seats[0].length, 140, 120) : [],
        })),
      }))
    },
    getSeatColor(isBooked, isSelected) {
      if (isSelected) return this.SEAT_SELECTED_COLOR
      if (isBooked) return "lightgrey"
      return "#1b728d"
    },
    onSeatHover(e, seat) {
      const isBooked = seat.state === "reserved"
      const container = e.target.getStage().container()
      container.style.cursor = isBooked ? "not-allowed" : "pointer"
    },
    onSeatLeave(e, seat) {
      const container = e.target.getStage().container()
      container.style.cursor = ""
    },
    removeSection(sIdx) {
      this.sections.splice(sIdx, 1)
      this.regenerateSeats()
    },
    removeSubsection(sIdx, subIdx) {
      // Crear una copia completa para forzar reactividad
      const newSections = JSON.parse(JSON.stringify(this.sections))
      newSections[sIdx].subsections.splice(subIdx, 1)
      this.sections = newSections
    },
    addSection() {
      const newSection = {
        name: "Sección " + (this.sections.length + 1),
        subsections: [
          {
            name: "Subsección 1",
            seats: this.createSeats(4, 4, 140, 120),
          },
        ],
      }

      this.sections.push(newSection)
      this.regenerateSeats()
    },
    addSubsection(sIdx) {
      const newSubsection = {
        name: "Subsección " + (this.sections[sIdx].subsections.length + 1),
        seats: this.createSeats(3, 5, 140, 120),
      }
      // Crear una copia profunda de las secciones para forzar reactividad
      const newSections = JSON.parse(JSON.stringify(this.sections))
      newSections[sIdx].subsections.push(newSubsection)
      this.sections = newSections
    },
    addRow(sIdx, subIdx) {
      const sub = this.sections[sIdx].subsections[subIdx]
      if (sub) {
        const cols = sub.seats[0]?.length || 5
        sub.seats.push(this.createSeatRow(cols, sub.seats.length, 140, 120, sub.seats.length, sub.seats.length + 1))
      }
    },
    addColumn(sIdx, subIdx) {
      const sub = this.sections[sIdx].subsections[subIdx]
      if (sub) {
        for (let r = 0; r < sub.seats.length; r++) {
          sub.seats[r].push(this.createSeat(sub.seats[r].length, r, 140, 120, r, sub.seats[r].length + 1))
        }
      }
    },
    createSeats(rows, cols, w, h) {
      const seats = []
      for (let r = 0; r < rows; r++) {
        seats.push(this.createSeatRow(cols, r, w, h, r, rows))
      }
      return seats
    },
    createSeatRow(cols, rowIdx, w, h, r, totalRows) {
      const row = []
      for (let c = 0; c < cols; c++) {
        row.push(this.createSeat(c, rowIdx, w, h, r, cols))
      }
      return row
    },
    createSeat(colIdx, rowIdx, w, h, r, totalCols) {
      // Calcular el área disponible para los asientos
      const cols = totalCols
      const rows = r !== undefined ? r + 1 : 1
      const seatW = this.SEAT_SIZE + this.SEATS_DISTANCE
      const seatH = this.SEAT_SIZE + this.SEATS_DISTANCE
      // Centrar los asientos dentro del rectángulo
      const totalWidth = cols * seatW
      const totalHeight = rows * seatH
      const marginX = (w - totalWidth) / 2
      const marginY = (h - totalHeight) / 2
      return {
        id: `${rowIdx}-${colIdx}-${Math.random().toString(36).substr(2, 5)}`,
        x: marginX + colIdx * seatW + this.SEAT_SIZE / 2,
        y: marginY + rowIdx * seatH + this.SEAT_SIZE / 2,
        state: "free",
      }
    },
    toggleSeatState(sIdx, subIdx, rowIdx, colIdx) {
      const sub = this.sections[sIdx].subsections[subIdx]
      if (sub) {
        const seat = sub.seats[rowIdx][colIdx]
        if (seat.state === "reserved") return
        seat.state = seat.state === "selected" ? "free" : "selected"
      }
    },
    getSubsectionWidth(sub) {
      if (!sub.seats || sub.seats.length === 0) return 0
      const cols = sub.seats[0] ? sub.seats[0].length : 0
      return cols * (this.SEAT_SIZE + this.SEATS_DISTANCE) - this.SEATS_DISTANCE
    },
    getSectionWidth(section) {
      if (!section.subsections.length) return 0
      return section.subsections.reduce((acc, sub) => acc + this.getSubsectionWidth(sub), 0) + (section.subsections.length - 1) * this.SUBSECTION_PADDING
    },
    getSectionX(section) {
      // Centra la sección en el escenario
      return (this.stageConfig.width - this.getSectionWidth(section)) / 2
    },
    getSectionHeight(section) {
      if (!section.subsections || section.subsections.length === 0) {
        return this.SECTION_TOP_PADDING
      }
      // Encuentra el número máximo de filas en todas las subsecciones
      const maxRows = Math.max(
        ...section.subsections.map((sub) => {
          return sub.seats ? sub.seats.length : 0
        })
      )
      // Si no hay filas, retorna una altura mínima
      if (maxRows === 0) {
        return this.SECTION_TOP_PADDING + 40 // Altura mínima
      }
      return maxRows * (this.SEAT_SIZE + this.SEATS_DISTANCE) - this.SEATS_DISTANCE + this.SECTION_TOP_PADDING
    },
  },
}
</script>
