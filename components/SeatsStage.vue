<template>
  <v-sheet elevation="2" class="pa-2" style="background: #f5f5f5; min-height: 500px">
    <v-stage :config="stageConfig" @click="handleStageClick">
      <v-layer>
        <v-group v-for="(section, sIdx) in sections" :key="`section-${sIdx}`" :config="getSectionConfig(sIdx)">
          <v-rect v-if="!section.isLabel" :config="getSectionBgConfig(section)" />
          <v-text :config="getSectionTitleConfig(section)" />

          <template v-if="!section.isLabel">
            <v-group v-for="(sub, subIdx) in section.subsections" :key="`sub-${sIdx}-${subIdx}`" :config="getSubsectionPosition(section, subIdx)">
              <template v-if="sub.isLabel">
                <!-- <v-rect :config="getSubsectionLabelBgConfig(sub, section)" /> -->
                <!-- <v-text :config="getSubsectionLabelTextConfig(sub, section)" /> -->
              </template>

              <template v-else>
                <v-text v-for="rowIdx in sub.seats.length" :key="`row-label-${rowIdx}`" :config="getRowLabelConfig(rowIdx - 1)" />
                <v-text v-for="colIdx in getMaxColumns(sub)" :key="`col-label-${colIdx}`" :config="getColLabelConfig(colIdx - 1, sub)" />
                <v-rect :config="getSubsectionRectConfig(sub)" />
                <v-text :config="getSubsectionTitleConfig(sub)" />

                <template v-for="seat in getSubsectionSeats(sub)">
                  <v-group :key="seat.id" :config="{ x: seat.x, y: seat.y }">
                    <v-circle :config="Object.assign({}, getSeatConfig(seat), { x: 0, y: 0 })" @mouseenter="handleSeatHover" @mouseleave="handleSeatLeave" @click="handleSeatClick(seat, $event)" />
                  </v-group>
                </template>
              </template>
            </v-group>
          </template>
        </v-group>
      </v-layer>

      <v-layer>
        <v-group v-if="activeSeat" :config="{ x: tooltipPos.x, y: tooltipPos.y }">
          <v-rect :config="{ width: 110, height: 92, fill: '#333', cornerRadius: 6, opacity: 0.95 }" />
          <v-text :config="{ x: 8, y: 6, text: 'Clasificación:', fontSize: 11, fill: '#fff', fontStyle: 'bold' }" />

          <v-text :config="{ x: 8, y: 24, text: 'Servidores', fontSize: 12, fill: '#9e9e9e' }" @click="setSeatCategory(activeSeat, 'Servidores')" />
          <v-text :config="{ x: 8, y: 40, text: 'Nuevos', fontSize: 12, fill: '#1976d2' }" @click="setSeatCategory(activeSeat, 'Nuevos')" />
          <v-text :config="{ x: 8, y: 56, text: 'Incapacitados', fontSize: 12, fill: '#f44336' }" @click="setSeatCategory(activeSeat, 'Incapacitados')" />
          <v-text :config="{ x: 8, y: 72, text: 'Ninguno', fontSize: 12, fill: '#fff' }" @click="setSeatCategory(activeSeat, null)" />
        </v-group>
      </v-layer>
    </v-stage>
  </v-sheet>
</template>

<script>
import Vue from "vue"
import VueKonva from "vue-konva"
Vue.use(VueKonva)

const COLORS = {
  SEAT_SELECTED: "#1976d2",

  SEAT_FREE: "#ffeb3b", // "#1b728d",
  SEAT_RESERVED: "lightgrey",
  SECTION_BG: "#222d3b",
  SUBSECTION_BG: "#e0e0e0",
  LABEL_TEXT: "#ff9800",
}

