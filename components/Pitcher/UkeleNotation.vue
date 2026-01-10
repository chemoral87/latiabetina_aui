<template>
  <v-card class="pa-4">
    <v-card-title class="text-h5 mb-4">
      Guitar Fretboard
      <v-chip v-if="selectedNote" color="primary" class="ml-3">Note: {{ selectedNote }}</v-chip>
    </v-card-title>

    <v-card-text>
      <!-- Controls -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-select v-model="selectedNote" :items="notes" label="Select a note" outlined dense clearable></v-select>
        </v-col>
      </v-row>

      <!-- Fretboard -->
      <div class="fretboard-container">
        <svg :width="fretboardWidth" :height="fretboardHeight" class="fretboard">
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
          <circle v-for="marker in fretMarkers" :key="'marker-' + marker" :cx="getFretX(marker) - fretSpacing / 2" :cy="fretboardHeight / 2" r="8" fill="#DEB887" opacity="0.5" />

          <!-- Double dots for 12th fret -->
          <circle :cx="getFretX(12) - fretSpacing / 2" :cy="fretboardHeight / 2 - 30" r="8" fill="#DEB887" opacity="0.5" />
          <circle :cx="getFretX(12) - fretSpacing / 2" :cy="fretboardHeight / 2 + 30" r="8" fill="#DEB887" opacity="0.5" />

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
  name: "UkeleNotation",
  props: {
    note: {
      type: String,
    },
  },
  data() {
    return {
      selectedNote: this.note,
      fretboardWidth: 900,
      fretboardHeight: 250,
      fretSpacing: 65,
      notes: ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],
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
  watch: {
    note(newVal) {
      this.selectedNote = newVal
    },
  },
  methods: {
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
      if (!this.selectedNote) return false
      const noteAtFret = this.getNoteAtFret(string, fret)
      return noteAtFret === this.selectedNote
    },
  },
}
</script>

<style scoped>
.fretboard-container {
  overflow-x: auto;
  background: linear-gradient(to bottom, #d2691e 0%, #8b4513 100%);
  border-radius: 8px;
  padding: 10px;
}

.fretboard {
  display: block;
  margin: 0 auto;
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
