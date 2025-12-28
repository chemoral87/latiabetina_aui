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
    </v-row>

    <v-row dense>
      <v-col cols="8" md="5" class="pr-1 mx-0">
        <PitcherHistogram ref="histogramComponent" :history="history" :freq-display="freqDisplay" :last-freq="lastFreq" :cents-deviation="centsDeviation" />
      </v-col>

      <v-col cols="4" md="2" class="px-0 mx-0">
        <PitcherStaffNotation :frequency="lastFreq" :cents-deviation="centsDeviation" :zoom="2" :canvas-height="600" :canvas-width="300" :show-cents-deviation="true" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// Import the constants that are still needed
import { A4_FREQ, A4_MIDI, NOTE_SHORT_STRINGS, NOTE_LATIN_STRINGS } from "./constants.js"

export default {
  data() {
    return {
      settingsDialog: false,
      isMicActive: false,
      mediaStream: null,
      audioContext: null,
      analyser: null,
      buffer: null,
      history: [],
      freqDisplay: "--",
      noteDisplay: "--",
      dBDisplay: "--",
      centsDeviation: null,

      lastFreq: null,
      correlationArray: [],

      noiseProfile: null,
      noiseCalibrating: false,
      noiseSamples: [],
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
      set(value) {
        this.$store.commit("pitcher_store/SET_SENSITIVITY", value)
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
    ghostQuarterNote: {
      get() {
        return this.$store.state.pitcher_store.ghostQuarterNote
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_GHOST_QUARTER_NOTE", value)
      },
    },
    maxHistory: {
      get() {
        return this.$store.state.pitcher_store.maxHistory
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_MAX_HISTORY", value)
      },
    },

    currentNoteOptions() {
      return this.latinNotation ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"] : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
    },
  },

  beforeUnmount() {
    if (this.isMicActive) {
      this.cleanup()
    }
  },

  methods: {
    resetHistory() {
      this.history = []
      this.lastFreq = null
      this.centsDeviation = null
      // Clear histogram canvas
      if (this.$refs.histogramComponent) {
        this.$refs.histogramComponent.resetCanvas()
      }
    },

    calibrateNoise() {
      if (!this.analyser || !this.isMicActive) {
        return
      }
      console.log("Iniciando calibración de ruido...")
      this.noiseCalibrating = true
      this.noiseSamples = []

      const captureNoise = () => {
        if (this.noiseSamples.length < 180 && this.analyser && this.noiseCalibrating) {
          this.analyser.getFloatTimeDomainData(this.buffer)

          let sumSquares = 0
          for (let i = 0; i < this.buffer.length; i++) {
            sumSquares += this.buffer[i] * this.buffer[i]
          }
          const rms = Math.sqrt(sumSquares / this.buffer.length)
          this.noiseSamples.push(rms)

          setTimeout(captureNoise, 16)
        } else if (this.noiseSamples.length > 0) {
          const sortedSamples = [...this.noiseSamples].sort((a, b) => a - b)

          const p10Index = Math.floor(sortedSamples.length * 0.1)
          const p90Index = Math.floor(sortedSamples.length * 0.9)
          const filteredSamples = sortedSamples.slice(p10Index, p90Index)

          const avgNoise = filteredSamples.reduce((a, b) => a + b, 0) / filteredSamples.length
          const medianIndex = Math.floor(filteredSamples.length / 2)
          const medianNoise = filteredSamples[medianIndex]

          this.noiseProfile = (avgNoise + medianNoise) / 2

          const recommendedSensitivity = Math.max(0.003, Math.min(0.12, this.noiseProfile * 3.5))
          this.sensitivity = recommendedSensitivity

          this.noiseCalibrating = false
        } else {
          this.noiseCalibrating = false
        }
      }

      captureNoise()
    },

    async cleanup() {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop())
        this.mediaStream = null
      }
      if (this.audioContext && this.audioContext.state !== "closed") {
        await this.audioContext.close()
        this.audioContext = null
      }
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
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          })

          this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
          this.analyser = this.audioContext.createAnalyser()
          this.analyser.fftSize = 2048
          this.buffer = new Float32Array(this.analyser.fftSize)

          const source = this.audioContext.createMediaStreamSource(this.mediaStream)
          source.connect(this.analyser)

          this.isMicActive = true
          this.calibrateNoise()
          this.update() // Start the update loop
        } catch (e) {
          alert("Error accediendo al micrófono: " + e.message)
          this.isMicActive = false
        }
      } else {
        await this.cleanup()
      }
    },

    smoothFrequency(currentFreq) {
      if (!this.lastFreq) {
        this.lastFreq = currentFreq
        return currentFreq
      }

      const OCTAVE_THRESHOLD_LOW = 1.8
      const OCTAVE_THRESHOLD_HIGH = 2.2
      const HALF_OCTAVE_THRESHOLD_LOW = 0.45
      const HALF_OCTAVE_THRESHOLD_HIGH = 0.55

      const ratio = currentFreq / this.lastFreq

      if (ratio > OCTAVE_THRESHOLD_LOW && ratio < OCTAVE_THRESHOLD_HIGH) {
        currentFreq = (currentFreq + this.lastFreq * 2) * 0.5
      } else if (ratio > HALF_OCTAVE_THRESHOLD_LOW && ratio < HALF_OCTAVE_THRESHOLD_HIGH) {
        currentFreq = (currentFreq + this.lastFreq * 0.5) * 0.5
      }

      const SMOOTHING_FACTOR = 0.3
      this.lastFreq = this.lastFreq * (1 - SMOOTHING_FACTOR) + currentFreq * SMOOTHING_FACTOR

      return this.lastFreq
    },

    autoCorrelate(buf, sampleRate) {
      const SIZE = buf.length
      const MIN_DB = 28
      const MIN_SAMPLE_THRESHOLD = 0.008
      const PEAK_THRESHOLD_FACTOR = 0.2
      const WINDOW_PADDING = 10

      let sumSquares = 0
      let maxSample = 0

      for (let i = 0; i < SIZE; i++) {
        const sample = buf[i]
        sumSquares += sample * sample
        if (Math.abs(sample) > maxSample) maxSample = Math.abs(sample)
      }

      const rms = Math.sqrt(sumSquares / SIZE)
      const dBSPL = 20 * Math.log10(rms / 0.00002)
      this.dBDisplay = Math.max(0, dBSPL).toFixed(1)

      if (dBSPL < MIN_DB || rms < this.sensitivity || maxSample < MIN_SAMPLE_THRESHOLD) {
        this.freqDisplay = "--"
        this.noteDisplay = "--"
        return -1
      }

      const threshold = maxSample * PEAK_THRESHOLD_FACTOR
      let start = 0
      let end = SIZE - 1

      for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buf[i]) > threshold) {
          start = Math.max(0, i - WINDOW_PADDING)
          break
        }
      }

      for (let i = SIZE - 1; i > SIZE / 2; i--) {
        if (Math.abs(buf[i]) > threshold) {
          end = Math.min(SIZE - 1, i + WINDOW_PADDING)
          break
        }
      }

      const windowSize = end - start
      if (windowSize <= 0) return -1

      if (!this.correlationArray || this.correlationArray.length < windowSize) {
        this.correlationArray = new Float32Array(windowSize)
      }

      for (let lag = 0; lag < windowSize; lag++) {
        let sum = 0
        for (let i = 0; i < windowSize - lag; i++) {
          sum += buf[start + i] * buf[start + i + lag]
        }
        this.correlationArray[lag] = sum
      }

      let dipIndex = 0
      while (dipIndex < windowSize - 1 && this.correlationArray[dipIndex] > this.correlationArray[dipIndex + 1]) {
        dipIndex++
      }

      let maxVal = -Infinity
      let peakIndex = -1
      for (let i = dipIndex; i < windowSize; i++) {
        if (this.correlationArray[i] > maxVal) {
          maxVal = this.correlationArray[i]
          peakIndex = i
        }
      }

      if (peakIndex <= 0) return -1

      let betterPeak = peakIndex
      if (peakIndex > 0 && peakIndex < windowSize - 1) {
        const y1 = this.correlationArray[peakIndex - 1]
        const y2 = this.correlationArray[peakIndex]
        const y3 = this.correlationArray[peakIndex + 1]
        const delta = (y1 - y3) / (2 * (y1 - 2 * y2 + y3))
        if (!isNaN(delta) && Math.abs(delta) < 1) {
          betterPeak = peakIndex + delta
        }
      }

      let freq = sampleRate / betterPeak

      const checkHarmonic = (divisor, thresholdRatio) => {
        const subIndex = Math.floor(peakIndex / divisor)
        if (subIndex > 0 && subIndex < windowSize) {
          const subVal = this.correlationArray[subIndex]
          if (subVal > thresholdRatio * maxVal) {
            return sampleRate / subIndex
          }
        }
        return freq
      }

      if (freq > 0 && freq < 2000) {
        if (freq > 160 && freq < 800) {
          freq = checkHarmonic(2, 0.8)
        } else if (freq > 240 && freq < 1200) {
          freq = checkHarmonic(3, 0.7)
        }
      }

      return freq > 20 && freq < 2000 ? freq : -1
    },

    update() {
      if (!this.analyser || !this.isMicActive) {
        return
      }

      this.analyser.getFloatTimeDomainData(this.buffer)
      const rawFreq = this.autoCorrelate(this.buffer, this.audioContext.sampleRate)

      if (rawFreq !== -1) {
        let correctedFreq = rawFreq

        if (rawFreq > 180 && rawFreq < 220) {
          const possibleFreq = rawFreq / 2
          const midi = this.freqToMidi(possibleFreq)
          if (midi >= 48 && midi <= 84) {
            correctedFreq = possibleFreq
          }
        }

        const smoothedFreq = this.smoothFrequency(correctedFreq)
        const exactFreq = parseFloat(smoothedFreq.toFixed(2))
        const midi = this.freqToMidi(exactFreq)
        const note = this.getNoteNameNum(midi)

        const nearestMidi = Math.round(midi)
        const nearestFreq = this.midiToFreq(nearestMidi)
        this.centsDeviation = Math.round(1200 * Math.log2(exactFreq / nearestFreq))

        this.freqDisplay = exactFreq.toString()
        this.noteDisplay = note

        this.history.unshift({ freq: exactFreq, midi })
        if (this.history.length > this.maxHistory) this.history.pop()
      } else {
        this.freqDisplay = "--"
        this.noteDisplay = "--"
        this.dBDisplay = "--"
        this.centsDeviation = null
      }

      if (this.isMicActive) requestAnimationFrame(this.update)
    },

    // Need to keep these helper methods for update() to work
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

      // Use imported constants instead of inline arrays
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
