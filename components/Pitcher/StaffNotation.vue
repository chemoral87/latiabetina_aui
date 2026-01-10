<template>
  <div class="staff-notation">
    <h5 class="text-center font-weight-regular">Pentagrama</h5>
    <canvas ref="staffCanvas" :height="canvasHeight" :width="canvasWidth" :style="canvasStyle" />
    <div v-if="showCentsDeviation" class="text-right mt-2">
      <div class="caption">
        <strong style="display: inline-block; text-align: right" :class="tuningAccuracyClass">{{ centsDeviation > 0 ? "+" : "" }}{{ centsDeviation !== null ? centsDeviation : "--" }}</strong>
        <strong>cents</strong>
      </div>
      <v-chip class="caption" small :color="tuningAccuracyColor" dark>
        {{ tuningAccuracyText }}
      </v-chip>
    </div>
  </div>
</template>

<script>
import {
  COLORS,
  NOTE_SHORT_STRINGS,
  NOTE_LATIN_STRINGS,
  NATURAL_POSITIONS,
  BASE_LINE_SPACING,
  STAFF_TOP_OFFSET,
  STEM_LENGTH,
  NOTE_X_OFFSET,
  NOTE_X_B_OFFSET, // Changed from noteXbOffset
  SHORT_LINE_HALF_WIDTH,
  CANVAS_BG_COLOR,
  SIMBOL_MARGIN,
  MARGIN_LINE,
  LINE_BASE,
} from "../../pages/pitcher/constants.js"

