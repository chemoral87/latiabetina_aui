<template>
  <v-card class="pa-0">
    <v-card-title class="text-h6 mb-2">
      Diapasón de Ukelele
      <v-chip v-if="currentNote" color="primary" class="ml-2" small>Nota: {{ currentNote }}</v-chip>
    </v-card-title>

    <v-card-text class="">
      <!-- Fretboard -->
      <div class="fretboard-container">
        <svg :viewBox="`0 0 ${fretboardWidth} ${fretboardHeight}`" class="fretboard" preserveAspectRatio="xMidYMid meet">
          <!-- Fret lines -->
          <line v-for="fret in 13" :key="'fret-' + fret" :x1="getFretX(fret - 1)" y1="20" :x2="getFretX(fret - 1)" :y2="fretboardHeight - 20" stroke="#8B7355" :stroke-width="fret === 1 ? 6 : 2" />

          <!-- Strings -->
          <line v-for="(string, index) in strings" :key="'string-' + index" x1="60" :y1="getStringY(index)" :x2="fretboardWidth - 20" :y2="getStringY(index)" stroke="#C0C0C0" :stroke-width="1 + index * 0.3" />

          <!-- Fret numbers -->
          <text v-for="fret in 12" :key="'fret-num-' + fret" :x="getFretX(fret) - fretSpacing / 2" :y="fretboardHeight - 5" font-size="12" text-anchor="middle" fill="#666">
            {{ fret }}
          </text>

          <!-- Fret markers (dots) -->
          <circle v-for="marker in fretMarkers" :key="'marker-' + marker" :cx="getFretX(marker) - fretSpacing / 2" :cy="fretboardHeight / 2" r="8" fill="red" opacity="0.5" />

          <!-- Double dots for 12th fret -->
          <circle :cx="getFretX(12) - fretSpacing / 2" :cy="fretboardHeight / 2 - 30" r="8" fill="red" opacity="0.5" />
          <circle :cx="getFretX(12) - fretSpacing / 2" :cy="fretboardHeight / 2 + 30" r="8" fill="red" opacity="0.5" />

          <!-- Notes on fretboard -->
          <g v-for="(string, stringIndex) in strings" :key="'notes-' + stringIndex">
            <!-- Cuerda al aire (traste 0) -->
            <circle :cx="getFretX(0) - 30" :cy="getStringY(stringIndex)" r="12" :fill="getNoteColor(string, -1)" :opacity="getNoteOpacity(string, -1)" class="note-circle" />
            <text :x="getFretX(0) - 30" :y="getStringY(stringIndex) + 5" font-size="11" font-weight="bold" text-anchor="middle" :fill="getNoteTextColor(string, -1)" class="note-text">
              {{ getNoteAtFret(string, -1) }}
            </text>

            <!-- Notas en los trastes 1-12 -->
            <circle
              v-for="fret in 12"
              :key="'note-' + stringIndex + '-' + fret"
              :cx="getFretX(fret) - fretSpacing / 2"
              :cy="getStringY(stringIndex)"
              r="12"
              :fill="getNoteColor(string, fret)"
              :opacity="getNoteOpacity(string, fret)"
              class="note-circle"
            />
            <text
              v-for="fret in 12"
              :key="'note-text-' + stringIndex + '-' + fret"
              :x="getFretX(fret) - fretSpacing / 2"
              :y="getStringY(stringIndex) + 5"
              font-size="11"
              font-weight="bold"
              text-anchor="middle"
              :fill="getNoteTextColor(string, fret)"
              class="note-text"
            >
              {{ getNoteAtFret(string, fret) }}
            </text>
          </g>
        </svg>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { COLORS, COLOR_NEEDS_WHITE_TEXT } from "../../pages/pitcher/constants.js"