export default {
  name: "SeatsStage",
  props: {
    sections: { type: Array, required: true },
    settings: { type: Object, required: true },
    stageConfig: { type: Object, required: true },
  },
  data() {
    return {
      activeSeat: null,
    }
  },
  computed: {
    seatSpacing() {
      return this.settings.SEAT_SIZE + this.settings.SEATS_DISTANCE
    },
    tooltipPos() {
      if (!this.activeSeat) return { x: 0, y: 0 }
      try {
        // If click handler already computed absolute tooltip position, use it
        if (this.activeSeat.isAbsolute && typeof this.activeSeat.x === "number" && typeof this.activeSeat.y === "number") {
          return { x: this.activeSeat.x, y: this.activeSeat.y }
        }

        const parts = String(this.activeSeat.id).split("-")
        const sectionIdx = Math.max(0, parseInt(parts[1], 10) - 1)
        const subIdx = Math.max(0, parseInt(parts[2], 10) - 1)
        const section = this.sections[sectionIdx]
        if (!section) return { x: this.activeSeat.x, y: this.activeSeat.y }

        const sectionPos = this.getSectionConfig(sectionIdx)
        const subPos = this.getSubsectionPosition(section, subIdx)
        const x = sectionPos.x + subPos.x + this.activeSeat.x + (this.settings.SEAT_SIZE / 2 + 6)
        const y = sectionPos.y + subPos.y + this.activeSeat.y - (this.settings.SEAT_SIZE / 2 + 8)
        return { x, y }
      } catch (err) {
        return { x: this.activeSeat.x, y: this.activeSeat.y }
      }
    },
  },
  methods: {
    getSectionConfig(sIdx) {
      const section = this.sections[sIdx]
      const y = this.sections.slice(0, sIdx).reduce((acc, s) => acc + this.getSectionHeight(s) + this.settings.SECTIONS_MARGIN, this.settings.SECTION_TOP_PADDING)
      return { x: (this.stageConfig.width - this.getSectionWidth(section)) / 2, y }
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

    getMaxColumns(sub) {
      if (!sub || !Array.isArray(sub.seats) || sub.seats.length === 0) return 0
      return Math.max(...sub.seats.map((row) => (row ? row.length : 0)))
    },

    getColLabelConfig(colIdx, sub) {
      const labelSpacing = this.seatSpacing // small extra gap between column letters
      return {
        x: colIdx * labelSpacing + this.settings.SEAT_SIZE / 2,
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
        strokeWidth = 4
      }

      return {
        x: seat.x,
        y: seat.y,
        radius: this.settings.SEAT_SIZE / 2,
        fill: isSelected ? COLORS.SEAT_SELECTED : isReserved ? COLORS.SEAT_RESERVED : COLORS.SEAT_FREE,
        stroke,
        strokeWidth,
        opacity: isReserved ? 0.6 : 1,
      }
    },

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

    // Events & interactions
    handleSeatClick(seat, e) {
      // stop Konva/native event propagation so stage click doesn't immediately close the tooltip
      try {
        if (e && e.evt && typeof e.evt.stopPropagation === "function") {
          e.evt.stopPropagation()
        } else if (e && typeof e.cancelBubble !== "undefined") {
          e.cancelBubble = true
        }
      } catch (err) {
        // ignore
      }

      // compute absolute tooltip position so it remains accurate even if seat objects are re-created
      try {
        const { sectionIdx, subIdx } = this.parseSeatId(seat.id)
        const section = this.sections[sectionIdx]
        if (section) {
          const sectionPos = this.getSectionConfig(sectionIdx)
          const subPos = this.getSubsectionPosition(section, subIdx)
          const absX = sectionPos.x + subPos.x + seat.x + (this.settings.SEAT_SIZE / 2 + 6)
          const absY = sectionPos.y + subPos.y + seat.y - (this.settings.SEAT_SIZE / 2 + 8)
          this.activeSeat = { id: seat.id, x: absX, y: absY, isAbsolute: true }
        } else {
          this.activeSeat = { id: seat.id, x: seat.x, y: seat.y, isAbsolute: false }
        }
      } catch (err) {
        this.activeSeat = { id: seat.id, x: seat.x, y: seat.y, isAbsolute: false }
      }

      this.$forceUpdate()
    },

    setSeatCategory(seat, category) {
      if (!seat) return
      const original = this.findSeatById(seat.id)
      const value = category == null ? "Ninguno" : category
      if (original) {
        this.$set(original, "category", value)
      } else {
        this.$set(seat, "category", value)
      }
      this.activeSeat = null
      this.$forceUpdate()
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
      this.$forceUpdate()
    },

    handleSeatHover(e) {
      const container = e.target.getStage().container()
      container.style.cursor = e.target.attrs.opacity < 1 ? "not-allowed" : "pointer"
    },

    handleSeatLeave(e) {
      e.target.getStage().container().style.cursor = "default"
    },
    // Parse seat id robustly: extract numeric parts and map to section/sub indexes
    parseSeatId(id) {
      if (!id) return { sectionIdx: 0, subIdx: 0 }
      const nums = String(id).match(/\d+/g)
      if (!nums || nums.length === 0) return { sectionIdx: 0, subIdx: 0 }
      // Expecting at least [section, subsection, row, col] or ['section','1','2','3'] formats
      const sectionIdx = Math.max(0, parseInt(nums[0], 10) - 1)
      const subIdx = Math.max(0, parseInt(nums[1] || 1, 10) - 1)
      return { sectionIdx, subIdx }
    },
  },
}
</script>

<style scoped></style>