export default {
  props: {
    frequency: { type: Number, default: null },
    centsDeviation: { type: Number, default: null },
    zoom: { type: Number, default: 2 },
    canvasHeight: { type: [Number, String], default: 600 },
    canvasWidth: { type: [Number, String], default: 300 },
    showCentsDeviation: { type: Boolean, default: true },
  },

  data() {
    return {
      ctx: null,
      trebleClefImage: null,
      bassClefImage: null,
      isReady: false,
      lastDetectedMidi: null,
      lastDetectedColor: null,
    }
  },

  computed: {
    showGhostNotes: {
      get() {
        return this.$store.state.pitcher_store.ghostQuarterNote
      },
    },

    canvasStyle: () => ({
      display: "block",
      backgroundColor: CANVAS_BG_COLOR,
      border: "10px solid black",
      width: "100%",
    }),

    tuningMetrics() {
      if (this.centsDeviation === null) return { class: "", color: "grey", text: "--" }
      const abs = Math.abs(this.centsDeviation)
      if (abs <= 5) return { class: "tuning-perfect", color: "green", text: "Perfecta afinación" }
      if (abs <= 15) return { class: "tuning-good", color: "light-green", text: "Buena afinación" }
      if (abs <= 30) return { class: "tuning-fair", color: "orange", text: "Afinación aceptable" }
      return { class: "tuning-poor", color: "red", text: "Desafinado" }
    },

    tuningAccuracyClass() {
      return this.tuningMetrics.class
    },
    tuningAccuracyColor() {
      return this.tuningMetrics.color
    },
    tuningAccuracyText() {
      return this.tuningMetrics.text
    },
  },

  watch: {
    frequency: "drawStaff",
    showGhostNotes: "drawStaff",
    zoom: "drawStaff",
    latinNotation: "drawStaff",
  },

  mounted() {
    this.initCanvas()
    this.loadClefImages()
  },

  methods: {
    initCanvas() {
      const canvas = this.$refs.staffCanvas
      if (canvas) {
        this.ctx = canvas.getContext("2d")
        this.drawStaff()
      }
    },

    loadClefImages() {
      const paths = { treble: "/clave_sol.svg", bass: "/clave_fa.svg" }
      let loaded = 0
      const checkAllLoaded = () => {
        if (++loaded === 2) {
          this.isReady = true
          this.drawStaff()
        }
      }
      Object.entries(paths).forEach(([key, src]) => {
        const img = new Image()
        img.onload = () => {
          this[`${key}ClefImage`] = img
          checkAllLoaded()
        }
        img.onerror = () => {
          this[`${key}ClefImage`] = null
          checkAllLoaded()
        }
        img.src = src
      })
    },

    freqToMidi: (freq) => (freq <= 0 ? 0 : 69 + 12 * Math.log2(freq / 440)),

    getNoteName(midiNote) {
      const noteIndex = Math.floor(midiNote) % 12
      const isHalfStep = Math.round(midiNote * 2) % 2 === 1
      const fullIndex = isHalfStep ? noteIndex * 2 + 1 : noteIndex * 2
      return (this.latinNotation ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS)[fullIndex]
    },

    drawStaff() {
      const canvas = this.$refs.staffCanvas
      if (!this.ctx || !this.isReady || !canvas) return // Ensure canvas exists
      const { width, height } = canvas
      const lineSpacing = BASE_LINE_SPACING * this.zoom
      const trebleTop = STAFF_TOP_OFFSET * this.zoom
      const staffLeft = 20
      const noteX = staffLeft + NOTE_X_OFFSET * this.zoom
      const lineStart = staffLeft + MARGIN_LINE
      const lineEnd = Math.min(lineStart + LINE_BASE * this.zoom, width - MARGIN_LINE)
      const bassTop = trebleTop + 6 * lineSpacing

      this.ctx.fillStyle = CANVAS_BG_COLOR
      this.ctx.fillRect(0, 0, width, height)
      this.ctx.strokeStyle = "#000"
      this.ctx.lineWidth = 2

      const sStart = noteX - SHORT_LINE_HALF_WIDTH * this.zoom
      const sEnd = noteX + NOTE_X_B_OFFSET * this.zoom + SHORT_LINE_HALF_WIDTH * this.zoom

      for (let i = 1; i <= 2; i++) this.drawHorizontal(trebleTop - i * lineSpacing, sStart, sEnd)
      for (let i = 0; i < 5; i++) this.drawHorizontal(trebleTop + i * lineSpacing, lineStart, lineEnd)
      this.drawHorizontal(trebleTop + 5 * lineSpacing, sStart, sEnd)
      for (let i = 0; i < 5; i++) this.drawHorizontal(bassTop + i * lineSpacing, lineStart, lineEnd)
      for (let i = 1; i <= 2; i++) this.drawHorizontal(bassTop + 4 * lineSpacing + i * lineSpacing, sStart, sEnd)

      this.renderClefs(staffLeft, trebleTop, bassTop, lineSpacing)

      if (this.frequency) {
        this.renderNotes(trebleTop, bassTop, lineSpacing, noteX)
      }
    },

    drawHorizontal(y, start, end) {
      this.ctx.beginPath()
      this.ctx.moveTo(start, y)
      this.ctx.lineTo(end, y)
      this.ctx.stroke()
    },

    renderClefs(x, trebleTop, bassTop, lineSpacing) {
      if (this.trebleClefImage) this.ctx.drawImage(this.trebleClefImage, x + 5 - 25, trebleTop - lineSpacing, 45 * this.zoom, lineSpacing * 6.5)
      if (this.bassClefImage) {
        this.ctx.drawImage(this.bassClefImage, x - 11 - 25, bassTop - lineSpacing * 1.33, 65 * this.zoom, lineSpacing * 6)
      } else {
        this.drawBassClefFallback(x, bassTop)
      }
    },

    renderNotes(trebleTop, bassTop, lineSpacing, noteX) {
      const currentMidi = this.freqToMidi(this.frequency)
      const roundedMidi = Math.round(currentMidi)
      const noteColor = COLORS[(roundedMidi % 12) * 2]

      const drawPair = (midi, alpha = 1.0, customColor = null) => {
        const pairIsSharp = this.getNoteName(midi).match(/[♯#]/)
        const pairColor = customColor || COLORS[(midi % 12) * 2]

        // 1. Draw original Sharp Note
        const { noteY: ySharp, ledgerLines: lSharp } = this.calculateNotePos(midi, trebleTop, bassTop, lineSpacing)
        this.ctx.globalAlpha = alpha
        lSharp.forEach((ly) => {
          this.ctx.beginPath()
          this.ctx.moveTo(noteX - 20 * this.zoom, ly)
          this.ctx.lineTo(noteX + 20 * this.zoom, ly)
          this.ctx.stroke()
        })
        this.drawQuarterNote(noteX, ySharp, pairColor, pairIsSharp, false)

        // 2. Draw enharmonic Flat Note if applicable
        if (pairIsSharp) {
          const flatMidi = midi + 1 // Move to flat position (e.g., D position for Db)
          const flatX = noteX + NOTE_X_B_OFFSET * this.zoom // Use imported constant
          const { noteY: yFlat, ledgerLines: lFlat } = this.calculateNotePos(flatMidi, trebleTop, bassTop, lineSpacing)

          lFlat.forEach((ly) => {
            this.ctx.beginPath()
            this.ctx.moveTo(flatX - 20 * this.zoom, ly)
            this.ctx.lineTo(flatX + 20 * this.zoom, ly)
            this.ctx.stroke()
          })
          this.drawQuarterNote(flatX, yFlat, pairColor, false, true)
        }
      }

      // Dibujar la última nota detectada con opacidad reducida (si existe y es diferente)
      if (this.lastDetectedMidi !== null && this.lastDetectedMidi !== roundedMidi) {
        drawPair(this.lastDetectedMidi, 0.3, this.lastDetectedColor)
      }

      if (this.showGhostNotes) {
        drawPair(roundedMidi + 12, 0.45)
        drawPair(roundedMidi - 12, 0.45)
      }
      drawPair(roundedMidi, 1.0)
      this.ctx.globalAlpha = 1.0

      // Guardar la nota actual como última detectada
      this.lastDetectedMidi = roundedMidi
      this.lastDetectedColor = noteColor
    },

    calculateNotePos(midi, trebleTop, bassTop, lineSpacing) {
      const isTreble = midi >= 60
      const refMidi = isTreble ? 64 : 53
      const refY = isTreble ? trebleTop + 4 * lineSpacing : bassTop + lineSpacing
      const totalDiff = (Math.floor(midi / 12) - Math.floor(refMidi / 12)) * 7 + (NATURAL_POSITIONS[midi % 12] - NATURAL_POSITIONS[refMidi % 12]) // Use imported constant
      const noteY = refY - totalDiff * (lineSpacing / 2)
      const ledgerLines = []

      if (isTreble) {
        const bottom = trebleTop + 4 * lineSpacing
        if (noteY > bottom + lineSpacing) {
          const count = Math.floor((noteY - (bottom + lineSpacing)) / lineSpacing)
          for (let i = 1; i <= count; i++) ledgerLines.push(bottom + lineSpacing + i * lineSpacing)
        }
      } else if (noteY < bassTop) {
        const count = Math.floor((bassTop - noteY) / lineSpacing)
        for (let i = 1; i <= count; i++) ledgerLines.push(bassTop - i * lineSpacing)
      }
      return { noteY, ledgerLines }
    },

    drawQuarterNote(x, y, color, isSharp, isFlat) {
      const z = this.zoom

      if (isSharp) {
        this.ctx.font = `bold ${24 * z}px serif`
        this.ctx.strokeText("♯", x - SIMBOL_MARGIN * z, y + 8 * z)
        this.ctx.fillStyle = color
        this.ctx.fillText("♯", x - SIMBOL_MARGIN * z, y + 8 * z)
      }

      if (isFlat) {
        this.ctx.font = `bold ${24 * z}px serif`
        this.ctx.strokeText("♭", x - SIMBOL_MARGIN * z, y + 8 * z)
        this.ctx.fillStyle = color
        this.ctx.fillText("♭", x - SIMBOL_MARGIN * z, y + 8 * z)
      }

      this.ctx.fillStyle = color
      this.ctx.strokeStyle = "#000"
      this.ctx.lineWidth = 2 * z
      this.ctx.beginPath()
      this.ctx.ellipse(x, y, 8 * z, 6 * z, -0.3, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(x + 7 * z, y - 1 * z)
      this.ctx.lineTo(x + 7 * z, y - STEM_LENGTH * z)
      this.ctx.stroke()
    },

    drawBassClefFallback(x, y) {
      this.ctx.fillStyle = "#000"
      this.ctx.save()
      this.ctx.translate(x + 15, y + 30)
      this.ctx.beginPath()
      this.ctx.arc(-5, 0, 8, Math.PI * 0.5, Math.PI * 1.5)
      this.ctx.arc(-5, -10, 4, Math.PI * 1.5, Math.PI * 0.5, true)
      this.ctx.fill()
      this.ctx.beginPath()
      this.ctx.arc(5, -5, 2.5, 0, Math.PI * 2)
      this.ctx.arc(5, 5, 2.5, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.restore()
    },

    redraw() {
      this.drawStaff()
    },
  },
}
</script>

<style scoped>
.staff-notation {
  width: 100%;
}
.tuning-perfect {
  color: #4caf50 !important;
  font-weight: bold;
}
.tuning-good {
  color: #8bc34a !important;
}
.tuning-fair {
  color: #ff9800 !important;
}
.tuning-poor {
  color: #d32f2f !important;
}
</style>
