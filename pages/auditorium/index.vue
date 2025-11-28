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
          <v-stage :key="SEAT_SIZE + '-' + SEATS_DISTANCE" :config="stageConfig">
            <v-layer>
              <template v-for="(section, sIdx) in sections">
                <template v-for="(sub, subIdx) in section.subsections">
                  <v-group
                    :key="'subg-' + sIdx + '-' + subIdx"
                    :x="(stageConfig.width - ((sub.seats[0]?.length || 1) * (SEAT_SIZE + SEATS_DISTANCE) - SEATS_DISTANCE)) / 2"
                    :y="(stageConfig.height - ((sub.seats.length || 1) * (SEAT_SIZE + SEATS_DISTANCE) - SEATS_DISTANCE)) / 2"
                  >
                    <v-rect
                      :width="(sub.seats[0]?.length || 1) * (SEAT_SIZE + SEATS_DISTANCE) - SEATS_DISTANCE"
                      :height="(sub.seats.length || 1) * (SEAT_SIZE + SEATS_DISTANCE) - SEATS_DISTANCE"
                      :fill="'#e0e0e0'"
                      :stroke="'black'"
                      :stroke-width="2"
                    />
                    <v-group v-for="(row, rowIdx) in sub.seats" :key="'rownum-' + rowIdx">
                      <v-group v-for="(seat, colIdx) in row" :key="seat.id">
                        <v-circle
                          :x="colIdx * (SEAT_SIZE + SEATS_DISTANCE) + SEAT_SIZE / 2"
                          :y="rowIdx * (SEAT_SIZE + SEATS_DISTANCE) + SEAT_SIZE / 2"
                          :radius="SEAT_SIZE / 2"
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
    }
  },
  watch: {
    SEAT_SIZE(val) {
      this.regenerateSeats()
    },
    SEATS_DISTANCE(val) {
      this.regenerateSeats()
    },
  },
  created() {
    this.$nuxt.$emit("setNavBar", { title: "Auditorio", icon: "theater" })
  },
  methods: {
    regenerateSeats() {
      this.sections.forEach((section) => {
        section.subsections.forEach((sub) => {
          if (sub.seats && sub.seats.length > 0) {
            const rows = sub.seats.length
            const cols = sub.seats[0].length
            sub.seats = this.createSeats(rows, cols, 140, 120)
          }
        })
      })
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
    },
    removeSubsection(sIdx, subIdx) {
      this.sections[sIdx].subsections.splice(subIdx, 1)
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
      console.log("Agregando sección:", newSection)
      this.sections.push(newSection)
    },
    addSubsection(sIdx) {
      this.sections[sIdx].subsections.push({
        name: "Subsección " + (this.sections[sIdx].subsections.length + 1),
        seats: this.createSeats(3, 5, 140, 120),
      })
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
      console.log("createSeats", seats)
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
  },
}
</script>
