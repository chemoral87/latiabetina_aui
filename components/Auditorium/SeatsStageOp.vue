<template>
  <v-sheet elevation="2" class="pa-2 stage-container" style="background: #f5f5f5; min-height: 500px; overflow-x: auto; overflow-y: hidden">
    <v-stage :config="stageConfig" @click="handleStageClick" @tap="handleStageClick">
      <v-layer>
        <v-group v-for="(section, sIdx) in sections" :key="`section-${sIdx}`" :config="getSectionConfig(sIdx)">
          <v-rect :config="getSectionBgConfig(section)" />
          <v-rect v-if="!section.isLabel" :config="getSectionBgConfig(section)" />
          <v-text :config="getSectionTitleConfig(section)" />

          <template v-if="!section.isLabel">
            <v-group
              v-for="(sub, subIdx) in section.subsections"
              :key="`sub-${sIdx}-${subIdx}`"
              :config="getSubsectionPosition(section, subIdx)"
              @click="handleSubsectionClick(sIdx, subIdx)"
              @tap="handleSubsectionClick(sIdx, subIdx)"
              @mouseenter="handleSeatHover"
              @mouseleave="handleSeatLeave"
            >
              <template v-if="sub.isLabel">
                <v-rect :config="getSubsectionLabelBgConfig(sub, section)" />
                <v-text :config="getSubsectionLabelTextConfig(sub, section)" />
              </template>

              <template v-else>
                <v-group>
                  <v-rect
                    :config="{
                      x: -15,
                      y: -17,
                      width: getSubsectionWidth(sub) + 22,
                      height: getSubsectionHeight(sub) + 31,
                      fill: 'black',
                      stroke: 'red',
                      strokeWidth: 1,
                    }"
                  />
                  <v-text v-for="rowIdx in sub.seats.length" :key="`row-label-${rowIdx}`" :config="getRowLabelConfig(rowIdx - 1)" />
                  <v-text v-for="colIdx in getMaxColumns(sub)" :key="`col-label-${colIdx}`" :config="getColLabelConfig(colIdx - 1, sub)" />
                  <v-text :config="getSubsectionTitleConfig(sub)" />
                </v-group>

                <template v-for="seat in getSubsectionSeats(sub)">
                  <v-group :key="seat.id" :config="{ x: seat.x, y: seat.y }">
                    <v-circle :config="Object.assign({}, getSeatConfig(seat), { x: 0, y: 0 })" />
                  </v-group>
                </template>
              </template>
            </v-group>
          </template>
        </v-group>
      </v-layer>
    </v-stage>
  </v-sheet>
</template>

<script>
import Vue from "vue"
import VueKonva from "vue-konva"
import { CLASS_STROKE_MAP } from "~/constants/auditorium.js"
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
  name: "SeatsStageOp",
  props: {
    sections: { type: Array, required: true },
    settings: { type: Object, required: true },
    stageConfig: { type: Object, required: true },
    categories: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {}
  },
  computed: {
    seatSpacing() {
      return this.settings.SEAT_SIZE + this.settings.SEATS_DISTANCE
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
        fill: "black", // COLORS.SECTION_BG,
        strokeWidth: 1,
        stroke: "red",
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
      const classStrokeMap = CLASS_STROKE_MAP

      let stroke = isSelected ? COLORS.SEAT_SELECTED : "#757575"
      let strokeWidth = 1

      if (category) {
        // prefer category color from passed `categories` prop when available
        try {
          const def = (this.categories || []).find((c) => String(c.label).toLowerCase() === category || String(c.value).toLowerCase() === category)
          // Do NOT apply border when the matched category represents "Ninguno" (value === null)
          if (def && typeof def.value !== "undefined" && def.value !== null && def.fill) {
            stroke = def.fill
            strokeWidth = 4
          } else if (classStrokeMap[category]) {
            stroke = classStrokeMap[category]
            strokeWidth = 4
          }
        } catch (err) {
          if (classStrokeMap[category]) {
            stroke = classStrokeMap[category]
            strokeWidth = 4
          }
        }
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
    handleSubsectionClick(sIdx, subIdx) {
      const subsectionId = `section-${sIdx + 1}-sub-${subIdx + 1}`
      console.log("Tomasin Subsection ID:", subsectionId)
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
      // Optional: handle stage background clicks if needed
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

<style scoped>
.stage-container {
  position: relative;
  width: 100%;
}

/* Mejorar scroll en mobile */
@media (max-width: 600px) {
  .stage-container {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
