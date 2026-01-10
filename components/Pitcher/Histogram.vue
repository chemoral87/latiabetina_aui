<template>
  <div>
    <h5 class="text-center font-weight-regular">Histograma de Frecuencia</h5>
    <canvas ref="histogram" :height="histogramHeight + 'px'" :width="canvasWidth + 'px'" style="display: block; background-color: black; width: 100%" />
    <div class="tuning-meter-container mt-2">
      <div class="tuning-meter-bar">
        <div class="tuning-meter-center"></div>
        <div
          v-if="centsDeviation !== null"
          class="tuning-meter-needle"
          :style="{
            left: `calc(50% + ${Math.min(50, Math.max(-50, centsDeviation))}%)`,
          }"
        >
          <div class="needle-triangle" :class="tuningAccuracyClass"></div>
        </div>
      </div>
      <div class="tuning-meter-labels">
        <span>-50</span>
        <span>0</span>
        <span>+50</span>
      </div>
    </div>
  </div>
</template>

<script>
import { COLORS, NOTE_SHORT_STRINGS, NOTE_LATIN_STRINGS, MAJOR_STEPS, MIN_MIDI, TOLERANCE_HZ, A4_FREQ, A4_MIDI, TEXT_WIDTH } from "../../pages/pitcher/constants.js"

