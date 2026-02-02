<template>
  <v-group :config="{ x: 0, y: 0 }">
    <v-rect
      :config="{
        x: 1,
        y: 3,
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
        x: 2,
        y: -7,
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
        x: 36,
        y: -7,
        text: `${stats.percent}%`,
        fontSize: 10,
        fill: percentageColor,
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }"
    />

    <!-- Seats -->

    <v-group v-for="seat in seats" :key="seat.id" :config="{ x: seat.x, y: seat.y, draggable: false }">
      <v-circle
        :config="Object.assign({}, seat.config, { x: 0, y: 0, listening: true, draggable: false })"
        @click="handleSeatClick(seat, $event, 'click')"
        @tap="handleSeatClick(seat, $event, 'tap')"
        @mousedown="preventDrag"
        @touchstart="preventDrag"
      />
      <v-path v-if="seat.iconPath" :config="seat.iconPathConfig" />
    </v-group>
  </v-group>
</template>

<script>
import { STATUS_COLORS, STATUS_ICONS, getPercentageColor, DEFAULT_SETTINGS } from "./constants.js"

export default {
  name: "SeatsStageSubsection",
  props: {
    subsection: { type: Object, required: true },

    categories: { type: Array, default: () => [] },
    selectedSeatsArray: { type: Array, default: () => [] },
    blinkState: { type: Boolean, default: false },
  },
  computed: {
    seatSpacing() {
      return DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    subsectionWidth() {
      if (!this.subsection.seats?.length) return 0
      const maxCols = Math.max(...this.subsection.seats.map((row) => row.length))
      return maxCols * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    subsectionHeight() {
      if (!this.subsection.seats?.length) return 40
      return this.subsection.seats.length * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    maxColumns() {
      if (!this.subsection || !Array.isArray(this.subsection.seats) || this.subsection.seats.length === 0) return 0
      return Math.max(...this.subsection.seats.map((row) => (row ? row.length : 0)))
    },

    subsectionTitleConfig() {
      return {
        x: 4,
        y: 5,
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

    percentageColor() {
      return getPercentageColor(this.stats.percent)
    },

    seats() {
      const allSeats = []
      this.subsection.seats.forEach((row, rowIdx) => {
        row.forEach((seat, colIdx) => {
          if (seat.state !== "invisible") {
            const seatData = {
              ...seat,
              x: colIdx * this.seatSpacing + DEFAULT_SETTINGS.SEAT_SIZE / 2 + 14,
              y: rowIdx * this.seatSpacing + DEFAULT_SETTINGS.SEAT_SIZE / 2 + 20,
              config: this.getSeatConfig(seat),
            }

            // Add icon path if seat has status
            const status = seat.status ? String(seat.status).toLowerCase() : null
            if (status && STATUS_ICONS[status]) {
              seatData.iconPath = STATUS_ICONS[status]
              seatData.iconPathConfig = this.getIconPathConfig(seat)
            }

            allSeats.push(seatData)
          }
        })
      })
      return allSeats
    },
  },
  methods: {
    getRowLabelConfig(rowIdx) {
      return {
        x: 3,
        y: rowIdx * this.seatSpacing + DEFAULT_SETTINGS.SEAT_SIZE / 2 + 20,
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
        x: colIdx * labelSpacing + DEFAULT_SETTINGS.SEAT_SIZE / 2 + 12,
        y: this.subsectionHeight + 25,
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

      // Unified statusColors at file scope
      const statusColors = STATUS_COLORS

      const isReserved = seat.state === "reserved"
      const isSelected = seat.state === "selected"
      const isInSelectedArray = this.selectedSeatsArray.includes(seat.id)
      const category = seat.category ? String(seat.category).toLowerCase() : null
      const status = seat.status ? String(seat.status).toLowerCase() : null

      let stroke = isSelected ? COLORS.SEAT_SELECTED : "#757575"
      let strokeWidth = 0.3

      if (category) {
        try {
          const def = (this.categories || []).find((c) => String(c.label).toLowerCase() === category || String(c.value).toLowerCase() === category)
          if (def && typeof def.value !== "undefined" && def.value !== null && def.fill) {
            stroke = def.fill
            strokeWidth = 2
          } else if (CLASS_STROKE_MAP[category]) {
            stroke = CLASS_STROKE_MAP[category]
            strokeWidth = 0
          }
        } catch (err) {}
      }

      let fill = isSelected ? COLORS.SEAT_SELECTED : isReserved ? COLORS.SEAT_RESERVED : COLORS.SEAT_FREE
      if (isInSelectedArray) {
        let baseColor = "#ffeb3b"
        if (status) {
          baseColor = statusColors[status] || "#ffeb3b"
        }
        fill = this.blinkState ? baseColor : "#f44336"
        strokeWidth = 0
      } else if (status) {
        fill = statusColors[status] || fill
      }

      return {
        radius: DEFAULT_SETTINGS.SEAT_SIZE / 2,
        fill,
        stroke,
        strokeWidth,
        opacity: isReserved ? 0.6 : 1,
      }
    },

    getIconPathConfig(seat) {
      const status = seat.status ? String(seat.status).toLowerCase() : null
      const isInSelectedArray = this.selectedSeatsArray.includes(seat.id)

      // Determine icon color based on seat background
      let iconColor = "#FFFFFF" // white by default

      // For light backgrounds (yellow), use dark icon
      if (!status) {
        iconColor = "#000000"
      }

      // If blinking, adjust color
      if (isInSelectedArray && !this.blinkState) {
        iconColor = "#FFFFFF" // white on red background
      }

      const radius = DEFAULT_SETTINGS.SEAT_SIZE / 2
      const scale = (radius * 1.8) / 24 // Scale to fit within seat (increased from 1.4 to 1.8)
      // Properly center the icon: 24 (original icon size) * scale / 2
      const offset = (24 * scale) / 2

      return {
        data: STATUS_ICONS[status] || "",
        fill: iconColor,
        scaleX: scale,
        scaleY: scale,
        x: -offset,
        y: -offset,
        listening: false, // Don't capture events on icon
      }
    },

    handleSeatClick(seat, event, actionType) {
      // console.log("Seat clicked:", seat, "Action Type:", actionType)
      this.$emit("seat-click", { seat, event })
    },

    preventDrag(event) {
      // Prevent the stage from starting a drag when clicking on a seat
      event.cancelBubble = true
      if (event.evt) {
        event.evt.stopPropagation()
      }
    },
  },
}
</script>
