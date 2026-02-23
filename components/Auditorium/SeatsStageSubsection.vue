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
    <v-text v-for="rowIdx in (subsection.s || subsection.seats || []).length" :key="`row-label-${rowIdx}`" :config="getRowLabelConfig(rowIdx - 1)" />

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

    <v-group v-for="seat in seats" :key="seat.id" :config="{ x: seat.x, y: seat.y }">
      <v-circle v-if="isIOS" :config="Object.assign({}, seat.config, { x: 0, y: 0, listening: true })" @tap="handleSeatClick(seat, $event)" />
      <v-circle v-else-if="isAndroid" :config="Object.assign({}, seat.config, { x: 0, y: 0, listening: true })" @tap="handleSeatClick(seat, $event)" />
      <v-circle v-else :config="Object.assign({}, seat.config, { x: 0, y: 0, listening: true })" @click="handleSeatClick(seat, $event)" />
      <v-path v-if="seat.iconPath" :config="seat.iconPathConfig" />
      <!-- Loading spinner – comet tail arcs -->
      <template v-if="seat.isLoading">
        <v-arc v-for="(arc, i) in seat.spinnerArcs" :key="'sp-' + seat.id + '-' + i" :config="arc" />
      </template>
    </v-group>
  </v-group>
</template>

<script>
import { STATUS_COLORS, STATUS_ICONS, STATUS_CONFIG, COLORS, getPercentageColor, DEFAULT_SETTINGS } from "./constants.js"