export default {
  name: "UkeleNotation",
  props: {
    frequency: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      fretboardWidth: 900,
      fretboardHeight: 250,
      fretSpacing: 65,
      notes: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
      latinNotes: ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"],
      strings: [
        { name: "A", note: "A", octave: 4 }, // Primera cuerda (la más aguda)
        { name: "E", note: "E", octave: 4 }, // Segunda cuerda
        { name: "C", note: "C", octave: 4 }, // Tercera cuerda
        { name: "G", note: "G", octave: 3 }, // Cuarta cuerda
        { name: "D", note: "D", octave: 3 }, // Quinta cuerda
        { name: "A", note: "A", octave: 2 }, // Sexta cuerda (la más grave)
      ],
      fretMarkers: [3, 5, 7, 9],
    }
  },
  computed: {
    showGhostNotes: {
      get() {
        return this.$store.state.pitcher_store.ghostQuarterNote
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
    currentNote() {
      if (!this.frequency) return null
      const midi = this.freqToMidi(this.frequency)
      const roundedMidi = Math.round(midi)
      const noteIndex = roundedMidi % 12
      const octave = Math.floor(roundedMidi / 12) - 1
      const noteName = this.latinNotation ? this.latinNotes[noteIndex] : this.notes[noteIndex]
      return `${noteName}${octave}`
    },
  },
  methods: {
    freqToMidi(freq) {
      if (freq <= 0) return 0
      return 69 + 12 * Math.log2(freq / 440)
    },
    getFretX(fret) {
      return 60 + fret * this.fretSpacing
    },
    getStringY(stringIndex) {
      const stringSpacing = (this.fretboardHeight - 80) / 5
      return 40 + stringIndex * stringSpacing
    },
    getNoteAtFret(string, fret) {
      const startIndex = this.notes.indexOf(string.note)
      // Para cuerdas al aire (fret = -1), usamos fret = 0 en el cálculo
      const actualFret = fret === -1 ? 0 : fret
      const noteIndex = (startIndex + actualFret) % 12
      const noteArray = this.latinNotation ? this.latinNotes : this.notes
      const noteName = noteArray[noteIndex]

      // Calcular la octava
      const octaveOffset = Math.floor((startIndex + actualFret) / 12)
      const octave = string.octave + octaveOffset

      return `${noteName}${octave}`
    },
    getNoteHighlightType(string, fret) {
      if (!this.currentNote) return "none"
      const noteAtFret = this.getNoteAtFret(string, fret)

      // Comparar la nota completa CON la octava
      if (noteAtFret === this.currentNote) return "exact"

      // Si showGhostNotes está activo, verificar octavas adyacentes
      if (this.showGhostNotes) {
        const currentNoteWithoutOctave = this.currentNote.replace(/\d+$/, "")
        const currentOctave = parseInt(this.currentNote.match(/\d+$/)?.[0] || "0")
        const noteAtFretWithoutOctave = noteAtFret.replace(/\d+$/, "")
        const fretOctave = parseInt(noteAtFret.match(/\d+$/)?.[0] || "0")

        // Si es la misma nota pero octava ±1
        if (noteAtFretWithoutOctave === currentNoteWithoutOctave && Math.abs(fretOctave - currentOctave) === 1) {
          return "adjacent"
        }
      }

      return "none"
    },
    isNoteHighlighted(string, fret) {
      return this.getNoteHighlightType(string, fret) !== "none"
    },
    getNoteColor(string, fret) {
      const type = this.getNoteHighlightType(string, fret)
      if (type === "none") return "#E0E0E0" // Gris por defecto

      // Calcular el MIDI de la nota en el traste
      const noteAtFret = this.getNoteAtFret(string, fret)
      const noteWithoutOctave = noteAtFret.replace(/\d+$/, "")
      const octave = parseInt(noteAtFret.match(/\d+$/)?.[0] || "0")

      // Encontrar el índice de la nota
      const noteArray = this.latinNotation ? this.latinNotes : this.notes
      const noteIndex = noteArray.indexOf(noteWithoutOctave)
      const midiNote = (octave + 1) * 12 + noteIndex

      // Usar el color del array COLORS
      const colorIndex = (midiNote % 12) * 2
      return COLORS[colorIndex]
    },
    getNoteOpacity(string, fret) {
      const type = this.getNoteHighlightType(string, fret)
      if (type === "exact") return 1
      if (type === "adjacent") return 0.5
      return 0.3
    },
    getNoteTextColor(string, fret) {
      const type = this.getNoteHighlightType(string, fret)
      if (type === "none") return "#666"

      // Calcular el MIDI de la nota en el traste
      const noteAtFret = this.getNoteAtFret(string, fret)
      const noteWithoutOctave = noteAtFret.replace(/\d+$/, "")
      const octave = parseInt(noteAtFret.match(/\d+$/)?.[0] || "0")

      // Encontrar el índice de la nota
      const noteArray = this.latinNotation ? this.latinNotes : this.notes
      const noteIndex = noteArray.indexOf(noteWithoutOctave)
      const midiNote = (octave + 1) * 12 + noteIndex

      // Verificar si necesita texto blanco
      const colorIndex = (midiNote % 12) * 2
      return COLOR_NEEDS_WHITE_TEXT[colorIndex] ? "#FFFFFF" : "#666"
    },
  },
}
</script>

<style scoped>
.fretboard-container {
  width: 100%;
  border-radius: 8px;
  padding: 4px;
  overflow: hidden;
}

.fretboard {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
}

.note-circle {
  cursor: pointer;
  transition: all 0.3s ease;
}

.note-circle:hover {
  opacity: 0.8 !important;
  r: 14;
}

.note-text {
  pointer-events: none;
  font-family: "Roboto", sans-serif;
}
</style>
