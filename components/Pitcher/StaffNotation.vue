<template>
  <div class="staff-notation">
    <h5 class="text-center font-weight-regular">{{ title }}</h5>
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
import { COLORS } from "../../pages/pitcher/constants.js"

export default {
  props: {
    // Título del componente
    title: {
      type: String,
      default: "Pentagrama",
    },

    // Frecuencia actual detectada en Hz
    frequency: {
      type: Number,
      default: null,
    },

    // Desviación en cents
    centsDeviation: {
      type: Number,
      default: null,
    },

    // Mostrar notas fantasma (octavas)
    showGhostNotes: {
      type: Boolean,
      default: false,
    },

    // Usar notación latina (Do, Re, Mi) vs anglosajona (C, D, E)
    latinNotation: {
      type: Boolean,
      default: false,
    },

    // Factor de zoom del pentagrama
    zoom: {
      type: Number,
      default: 2,
    },

    // Dimensiones del canvas
    canvasHeight: {
      type: [Number, String],
      default: 600,
    },

    canvasWidth: {
      type: [Number, String],
      default: 300,
    },

    // Mostrar información de cents
    showCentsDeviation: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      ctx: null,
      trebleClefImage: null,
      bassClefImage: null,
      isReady: false,
      trebleClefPath: "/clave_sol.svg",
      bassClefPath: "/clave_fa.svg",
    }
  },

  computed: {
    canvasStyle() {
      return {
        display: "block",
        backgroundColor: "#f5f5f5",
        border: "10px solid black",
        width: "100%",
      }
    },

    tuningAccuracyClass() {
      if (this.centsDeviation === null) return ""
      const abs = Math.abs(this.centsDeviation)
      if (abs <= 5) return "tuning-perfect"
      if (abs <= 15) return "tuning-good"
      if (abs <= 30) return "tuning-fair"
      return "tuning-poor"
    },

    tuningAccuracyColor() {
      if (this.centsDeviation === null) return "grey"
      const abs = Math.abs(this.centsDeviation)
      if (abs <= 5) return "green"
      if (abs <= 15) return "light-green"
      if (abs <= 30) return "orange"
      return "red"
    },

    tuningAccuracyText() {
      if (this.centsDeviation === null) return "--"
      const abs = Math.abs(this.centsDeviation)
      if (abs <= 5) return "Perfecta afinación"
      if (abs <= 15) return "Buena afinación"
      if (abs <= 30) return "Afinación aceptable"
      return "Desafinado"
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
      if (!canvas) return

      this.ctx = canvas.getContext("2d")
      this.drawStaff()
    },

    loadClefImages() {
      // Cargar SVG de clave de Sol
      this.trebleClefImage = new Image()
      this.trebleClefImage.onload = () => {
        this.checkImagesReady()
      }
      this.trebleClefImage.onerror = () => {
        // console.warn("No se pudo cargar clave_sol.svg")
        this.trebleClefImage = null
        this.checkImagesReady()
      }
      this.trebleClefImage.src = this.trebleClefPath

      // Cargar SVG de clave de Fa
      this.bassClefImage = new Image()
      this.bassClefImage.onload = () => {
        this.checkImagesReady()
      }
      this.bassClefImage.onerror = () => {
        // console.warn("No se pudo cargar clave_fa.svg")
        this.bassClefImage = null
        this.checkImagesReady()
      }
      this.bassClefImage.src = this.bassClefPath
    },

    checkImagesReady() {
      // Esperar a que ambas imágenes intenten cargar
      if ((this.trebleClefImage === null || this.trebleClefImage.complete) && (this.bassClefImage === null || this.bassClefImage.complete)) {
        this.isReady = true
        this.drawStaff()
      }
    },

    midiToFreq(midi) {
      const A4_FREQ = 440
      const A4_MIDI = 69
      return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
    },

    freqToMidi(freq) {
      if (freq <= 0) return 0
      return 69 + 12 * Math.log2(freq / 440)
    },

    getNoteName(midiNote) {
      const NOTE_SHORT_STRINGS = ["C", "C+", "C♯", "C♯+", "D", "D+", "D♯", "D♯+", "E", "E+", "F", "F+", "F♯", "F♯+", "G", "G+", "G♯", "G♯+", "A", "A+", "A♯", "A♯+", "B", "B+"]
      const NOTE_LATIN_STRINGS = ["Do", "Do+", "Do♯", "Do♯+", "Re", "Re+", "Re♯", "Re♯+", "Mi", "Mi+", "Fa", "Fa+", "Fa♯", "Fa♯+", "Sol", "Sol+", "Sol♯", "Sol♯+", "La", "La+", "La♯", "La♯+", "Si", "Si+"]

      const noteIndex = Math.floor(midiNote) % 12
      const isHalfStep = Math.round(midiNote * 2) % 2 === 1
      const fullIndex = isHalfStep ? noteIndex * 2 + 1 : noteIndex * 2

      const noteStrings = this.latinNotation ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS
      return noteStrings[fullIndex]
    },

    drawStaff() {
      if (!this.ctx || !this.isReady) return

      const canvas = this.$refs.staffCanvas
      if (!canvas) return

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height

      // Limpiar canvas
      this.ctx.fillStyle = "#f5f5f5"
      this.ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const zoom = this.zoom
      const staffSizeRatio = 1.0 * zoom
      const baseLineSpacing = 9 * zoom

      const trebleStaffTop = 60 * staffSizeRatio
      const lineSpacing = baseLineSpacing * staffSizeRatio
      const staffWidth = canvasWidth - 40
      const staffLeft = 20

      // Coordenadas para líneas largas (pentagrama)
      const staffLineLength = 120 * staffSizeRatio
      const lineStart = staffLeft + 10
      const lineEnd = Math.min(lineStart + staffLineLength, staffLeft + staffWidth - 10)

      // Coordenadas para líneas CORTAS (ledger lines)
      // Centradas en la posición donde aparece la nota (noteX en drawNotes)
      const noteX = staffLeft + 80 * staffSizeRatio
      const shortLineHalfWidth = 20 * zoom
      const shortLineStart = noteX - shortLineHalfWidth
      const shortLineEnd = noteX + shortLineHalfWidth

      const staffSeparation = 6 * lineSpacing
      const bassStaffTop = trebleStaffTop + staffSeparation

      this.ctx.strokeStyle = "#000"
      this.ctx.lineWidth = 2

      // 1. Dibujar 3 líneas adicionales CORTAS arriba (Clave de Sol)
      for (let i = 1; i <= 2; i++) {
        const y = trebleStaffTop - i * lineSpacing
        this.ctx.beginPath()
        this.ctx.moveTo(shortLineStart, y)
        this.ctx.lineTo(shortLineEnd, y)
        this.ctx.stroke()
      }

      // 2. Dibujar Pentagrama de Sol (5 líneas LARGAS)
      for (let i = 0; i < 5; i++) {
        const y = trebleStaffTop + i * lineSpacing
        this.ctx.beginPath()
        this.ctx.moveTo(lineStart, y)
        this.ctx.lineTo(lineEnd, y)
        this.ctx.stroke()
      }

      // 3. Dibujar Línea de Do Central (C4) CORTA y permanente
      const middleCLineY = trebleStaffTop + 5 * lineSpacing
      this.ctx.beginPath()
      this.ctx.moveTo(shortLineStart, middleCLineY)
      this.ctx.lineTo(shortLineEnd, middleCLineY)
      this.ctx.stroke()

      // 4. Dibujar Pentagrama de Fa (5 líneas LARGAS)
      for (let i = 0; i < 5; i++) {
        const y = bassStaffTop + i * lineSpacing
        this.ctx.beginPath()
        this.ctx.moveTo(lineStart, y)
        this.ctx.lineTo(lineEnd, y)
        this.ctx.stroke()
      }

      // 5. Dibujar 3 líneas adicionales CORTAS abajo (Clave de Fa)
      for (let i = 1; i <= 2; i++) {
        const y = bassStaffTop + 4 * lineSpacing + i * lineSpacing
        this.ctx.beginPath()
        this.ctx.moveTo(shortLineStart, y)
        this.ctx.lineTo(shortLineEnd, y)
        this.ctx.stroke()
      }

      // Dibujar Claves (el resto del código se mantiene igual...)
      if (this.trebleClefImage && this.trebleClefImage.complete) {
        const clefWidth = 45 * staffSizeRatio
        const clefHeight = baseLineSpacing * 6.5 * staffSizeRatio
        this.ctx.drawImage(this.trebleClefImage, staffLeft + 5, trebleStaffTop - baseLineSpacing * staffSizeRatio, clefWidth, clefHeight)
      }

      if (this.bassClefImage && this.bassClefImage.complete) {
        const clefWidth = 65 * staffSizeRatio
        const clefHeight = baseLineSpacing * 6 * staffSizeRatio
        this.ctx.drawImage(this.bassClefImage, staffLeft - 3, bassStaffTop - baseLineSpacing * 1.33 * staffSizeRatio, clefWidth, clefHeight)
      } else {
        this.drawBassClef(this.ctx, staffLeft, bassStaffTop)
      }

      if (this.frequency) {
        this.drawNotes(trebleStaffTop, bassStaffTop, lineSpacing, staffLeft, staffSizeRatio, zoom)
      }
    },
    drawNotes(trebleStaffTop, bassStaffTop, lineSpacing, staffLeft, staffSizeRatio, zoom) {
      const noteX = staffLeft + 80 * staffSizeRatio
      const currentMidi = this.freqToMidi(this.frequency)
      const roundedMidi = Math.round(currentMidi)

      // Determinar si es sostenido
      const noteName = this.getNoteName(roundedMidi)
      const isSharp = noteName.includes("♯") || noteName.includes("#")

      // Calcular posición Y de la nota principal
      const { noteY, ledgerLines } = this.calculateNotePosition(roundedMidi, trebleStaffTop, bassStaffTop, lineSpacing)

      // Obtener color según la nota
      const fullIndex = (roundedMidi % 12) * 2
      const noteColor = COLORS[fullIndex]

      // Dibujar líneas adicionales
      ledgerLines.forEach((ledgerY) => {
        this.ctx.strokeStyle = "#000"
        this.ctx.lineWidth = 2 * zoom
        this.ctx.beginPath()
        this.ctx.moveTo(noteX - 20 * zoom, ledgerY)
        this.ctx.lineTo(noteX + 20 * zoom, ledgerY)
        this.ctx.stroke()
      })

      // Dibujar notas fantasma si está activado
      if (this.showGhostNotes) {
        // Nota fantasma superior (octava arriba)
        const upperMidi = roundedMidi + 12
        const upperResult = this.calculateNotePosition(upperMidi, trebleStaffTop, bassStaffTop, lineSpacing)

        this.ctx.globalAlpha = 0.45
        this.drawQuarterNote(this.ctx, noteX, upperResult.noteY, noteColor, isSharp, zoom)

        // Nota fantasma inferior (octava abajo)
        const lowerMidi = roundedMidi - 12
        const lowerResult = this.calculateNotePosition(lowerMidi, trebleStaffTop, bassStaffTop, lineSpacing)

        this.drawQuarterNote(this.ctx, noteX, lowerResult.noteY, noteColor, isSharp, zoom)
        this.ctx.globalAlpha = 1.0
      }

      // Dibujar nota principal
      this.drawQuarterNote(this.ctx, noteX, noteY, noteColor, isSharp, zoom)
    },

    calculateNotePosition(midiNote, trebleStaffTop, bassStaffTop, lineSpacing) {
      const naturalPositions = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]
      const ledgerLines = []
      let noteY

      if (midiNote >= 60) {
        // C4 (MIDI 60) y superior en clave de Sol
        const e4Midi = 64
        const positionDiff = naturalPositions[midiNote % 12] - naturalPositions[e4Midi % 12]
        const octaveDiff = Math.floor(midiNote / 12) - Math.floor(e4Midi / 12)
        const totalPositionDiff = octaveDiff * 7 + positionDiff

        noteY = trebleStaffTop + 4 * lineSpacing - totalPositionDiff * (lineSpacing / 2)

        const bottomLine = trebleStaffTop + 4 * lineSpacing

        // Línea para C4, C#4, D4, D#4
        if (midiNote >= 60 && midiNote <= 63) {
          ledgerLines.push(bottomLine + lineSpacing)
        }

        if (noteY > bottomLine + lineSpacing) {
          const linesNeeded = Math.floor((noteY - (bottomLine + lineSpacing)) / lineSpacing)
          for (let i = 1; i <= linesNeeded; i++) {
            ledgerLines.push(bottomLine + lineSpacing + i * lineSpacing)
          }
        }
      } else {
        // Notas graves en clave de Fa
        const f3Midi = 53
        const bassPositionDiff = naturalPositions[midiNote % 12] - naturalPositions[f3Midi % 12]
        const bassOctaveDiff = Math.floor(midiNote / 12) - Math.floor(f3Midi / 12)
        const bassTotalPositionDiff = bassOctaveDiff * 7 + bassPositionDiff

        noteY = bassStaffTop + lineSpacing - bassTotalPositionDiff * (lineSpacing / 2)

        // Línea para B3
        if (midiNote === 59) {
          const trebleBottomLine = trebleStaffTop + 4 * lineSpacing
          ledgerLines.push(trebleBottomLine + lineSpacing)
        }

        const bassTopLine = bassStaffTop
        if (noteY < bassTopLine) {
          const linesNeeded = Math.floor((bassTopLine - noteY) / lineSpacing)
          for (let i = 1; i <= linesNeeded; i++) {
            ledgerLines.push(bassTopLine - i * lineSpacing)
          }
        }
      }

      return { noteY, ledgerLines }
    },

    drawQuarterNote(ctx, x, y, color = "#000", isSharp = false, zoom = 1.0) {
      const stemLength = 47 * zoom

      // Dibujar símbolo # si es sostenido
      if (isSharp) {
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 3 * zoom
        ctx.font = `bold ${24 * zoom}px serif`
        ctx.strokeText("♯", x - 25 * zoom, y + 8 * zoom)

        ctx.fillStyle = color
        ctx.fillText("♯", x - 25 * zoom, y + 8 * zoom)
      }

      // Relleno con color
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.ellipse(x, y, 8 * zoom, 6 * zoom, -0.3, 0, Math.PI * 2)
      ctx.fill()

      // Contorno negro
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2 * zoom
      ctx.beginPath()
      ctx.ellipse(x, y, 9 * zoom, 7 * zoom, -0.3, 0, Math.PI * 2)
      ctx.stroke()

      // Plica con color
      ctx.strokeStyle = color
      ctx.lineWidth = 2 * zoom
      ctx.beginPath()
      ctx.moveTo(x + 7 * zoom, y - 1 * zoom)
      ctx.lineTo(x + 7 * zoom, y - stemLength)
      ctx.stroke()

      // Contorno negro de la plica
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 4 * zoom
      ctx.beginPath()
      ctx.moveTo(x + 7 * zoom, y - 1 * zoom)
      ctx.lineTo(x + 7 * zoom, y - stemLength)
      ctx.stroke()

      // Plica con color encima
      ctx.strokeStyle = color
      ctx.lineWidth = 2 * zoom
      ctx.beginPath()
      ctx.moveTo(x + 7 * zoom, y - 1 * zoom)
      ctx.lineTo(x + 7 * zoom, y - stemLength)
      ctx.stroke()
    },

    drawBassClef(ctx, x, y) {
      ctx.fillStyle = "#000"
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2

      const lineSpacing = 30
      const fLine = y + lineSpacing

      ctx.save()
      ctx.translate(x + 15, fLine)
      ctx.scale(1, 1)

      // Curva principal de la clave de Fa
      ctx.beginPath()
      ctx.arc(-5, 0, 8, Math.PI * 0.5, Math.PI * 1.5)
      ctx.arc(-5, -10, 4, Math.PI * 1.5, Math.PI * 0.5, true)
      ctx.fill()

      // Dos puntos característicos
      ctx.beginPath()
      ctx.arc(5, -5, 2.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(5, 5, 2.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    },

    // Método público para redibujar el pentagrama
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
