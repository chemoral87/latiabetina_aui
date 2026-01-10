<template>
  <v-card class="pa-0">
    <v-card-title class="text-h6 mb-2">
      Diapasón de Guitarra
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

          <!-- String labels (E, A, D, G, B, E) -->
          <text v-for="(string, index) in strings" :key="'string-label-' + index" x="20" :y="getStringY(index) + 5" font-size="14" font-weight="bold" fill="#333">
            {{ string.name }}
          </text>

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
            <circle
              v-for="fret in 13"
              :key="'note-' + stringIndex + '-' + fret"
              :cx="getFretX(fret) - (fret === 0 ? 0 : fretSpacing / 2)"
              :cy="getStringY(stringIndex)"
              r="12"
              :fill="isNoteHighlighted(string, fret - 1) ? '#2196F3' : '#E0E0E0'"
              :opacity="isNoteHighlighted(string, fret - 1) ? 1 : 0.3"
              class="note-circle"
            />
            <text
              v-for="fret in 13"
              :key="'note-text-' + stringIndex + '-' + fret"
              :x="getFretX(fret) - (fret === 0 ? 0 : fretSpacing / 2)"
              :y="getStringY(stringIndex) + 5"
              font-size="11"
              font-weight="bold"
              text-anchor="middle"
              :fill="isNoteHighlighted(string, fret - 1) ? '#FFFFFF' : '#666'"
              class="note-text"
            >
              {{ getNoteAtFret(string, fret - 1) }}
            </text>
          </g>
        </svg>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "GuitarNotation",
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
      strings: [
        { name: "E", note: "E", octave: 4 },
        { name: "B", note: "B", octave: 3 },
        { name: "G", note: "G", octave: 3 },
        { name: "D", note: "D", octave: 3 },
        { name: "A", note: "A", octave: 2 },
        { name: "E", note: "E", octave: 2 },
      ],
      fretMarkers: [3, 5, 7, 9],
    }
  },
  computed: {
    currentNote() {
      if (!this.frequency) return null
      const midi = this.freqToMidi(this.frequency)
      const roundedMidi = Math.round(midi)
      const noteIndex = roundedMidi % 12
      return this.notes[noteIndex]
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
      const noteIndex = (startIndex + fret) % 12
      return this.notes[noteIndex]
    },
    isNoteHighlighted(string, fret) {
      if (!this.currentNote) return false
      const noteAtFret = this.getNoteAtFret(string, fret)
      return noteAtFret === this.currentNote
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
