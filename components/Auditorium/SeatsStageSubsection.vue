<template>
  <v-group :config="{ x: 17, y: 20 }">
    <!-- Background rectangle -->
    <v-rect
      :config="{
        x: -15,
        y: -17,
        // x: 0,
        // y: 0,
        width: subsectionWidth + 18,
        height: subsectionHeight + 31,
        fill: 'black',
        stroke: 'red',
        strokeWidth: 1,
      }"
    />

    <!-- Row labels -->
    <v-text v-for="rowIdx in subsection.seats.length" :key="`row-label-${rowIdx}`" :config="getRowLabelConfig(rowIdx - 1)" />

    <!-- Column labels -->
    <v-text v-for="colIdx in maxColumns" :key="`col-label-${colIdx}`" :config="getColLabelConfig(colIdx - 1)" />

    <!-- Subsection title -->
    <v-text :config="subsectionTitleConfig" />

    <!-- Stats: Count -->
    <v-text
      :config="{
        x: -13,
        y: -28,
        text: `${stats.withStatus}/${stats.total}`,
        fontSize: 10,
        fill: 'white',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }"
    />

    <!-- Stats: Percentage -->
    <v-text
      :config="{
        x: 20,
        y: -28,
        text: `${stats.percent}%`,
        fontSize: 10,
        fill: percentageColor,
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }"
    />

    <!-- Seats -->
    <template v-for="seat in seats">
      <v-group :key="seat.id" :config="{ x: seat.x, y: seat.y, draggable: false }">
        <v-circle
          :config="Object.assign({}, seat.config, { x: 0, y: 0, listening: true, draggable: false })"
          @click="handleSeatClick(seat, $event)"
          @tap="handleSeatClick(seat, $event)"
          @mousedown="(e) => (e.cancelBubble = true)"
        />
      </v-group>
    </template>
  </v-group>
</template>

<script>
export default {
  name: "SeatsStageSubsection",
  props: {
    subsection: { type: Object, required: true },
    settings: { type: Object, required: true },
    categories: { type: Array, default: () => [] },
    selectedSeatsArray: { type: Array, default: () => [] },
    blinkState: { type: Boolean, default: false },
  },
  computed: {
    seatSpacing() {
      return this.settings.SEAT_SIZE + this.settings.SEATS_DISTANCE
    },

    subsectionWidth() {
      if (!this.subsection.seats?.length) return 0
      const maxCols = Math.max(...this.subsection.seats.map((row) => row.length))
      return maxCols * this.seatSpacing - this.settings.SEATS_DISTANCE
    },

    subsectionHeight() {
      if (!this.subsection.seats?.length) return 40
      return this.subsection.seats.length * this.seatSpacing - this.settings.SEATS_DISTANCE
    },

    maxColumns() {
      if (!this.subsection || !Array.isArray(this.subsection.seats) || this.subsection.seats.length === 0) return 0
      return Math.max(...this.subsection.seats.map((row) => (row ? row.length : 0)))
    },

    subsectionTitleConfig() {
      return {
        x: -13,
        y: -15,
        text: this.subsection.name,
        fontSize: 11,
        fill: "#fff",
        fontFamily: "Arial",
        align: "left",
        width: this.subsectionWidth + 13,
      }
    },

    stats() {
      if (!this.subsection || !this.subsection.seats) {
        return { withStatus: 0, total: 0, percent: 0 }
      }

      let total = 0
      let withStatus = 0

      this.subsection.seats.forEach((row) => {
        row.forEach((seat) => {
          if (seat && seat.state !== "invisible") {
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

    percentageColor() {
      const percent = this.stats.percent
      if (percent >= 86) {
        return "#F44336" // Rojo
      } else if (percent >= 57) {
        return "#FF9800" // Naranja
      }
      return "#4CAF50" // Verde
    },

    seats() {
      const allSeats = []
      this.subsection.seats.forEach((row, rowIdx) => {
        row.forEach((seat, colIdx) => {
          if (seat.state !== "invisible") {
            allSeats.push({
              ...seat,
              x: colIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
              y: rowIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
              config: this.getSeatConfig(seat),
            })
          }
        })
      })
      return allSeats
    },
  },
  watch: {
    subsection: {
      deep: true,
      handler() {
        this.$forceUpdate()
      },
    },
  },
  methods: {
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

    getColLabelConfig(colIdx) {
      const labelSpacing = this.seatSpacing
      return {
        x: colIdx * labelSpacing + this.settings.SEAT_SIZE / 2,
        y: this.subsectionHeight + 5,
        text: String.fromCharCode(65 + colIdx),
        fontSize: 8,
        fill: "yellow",
        fontFamily: "Arial",
        align: "center",
        offsetX: 3,
      }
    },

    getSeatConfig(seat) {
      const COLORS = {
        SEAT_SELECTED: "#1976d2",
        SEAT_FREE: "#ffeb3b",
        SEAT_RESERVED: "lightgrey",
      }

      const CLASS_STROKE_MAP = {
        // Add your stroke map here if needed
      }

      const isReserved = seat.state === "reserved"
      const isSelected = seat.state === "selected"
      const isInSelectedArray = this.selectedSeatsArray.includes(seat.id)
      const category = seat.category ? String(seat.category).toLowerCase() : null
      const status = seat.status ? String(seat.status).toLowerCase() : null

      let stroke = isSelected ? COLORS.SEAT_SELECTED : "#757575"
      let strokeWidth = 1

      if (category) {
        try {
          const def = (this.categories || []).find((c) => String(c.label).toLowerCase() === category || String(c.value).toLowerCase() === category)
          if (def && typeof def.value !== "undefined" && def.value !== null && def.fill) {
            stroke = def.fill
            strokeWidth = 2
          } else if (CLASS_STROKE_MAP[category]) {
            stroke = CLASS_STROKE_MAP[category]
            strokeWidth = 2
          }
        } catch (err) {}
      }

      let fill = isSelected ? COLORS.SEAT_SELECTED : isReserved ? COLORS.SEAT_RESERVED : COLORS.SEAT_FREE
      if (isInSelectedArray) {
        let baseColor = "#ffeb3b"
        if (status) {
          const statusColors = {
            ocupado: "#0000ff",
            adulto: "#6B7280",
            adolescente: "#8B5CF6",
            niño: "#EC4899",
            porteador: "#F97316",
          }
          baseColor = statusColors[status] || "#ffeb3b"
        }
        fill = this.blinkState ? baseColor : "#f44336"
        strokeWidth = 0
      } else if (status) {
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
        radius: this.settings.SEAT_SIZE / 2,
        fill,
        stroke,
        strokeWidth,
        opacity: isReserved ? 0.6 : 1,
      }
    },

    handleSeatClick(seat, event) {
      this.$emit("seat-click", { seat, event })
    },
  },
}
</script>
