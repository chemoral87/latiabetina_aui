<template>
  <v-container class="pa-4" style="max-width: 1000px">
    <h4 class="text-left mb-1">
      <PitcherConfigButton />
      Tuner
      <span>
        Frec:
        <strong class="text-right" style="display: inline-block; width: 50px">{{ freqDisplay }}</strong>
        Hz
      </span>
      |
      <span>({{ dBDisplay }} dB)</span>
    </h4>

    <v-row dense class="mb-1">
      <v-col cols="6">
        <v-btn color="primary" block small @click="resetHistory">
          <v-icon left>mdi-restart</v-icon>
          <span>Reiniciar</span>
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn color="warning" :disabled="!isMicActive || noiseCalibrating" :loading="noiseCalibrating" block small @click="calibrateNoise">
          <v-icon left>mdi-tune</v-icon>
          <span>Calibrar Ruido</span>
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn :color="isMicActive ? 'error' : 'success'" block small @click="toggleMic">
          <v-icon left>{{ isMicActive ? "mdi-microphone-off" : "mdi-microphone" }}</v-icon>
          <span>
            {{ isMicActive ? "Silenciar" : "Activar mic" }}
          </span>
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-select v-model="selectedRootNote" :items="currentNoteOptions" :label="latinNotation ? 'Escala Mayor' : 'Mayor Scale'" dense outlined hide-details />
      </v-col>
      <v-col cols="6">
        <v-select v-model="selectedProcessor" :items="processorOptions" label="Audio Processor" dense outlined hide-details @change="changeProcessor" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="8" md="5" class="pr-1 mx-0">
        <PitcherHistogram ref="histogramComponent" :history="history" :freq-display="freqDisplay" :last-freq="lastFreq" :cents-deviation="centsDeviation" />
      </v-col>

      <v-col cols="4" md="2" class="px-0 mx-0">
        <PitcherStaffNotation v-if="lastValidFreq" :frequency="lastValidFreq" :cents-deviation="centsDeviation" :zoom="2" :canvas-height="600" :canvas-width="300" :show-cents-deviation="true" />
      </v-col>
      <v-col cols="12">
        <PitcherUkeleleNotation v-if="lastValidFreq" :frequency="lastValidFreq" />
      </v-col>
      <v-col cols="12">
        <PitcherGuitarNotation v-if="lastValidFreq" :frequency="lastValidFreq" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// Import constants
import { A4_FREQ, A4_MIDI, NOTE_SHORT_STRINGS, NOTE_LATIN_STRINGS } from "./constants.js"

export default {
  data() {
    return {
      settingsDialog: false,
      isMicActive: false,
      audioProcessor: null, // Audio processor instance
      history: [],
      freqDisplay: "--",
      noteDisplay: "--",
      dBDisplay: "--",
      centsDeviation: null,
      lastFreq: null,
      lastValidFreq: null, // Última frecuencia válida detectada
      noiseCalibrating: false, // UI state
      selectedProcessor: "ap_gemini10", // Default processor
      processorOptions: ["ap_claude9", "ap_gemini10"],
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
    sensitivity: {
      get() {
        return this.$store.state.pitcher_store.sensitivity
      },
    },
    latinNotation: {
      get() {
        return this.$store.state.pitcher_store.latinNotation
      },
    },
    maxHistory: {
      get() {
        return this.$store.state.pitcher_store.maxHistory
      },
    },
    currentNoteOptions() {
      return this.latinNotation ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"] : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
    },
    displayFrequency() {
      // Retorna lastFreq solo si es válida, de lo contrario mantiene el valor anterior
      return this.lastFreq || this.displayFrequency
    },
  },

  created() {
    this.loadProcessor(this.selectedProcessor)
  },

  methods: {
    async loadProcessor(processorName) {
      const module = await import(`./audioProcessors/${processorName}.js`)
      this.audioProcessor = new module.AudioProcessor()
    },

    async changeProcessor() {
      if (this.isMicActive) {
        await this.cleanup()
      }
      await this.loadProcessor(this.selectedProcessor)
    },

    resetHistory() {
      this.history = []
      this.lastFreq = null
      this.lastValidFreq = null
      this.centsDeviation = null
      // Clear histogram canvas
      if (this.$refs.histogramComponent) {
        this.$refs.histogramComponent.resetCanvas()
      }
      // Reset audio processor
      this.audioProcessor.reset()
    },

    async calibrateNoise() {
      if (!this.isMicActive) {
        return
      }

      console.log("Iniciando calibración de ruido...")
      this.noiseCalibrating = true

      try {
        await this.audioProcessor.calibrateNoise()
        // Update sensitivity in store
        const newSensitivity = this.audioProcessor.getSensitivity()
        this.$store.commit("pitcher_store/SET_SENSITIVITY", newSensitivity)
      } catch (error) {
        console.error("Error during noise calibration:", error)
      } finally {
        this.noiseCalibrating = false
      }
    },

    async cleanup() {
      await this.audioProcessor.cleanupMicrophone()
      this.isMicActive = false
      this.freqDisplay = "--"
      this.noteDisplay = "--"
      this.dBDisplay = "--"
      this.centsDeviation = null
      this.history = []
      this.lastFreq = null
    },

    async toggleMic() {
      if (!this.isMicActive) {
        try {
          // Use audio processor to initialize microphone
          await this.audioProcessor.initializeMicrophone()
          this.isMicActive = true

          // Set initial sensitivity
          this.audioProcessor.setSensitivity(this.sensitivity)

          // Start calibration
          this.calibrateNoise()

          // Start the update loop
          this.update()
        } catch (e) {
          alert("Error accediendo al micrófono: " + e.message)
          this.isMicActive = false
        }
      } else {
        await this.cleanup()
      }
    },

    update() {
      if (!this.isMicActive) return

      const result = this.audioProcessor.analyzeFrequency()
      this.dBDisplay = Math.max(0, result.dB).toFixed(1)

      if (result.freq !== -1) {
        // Intentar estabilizar el ataque
        const stableFreq = this.audioProcessor.smoothFrequency(result.freq)

        // Solo si la nota es estable la procesamos y dibujamos
        if (stableFreq !== -1) {
          const exactFreq = parseFloat(stableFreq.toFixed(2))
          const midi = this.freqToMidi(exactFreq)
          const note = this.getNoteNameNum(midi)

          const nearestMidi = Math.round(midi)
          const nearestFreq = this.midiToFreq(nearestMidi)
          this.centsDeviation = Math.round(1200 * Math.log2(exactFreq / nearestFreq))

          this.freqDisplay = exactFreq.toString()
          this.noteDisplay = note
          this.lastFreq = exactFreq
          this.lastValidFreq = exactFreq // Guardar la última frecuencia válida

          this.history.unshift({ freq: stableFreq, midi })
          if (this.history.length > this.maxHistory) this.history.pop()
        } else {
          // Nota en fase de estabilización: no actualizamos displays de frecuencia
          this.freqDisplay = "--"
        }
      } else {
        this.freqDisplay = "--"
        this.noteDisplay = "--"
        this.centsDeviation = null
        this.lastFreq = null
      }

      if (this.isMicActive) requestAnimationFrame(this.update)
    },

    // Helper methods for frequency conversion
    midiToFreq(midi) {
      return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
    },

    freqToMidi(freq) {
      if (freq <= 0) return 0
      return 69 + 12 * Math.log2(freq / A4_FREQ)
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
  },
}
</script>

<style scoped>
h4 {
  font-weight: 600;
}
</style>

<style scoped>
h4 {
  font-weight: 600;
}
</style>