export default {
  name: "SeatsStageSubsection",
  props: {
    subsection: { type: Object, required: true },

    categories: { type: Array, default: () => [] },
    selectedSeatsArray: { type: Array, default: () => [] },
    blinkState: { type: Boolean, default: false },
    loadingSeats: { type: Array, default: () => [] },
  },
  data() {
    return {
      isIOS: false,
      isAndroid: false,
      spinAngle: 0,
      spinInterval: null,
    }
  },
  computed: {
    seatSpacing() {
      return DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    subsectionWidth() {
      const seatsSource = this.subsection.s || this.subsection.seats
      if (!seatsSource?.length) return 0
      const maxCols = Math.max(...seatsSource.map((row) => row.length))
      return maxCols * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    subsectionHeight() {
      const seatsSource = this.subsection.s || this.subsection.seats
      if (!seatsSource?.length) return 40
      return seatsSource.length * this.seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
    },

    maxColumns() {
      const seatsSource = this.subsection.s || this.subsection.seats
      if (!this.subsection || !Array.isArray(seatsSource) || seatsSource.length === 0) return 0
      return Math.max(...seatsSource.map((row) => (row ? row.length : 0)))
    },

    subsectionTitleConfig() {
      return {
        x: 4,
        y: 5,
        text: this.subsection.n || this.subsection.name,
        fontSize: 11,
        fill: "#fff",
        fontFamily: "Arial",
        align: "left",
        width: this.subsectionWidth + 13,
      }
    },

    stats() {
      const seatsSource = this.subsection.s || this.subsection.seats
      if (!this.subsection || !seatsSource) {
        return { withStatus: 0, total: 0, percent: 0 }
      }

      let total = 0
      let withStatus = 0

      seatsSource.forEach((row) => {
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
      const seatsSource = this.subsection.s || this.subsection.seats
      if (seatsSource) {
        seatsSource.forEach((row, rowIdx) => {
          row.forEach((seat, colIdx) => {
            if (seat && seat.state !== "invisible") {
              const seatData = {
                ...seat,
                id: seat.i || seat.id,
                row: seat.r !== undefined ? seat.r : seat.row,
                col: seat.c !== undefined ? seat.c : seat.col,
                category: seat.k || seat.category,
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

              // Loading comet-tail spinner overlay
              const seatId = seat.i || seat.id
              if (this.loadingSeats.includes(seatId)) {
                seatData.isLoading = true
                const radius = DEFAULT_SETTINGS.SEAT_SIZE / 2
                // Comet segments – each one tapers thinner AND fades toward the tail.
                // inner/outer shrink symmetrically so the arc ring gets narrower.
                const SEGMENTS = [
                  { sweep: 30,  opacity: 1.00, offset:   0,  inner: radius - 1.5, outer: radius + 1.5 }, // bright head
                  { sweep: 40,  opacity: 0.89, offset: -30,  inner: radius - 1.3, outer: radius + 1.5 }, // tail 1
                  { sweep: 50,  opacity: 0.78, offset: -65,  inner: radius - 1.1, outer: radius + 1.5 }, // tail 2
                  { sweep: 55,  opacity: 0.67, offset: -108, inner: radius - 0.9, outer: radius + 1.5 }, // tail 3
                  { sweep: 55,  opacity: 0.56, offset: -155, inner: radius - 0.6, outer: radius + 1.5 }, // tail 4
                  { sweep: 50,  opacity: 0.45, offset: -200, inner: radius - 0.3, outer: radius + 1.5 }, // ghost tail
                ]
                seatData.spinnerArcs = SEGMENTS.map((seg) => ({
                  x: 0,
                  y: 0,
                  innerRadius: seg.inner,
                  outerRadius: seg.outer,
                  angle: seg.sweep,
                  rotation: (this.spinAngle + seg.offset + 360) % 360,
                  fill: '#ffffff',
                  opacity: seg.opacity,
                  listening: false,
                }))
              }

              allSeats.push(seatData)
            }
          })
        })
      }
      return allSeats
    },
  },
  mounted() {
    // Detect iOS and Android using UAParser plugin
    if (this.$uaParser) {
      this.isIOS = this.$uaParser.isIOS()
      this.isAndroid = this.$uaParser.isAndroid()
      const deviceInfo = this.$uaParser.getDeviceInfo()
      console.log("OS detected:", deviceInfo?.os.name, "isIOS:", this.isIOS, "isAndroid:", this.isAndroid)
    }
    // Spinner rotation timer
    this.spinInterval = setInterval(() => {
      this.spinAngle = (this.spinAngle + 10) % 360
    }, 50)
  },
  beforeDestroy() {
    if (this.spinInterval) clearInterval(this.spinInterval)
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
        x: colIdx * labelSpacing + DEFAULT_SETTINGS.SEAT_SIZE / 2 + 11,
        y: this.subsectionHeight + 25,
        text: String.fromCharCode(65 + colIdx),
        fontSize: 8,
        fill: "yellow",
        fontFamily: "Arial",
        align: "center",
        offsetX: 0,
      }
    },

    getSeatConfig(seat) {
      const CLASS_STROKE_MAP = {
        // Add your stroke map here if needed
      }

      // Unified statusColors at file scope
      const statusColors = STATUS_COLORS

      const isReserved = seat.state === "reserved"
      const isSelected = seat.state === "selected"
      const seatId = seat.i || seat.id
      const isInSelectedArray = this.selectedSeatsArray.includes(seatId)
      const category = (seat.k || seat.category) ? String(seat.k || seat.category).toLowerCase() : null
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
        fill = this.blinkState ? baseColor : "#808080"
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
      // Get icon_scale from STATUS_CONFIG, default to 1.8
      const iconScale = STATUS_CONFIG[status]?.icon_scale || 1.8
      const scale = (radius * iconScale) / 24 // Scale to fit within seat
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

    handleSeatClick(seat, event) {
      // console.log("Seat clicked:", seat)
      this.$emit("seat-click", { seat, event })
    },
  },
}
</script>
<style scoped>
/* Deshabilitar selección de texto y comportamientos táctiles por defecto */
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

/* Para el contenedor de Konva */
canvas {
  display: block;
  touch-action: none; /* IMPORTANTE: Previene gestos del navegador */
}
</style>