export default {
  name: "PitcherHistogram",
  props: {
    history: {
      type: Array,
      default: () => [],
    },
    freqDisplay: {
      type: String,
      default: "--",
    },
    lastFreq: {
      type: Number,
      default: null,
    },
    centsDeviation: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      canvasWidth: 350,
      ctx: null,
      resizeTimeout: null,
    }
  },

  computed: {
    selectedRootNote: {
      get() {
        return this.$store.state.pitcher_store.selectedRootNote
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_ROOT_NOTE", value)
      },
    },
    latinNotation: {
      get() {
        return this.$store.state.pitcher_store.latinNotation
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_LATIN_NOTATION", value)
      },
    },
    showMicrotones: {
      get() {
        return this.$store.state.pitcher_store.showMicrotones
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_SHOW_MICROTONES", value)
      },
    },
    maxHistory: {
      get() {
        return this.$store.state.pitcher_store.maxHistory
      },
      // set(value) {
      //   this.$store.commit("pitcher_store/SET_MAX_HISTORY", value)
      // },
    },
    totalNotes: {
      get() {
        return this.$store.state.pitcher_store.totalNotes
      },
      // set(value) {
      //   this.$store.commit("pitcher_store/SET_TOTAL_NOTES", value)
      // },
    },
    histogramHeight: {
      get() {
        return this.$store.state.pitcher_store.histogramHeight
      },
      // set(value) {
      //   this.$store.commit("pitcher_store/SET_HISTOGRAM_HEIGHT", value)
      // },
    },
    // Removed duplicate keys for selectedRootNote, showMicrotones, latinNotation
    tuningAccuracyClass() {
      if (this.centsDeviation === null) return ""
      const abs = Math.abs(this.centsDeviation)
      if (abs <= 5) return "tuning-perfect"
      if (abs <= 15) return "tuning-good"
      if (abs <= 30) return "tuning-fair"
      return "tuning-poor"
    },

    scaleNoteIndices() {
      return this.getMajorScaleNotes(this.selectedRootNote)
    },

    currentNoteOptions() {
      return this.latinNotation ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"] : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
    },

    convertedRootNote() {
      if (this.latinNotation) {
        const angloIndex = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"].indexOf(this.selectedRootNote)
        return angloIndex >= 0 ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"][angloIndex] : "Do"
      } else {
        const latinIndex = ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"].indexOf(this.selectedRootNote)
        return latinIndex >= 0 ? ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][latinIndex] : "C"
      }
    },
  },

  watch: {
    selectedRootNote() {
      this.drawHistogram()
    },

    latinNotation() {
      this.drawHistogram()
    },

    showMicrotones() {
      this.drawHistogram()
    },

    history: {
      handler() {
        this.drawHistogram()
      },
      deep: true,
    },

    maxHistory() {
      this.drawHistogram()
    },

    totalNotes() {
      this.drawHistogram()
    },

    histogramHeight() {
      this.drawHistogram()
    },
  },

  mounted() {
    this.ctx = this.$refs.histogram.getContext("2d", {
      willReadFrequently: true,
    })
    this.ctx.lineWidth = 0.5

    this.updateCanvasSize()
    window.addEventListener("resize", this.debouncedResize)
    this.drawHistogram()
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.debouncedResize)
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
  },

  methods: {
    debouncedResize() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout)
      }
      this.resizeTimeout = setTimeout(() => {
        this.updateCanvasSize()
      }, 150)
    },

    updateCanvasSize() {
      const container = this.$el.parentElement
      if (container) {
        this.canvasWidth = Math.min(container.clientWidth - 32, 1000)
        this.$nextTick(() => {
          this.drawHistogram()
        })
      }
    },

    midiToFreq(midi) {
      return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
    },

    freqToMidi(freq) {
      if (freq <= 0) return 0
      return 69 + 12 * Math.log2(freq / 440)
    },

    getNoteNameNum(midiNote) {
      const roundedMidi = Math.round(midiNote * 2) / 2
      const noteIndex = Math.floor(roundedMidi) % 12
      const isHalfStep = roundedMidi % 1 === 0.5
      const fullIndex = isHalfStep ? noteIndex * 2 + 1 : noteIndex * 2
      const noteStrings = this.latinNotation ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS
      const note = noteStrings[fullIndex]
      const octave = Math.floor(roundedMidi / 12 - 1)
      return `${note}${octave}`
    },

    getNoteName(midiNote) {
      const noteIndex = Math.floor(midiNote) % 12
      const isHalfStep = Math.round(midiNote * 2) % 2 === 1
      const fullIndex = isHalfStep ? noteIndex * 2 + 1 : noteIndex * 2
      const noteStrings = this.latinNotation ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS
      return noteStrings[fullIndex]
    },

    getMajorScaleNotes(root) {
      const rootIndex = this.latinNotation ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"].indexOf(root) : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"].indexOf(root)
      return MAJOR_STEPS.map((step) => (rootIndex + step) % 12)
    },

    resetCanvas() {
      const canvas = this.$refs.histogram
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.drawNoteLines()
    },

    drawHistogram() {
      if (!this.ctx || !this.$refs.histogram) return

      const canvas = this.$refs.histogram
      const ctx = this.ctx
      const height = canvas.height
      const width = canvas.width
      const spacing = (width - 50) / this.maxHistory
      const len = Math.min(this.history.length, this.maxHistory)

      ctx.clearRect(0, 0, width, height)
      this.drawNoteLines()

      const currentData = this.history[0]
      if (!currentData || !currentData.freq || currentData.freq < 20 || currentData.freq > 2000) {
        for (let i = 1; i < len; i++) {
          const { freq, midi } = this.history[i]
          if (!freq || freq < 20 || freq > 2000) continue
          this.drawHistoryPoints(i, freq, midi, spacing)
        }
        return
      }

      const { freq, midi } = currentData
      const currentNoteName = this.getNoteNameNum(Math.round(midi * 2) / 2)
      const currentNoteBase = currentNoteName.replace(/[0-9+]/g, "")

      const staticDisplayText = `${currentNoteName} (${this.freqDisplay} Hz)`
      ctx.font = "bold 16px sans-serif"
      const textWidth = ctx.measureText(staticDisplayText).width

      for (let octaveOffset = -2; octaveOffset <= 4; octaveOffset++) {
        const shiftedFreq = freq * Math.pow(2, octaveOffset)
        const shiftedMidi = this.freqToMidi(shiftedFreq)
        const y = height - ((shiftedMidi - MIN_MIDI) / this.totalNotes) * height
        if (y < 0 || y > height) continue

        const x = width - TEXT_WIDTH - 5
        const shiftedNoteName = this.getNoteName(Math.round(shiftedMidi * 2) / 2)
        const shiftedNoteBase = shiftedNoteName.replace(/[0-9+]/g, "")
        const isSameNoteFamily = shiftedNoteBase === currentNoteBase
        const fullIndex = Math.round(shiftedMidi * 2) % 24

        let pointColor, textColor
        if (isSameNoteFamily) {
          pointColor = textColor = "white"
        } else {
          pointColor = textColor = COLORS[fullIndex]
        }

        ctx.fillStyle = pointColor
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = textColor
        ctx.fillText(staticDisplayText, x - textWidth - 10, y - 5)
      }

      for (let i = 1; i < len; i++) {
        const { freq, midi } = this.history[i]
        if (!freq || freq < 20 || freq > 2000) continue
        this.drawHistoryPoints(i, freq, midi, spacing)
      }
    },

    drawNoteLines() {
      if (!this.ctx || !this.$refs.histogram) return

      const canvas = this.$refs.histogram
      const ctx = this.ctx
      const height = canvas.height
      const width = canvas.width
      const scaleNoteIndices = this.getMajorScaleNotes(this.selectedRootNote)

      let currentNoteInfo = null
      if (this.history.length > 0 && this.history[0].freq) {
        const currentMidi = this.freqToMidi(this.history[0].freq)
        const roundedMidi = Math.round(currentMidi * 2) / 2
        currentNoteInfo = {
          type: roundedMidi % 1 === 0.5 ? "halfstep" : "natural",
          name: this.getNoteName(roundedMidi),
          base: this.getNoteName(roundedMidi).replace(/\+/g, ""),
          freq: this.history[0].freq,
        }
      }

      for (let i = 0; i <= this.totalNotes * 2; i++) {
        const y = height - (i / (this.totalNotes * 2)) * height
        const midi = MIN_MIDI + i / 2
        const noteIndex = Math.floor(midi) % 12
        const isHalfStep = i % 2 === 1
        const noteStrings = this.latinNotation ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS
        const noteName = isHalfStep ? noteStrings[noteIndex * 2 + 1] : noteStrings[noteIndex * 2]
        const noteBase = noteName.replace(/\+/g, "")
        const isInScale = scaleNoteIndices.includes(noteIndex)

        const style = {
          stroke: isHalfStep ? "green" : "gray",
          fill: isHalfStep ? "green" : "gray",
          lineWidth: 1,
        }

        if (currentNoteInfo) {
          const freqDistance = Math.abs(currentNoteInfo.freq - this.midiToFreq(midi))
          const isExactNote = freqDistance <= TOLERANCE_HZ / 2
          const isSameNoteType = isHalfStep === (currentNoteInfo.type === "halfstep")
          const isSameNoteFamily = noteBase === currentNoteInfo.base

          if (isSameNoteFamily && isSameNoteType) {
            if (isHalfStep) {
              style.stroke = style.fill = "yellow"
            } else {
              style.stroke = style.fill = isInScale ? "red" : "orange"
            }
            style.lineWidth = isExactNote ? 2.5 : 2
          } else if (isInScale && !isHalfStep) {
            style.stroke = style.fill = "white"
          }
        }

        ctx.strokeStyle = style.stroke
        ctx.fillStyle = style.fill
        ctx.lineWidth = style.lineWidth

        if ((this.showMicrotones && isHalfStep) || !isHalfStep) {
          ctx.beginPath()
          ctx.moveTo(5, y)
          ctx.lineTo(width - TEXT_WIDTH - 3, y)
          ctx.stroke()

          ctx.font = isHalfStep ? `bold ${style.lineWidth > 1 ? 11 : 10}px sans-serif` : `bold ${style.lineWidth > 1 ? 13 : 12}px sans-serif`
          ctx.fillText(noteName, width - TEXT_WIDTH + (isHalfStep ? 15 : 0), y + 3)
        }
      }

      ctx.strokeStyle = "#444"
      ctx.beginPath()
      ctx.moveTo(width - TEXT_WIDTH - 5, 0)
      ctx.lineTo(width - TEXT_WIDTH - 5, height)
      ctx.stroke()
    },

    drawHistoryPoints(i, freq, midi, spacing) {
      const canvas = this.$refs.histogram
      const ctx = this.ctx
      const height = canvas.height
      const width = canvas.width
      const baseFreq = freq

      for (let octaveOffset = -2; octaveOffset <= 4; octaveOffset++) {
        const shiftedFreq = baseFreq * Math.pow(2, octaveOffset)
        const shiftedMidi = this.freqToMidi(shiftedFreq)
        const y = height - ((shiftedMidi - MIN_MIDI) / this.totalNotes) * height

        if (y >= 0 && y <= height) {
          const x = width - i * spacing - TEXT_WIDTH - 5
          const fullIndex = Math.round(shiftedMidi * 2) % 24
          ctx.fillStyle = COLORS[fullIndex]
          ctx.beginPath()
          ctx.arc(x, y, 2.0, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
  },
}
</script>

<style scoped>
.tuning-meter-container {
  width: 100%;
  height: 67px;
  max-width: 600px;
  margin: 0 auto;
  padding: 10px;
}

.tuning-meter-bar {
  position: relative;
  width: 100%;
  height: 20px;
  background: linear-gradient(to right, #d32f2f 0%, #ff9800 25%, #4caf50 45%, #4caf50 55%, #ff9800 75%, #d32f2f 100%);
  border-radius: 20px;
  overflow: visible;
}

.tuning-meter-center {
  position: absolute;
  left: 50%;
  top: 0;
  width: 3px;
  height: 100%;
  background-color: white;
  transform: translateX(-50%);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

.tuning-meter-needle {
  position: absolute;
  top: -10px;
  transform: translateX(-50%);
  transition: left 0.1s ease-out;
}

.needle-triangle {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 14px solid white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.needle-triangle.tuning-perfect {
  border-top-color: #4caf50;
}

.needle-triangle.tuning-good {
  border-top-color: #8bc34a;
}

.needle-triangle.tuning-fair {
  border-top-color: #ff9800;
}

.needle-triangle.tuning-poor {
  border-top-color: #d32f2f;
}

.tuning-meter-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
  color: #aaa;
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
