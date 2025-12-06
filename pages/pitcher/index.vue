<template>
  <v-container class="pa-4" style="max-width: 1000px">
    <h4 class="text-left mb-4">
      <v-btn icon @click="settingsDialog = true">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
      Tuner
      <span>
        Frec:
        <strong>{{ freqDisplay }}</strong>
        Hz
      </span>
      |
      <span>({{ dBDisplay }} dB)</span>
      <span v-if="centsDeviation !== null" class="ml-2">
        |
        <strong :class="tuningAccuracyClass">{{ centsDeviation > 0 ? "+" : "" }}{{ centsDeviation }} cents</strong>
      </span>
    </h4>

    <!-- Tuning Accuracy Indicator -->
    <v-row dense class="mb-2">
      <v-col cols="12">
        <div class="tuning-meter-container">
          <div class="tuning-meter-bar">
            <div class="tuning-meter-center"></div>
            <div v-if="centsDeviation !== null" class="tuning-meter-needle" :style="{ left: `calc(50% + ${centsDeviation}%)` }">
              <div class="needle-triangle" :class="tuningAccuracyClass"></div>
            </div>
          </div>
          <div class="tuning-meter-labels">
            <span>-50</span>
            <span>0</span>
            <span>+50</span>
          </div>
          <div v-if="centsDeviation !== null" class="text-center mt-1">
            <v-chip small :color="tuningAccuracyColor" dark>
              {{ tuningAccuracyText }}
            </v-chip>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row align="center" justify="center" dense>
      <v-col cols="auto">
        <v-btn color="primary" class="mr-1" @click="resetHistory">
          <v-icon>mdi-restart</v-icon>
          <span class="d-none d-sm-inline">Reiniciar</span>
        </v-btn>
        <v-btn color="warning" class="mr-1" :disabled="!isMicActive || noiseCalibrating" :loading="noiseCalibrating" @click="calibrateNoise">
          <v-icon>mdi-tune</v-icon>
          <span class="d-none d-sm-inline">Calibrar Ruido</span>
        </v-btn>
        <v-btn :color="isMicActive ? 'error' : 'success'" @click="toggleMic">
          <v-icon>{{ isMicActive ? "mdi-microphone-off" : "mdi-microphone" }}</v-icon>
          <span class="d-none d-sm-inline">
            {{ isMicActive ? "Silenciar" : "Activar mic" }}
          </span>
        </v-btn>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-select v-model="selectedRootNote" :items="currentNoteOptions" :label="latinNotation ? 'Nota Raíz' : 'Root Note'" dense outlined hide-details />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" class="px-0 mx-0">
        <canvas ref="histogram" height="500px" :width="canvasWidth + 'px'" style="display: block; background-color: black" />
      </v-col>
    </v-row>
    <!-- Spectrogram -->
    <v-row dense class="mt-2">
      <v-col cols="12" class="px-0 mx-0">
        <h5 class="text-center mb-1">Espectrograma en tiempo real</h5>
        <canvas ref="spectrogram" height="150px" :width="canvasWidth + 'px'" style="display: block; background-color: #1a1a1a" />
      </v-col>
    </v-row>
    <!-- Modal Dialog -->
    <v-dialog v-model="settingsDialog" max-width="500px">
      <v-card>
        <v-card-title>
          Configuración v2.023
          <v-spacer></v-spacer>
          <v-btn icon @click="settingsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-switch v-model="latinNotation" label="Notación latina" hide-details class="mt-0 pt-0"></v-switch>
            </v-col>
            <v-col cols="12" sm="6">
              <v-switch v-model="showMicrotones" :label="latinNotation ? 'Mostrar microtonos' : 'Show microtones'" hide-details class="mt-0 pt-0"></v-switch>
            </v-col>
            <v-col cols="12" sm="6">
              <v-slider v-model="sensitivity" :min="0.0001" :max="0.01" :step="0.0001" label="Sensibilidad" hide-details thumb-label />
              <div class="text-center font-weight-bold">
                {{ sensitivity.toFixed(4) }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <v-slider v-model="maxHistory" :min="300" :max="800" :step="50" label="Máx Historial" hide-details thumb-label />
              <div class="text-center font-weight-bold">
                {{ maxHistory }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <v-slider v-model="totalNotes" :min="13" :max="25" :step="1" label="# Notas" hide-details thumb-label />
              <div class="text-center font-weight-bold">
                {{ totalNotes }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="settingsDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { COLORS, NOTE_SHORT_STRINGS, NOTE_LATIN_STRINGS, MAJOR_STEPS, MIN_MIDI, TOLERANCE_HZ, A4_FREQ, A4_MIDI, TEXT_WIDTH } from "./constants.js"

export default {
  data() {
    return {
      settingsDialog: false,
      canvasWidth: 350,
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

      // Sistema de filtrado de ruido de fondo
      noiseProfile: null,
      noiseCalibrating: false,
      noiseSamples: [],

      // Spectrogram
      spectrogramCtx: null,
      spectrogramData: [],
      maxSpectrogramHistory: 100,
      smoothedSpectrogramData: null, // For temporal smoothing
      spectrogramSmoothingFactor: 0.3, // Higher = more smoothing

      // Performance optimization
      lastHistogramDraw: 0,
      lastSpectrogramUpdate: 0,
      histogramThrottle: 50, // ms between histogram redraws
      spectrogramThrottle: 100, // ms between spectrogram updates
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
    maxHistory: {
      get() {
        return this.$store.state.pitcher_store.maxHistory
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_MAX_HISTORY", value)
      },
    },
    totalNotes: {
      get() {
        return this.$store.state.pitcher_store.totalNotes
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_TOTAL_NOTES", value)
      },
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
    selectedRootNote() {
      if (process.client) {
        localStorage.setItem("selectedRootNote", this.selectedRootNote)
      }
      this.drawHistogram()
    },
    latinNotation(newVal) {
      // Convertir la nota seleccionada al cambiar la notación
      this.selectedRootNote = this.convertedRootNote
      this.drawHistogram()
    },
  },
  mounted() {
    this.ctx = this.$refs.histogram.getContext("2d", {
      willReadFrequently: true,
    })
    this.ctx.lineWidth = 0.5
    this.buffer = new Float32Array(2048)

    // Inicializar spectrogram canvas
    this.spectrogramCtx = this.$refs.spectrogram.getContext("2d")

    this.updateCanvasSize()
    window.addEventListener("resize", this.debouncedResize)
    this.drawHistogram()
  },
  beforeUnmount() {
    if (this.isMicActive) {
      this.cleanup()
    }
    window.removeEventListener("resize", this.debouncedResize)
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
      const container = this.$el.querySelector(".v-container")
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
      // Para obtener el índice completo dentro de NOTE_SHORT_STRINGS (y COLORS)
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
      // Convertir root a notación anglosajona si está en latín
      const rootIndex = this.latinNotation ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"].indexOf(root) : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"].indexOf(root)
      return MAJOR_STEPS.map((step) => (rootIndex + step) % 12)
    },
    resetHistory() {
      this.history = []
      this.lastFreq = null
      this.centsDeviation = null
      this.spectrogramData = []
      this.smoothedSpectrogramData = null
      const canvas = this.$refs.histogram
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.drawNoteLines()
      if (this.spectrogramCtx && this.$refs.spectrogram) {
        this.spectrogramCtx.clearRect(0, 0, this.$refs.spectrogram.width, this.$refs.spectrogram.height)
      }
    },
    calibrateNoise() {
      // Verificar que el micrófono esté activo
      if (!this.analyser || !this.isMicActive) {
        return
      }

      // Capturar perfil de ruido ambiente durante 3 segundos para mayor precisión
      this.noiseCalibrating = true
      this.noiseSamples = []

      const captureNoise = () => {
        if (this.noiseSamples.length < 180 && this.analyser && this.noiseCalibrating) {
          // ~3 segundos a 60fps
          this.analyser.getFloatTimeDomainData(this.buffer)

          // Calcular RMS del ruido
          let sumSquares = 0
          for (let i = 0; i < this.buffer.length; i++) {
            sumSquares += this.buffer[i] * this.buffer[i]
          }
          const rms = Math.sqrt(sumSquares / this.buffer.length)
          this.noiseSamples.push(rms)

          setTimeout(captureNoise, 16) // ~60fps
        } else if (this.noiseSamples.length > 0) {
          // Ordenar muestras para calcular estadísticas robustas
          const sortedSamples = [...this.noiseSamples].sort((a, b) => a - b)

          // Eliminar outliers: usar percentiles 10-90 para mayor robustez
          const p10Index = Math.floor(sortedSamples.length * 0.1)
          const p90Index = Math.floor(sortedSamples.length * 0.9)
          const filteredSamples = sortedSamples.slice(p10Index, p90Index)

          // Calcular promedio del ruido (excluyendo outliers)
          const avgNoise = filteredSamples.reduce((a, b) => a + b, 0) / filteredSamples.length

          // Calcular mediana para mayor robustez ante picos esporádicos
          const medianIndex = Math.floor(filteredSamples.length / 2)
          const medianNoise = filteredSamples[medianIndex]

          // Usar promedio entre media y mediana para balance
          this.noiseProfile = (avgNoise + medianNoise) / 2

          // Ajustar sensibilidad automáticamente basado en el ruido detectado
          // Usar factor conservador para evitar falsos positivos
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
      this.spectrogramData = []
      this.smoothedSpectrogramData = null
      if (this.ctx && this.$refs.histogram) {
        this.ctx.clearRect(0, 0, this.$refs.histogram.width, this.$refs.histogram.height)
        this.drawNoteLines()
      }
      if (this.spectrogramCtx && this.$refs.spectrogram) {
        this.spectrogramCtx.clearRect(0, 0, this.$refs.spectrogram.width, this.$refs.spectrogram.height)
      }
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
          this.drawNoteLines()
          this.update()
        } catch (e) {
          alert("Error accediendo al micrófono: " + e.message)
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

      // Interpolación parabólica para mayor precisión sub-sample
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
      if (!this.analyser) {
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

        // Calculate cents deviation from nearest note
        const nearestMidi = Math.round(midi)
        const nearestFreq = this.midiToFreq(nearestMidi)
        this.centsDeviation = Math.round(1200 * Math.log2(exactFreq / nearestFreq))

        this.freqDisplay = exactFreq.toString()
        this.noteDisplay = note

        this.history.unshift({ freq: exactFreq, midi })
        if (this.history.length > this.maxHistory) this.history.pop()
        this.drawHistogram()
      } else {
        this.freqDisplay = "--"
        this.noteDisplay = "--"
        this.dBDisplay = "--"
        this.centsDeviation = null
      }

      // Update spectrogram with throttling
      const now = Date.now()
      if (now - this.lastSpectrogramUpdate > this.spectrogramThrottle) {
        this.updateSpectrogram()
        this.lastSpectrogramUpdate = now
      }

      if (this.isMicActive) requestAnimationFrame(this.update)
    },
    drawHistogram() {
      const canvas = this.$refs.histogram
      const ctx = this.ctx
      const height = canvas.height
      const width = canvas.width
      const spacing = (width - 50) / this.maxHistory
      const len = Math.min(this.history.length, this.maxHistory)

      // Limpiar canvas de una vez
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
        // Se obtiene el índice completo (0 a 23) usando la resolución de medio tono
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
        // Se calcula el índice completo: si es semitono, se usa noteIndex*2+1, de lo contrario noteIndex*2.
        // const fullIndex = isHalfStep ? noteIndex * 2 + 1 : noteIndex * 2 // unused
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

        // Dibujar la línea horizontal
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
      // separador
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
          // Calcular el índice completo (0–23) a partir del valor midi redondeado a medio tono
          const fullIndex = Math.round(shiftedMidi * 2) % 24
          ctx.fillStyle = COLORS[fullIndex]
          ctx.beginPath()
          ctx.arc(x, y, 2.0, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    updateSpectrogram() {
      if (!this.analyser || !this.spectrogramCtx || !this.$refs.spectrogram) return

      const canvas = this.$refs.spectrogram
      const ctx = this.spectrogramCtx
      const width = canvas.width
      const height = canvas.height

      // Get frequency data
      const bufferLength = this.analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      this.analyser.getByteFrequencyData(dataArray)

      // Initialize smoothed data array if needed
      if (!this.smoothedSpectrogramData || this.smoothedSpectrogramData.length !== bufferLength) {
        this.smoothedSpectrogramData = new Float32Array(bufferLength)
        // Initialize with first frame
        for (let i = 0; i < bufferLength; i++) {
          this.smoothedSpectrogramData[i] = dataArray[i]
        }
      }

      // Apply temporal smoothing (exponential moving average)
      const smoothing = this.spectrogramSmoothingFactor
      for (let i = 0; i < bufferLength; i++) {
        this.smoothedSpectrogramData[i] = this.smoothedSpectrogramData[i] * smoothing + dataArray[i] * (1 - smoothing)
      }

      // Create smoothed Uint8Array for storage
      const smoothedArray = new Uint8Array(bufferLength)
      for (let i = 0; i < bufferLength; i++) {
        smoothedArray[i] = Math.round(this.smoothedSpectrogramData[i])
      }

      // Add to spectrogram history
      this.spectrogramData.push(smoothedArray)
      if (this.spectrogramData.length > this.maxSpectrogramHistory) {
        this.spectrogramData.shift()
      }

      // Clear canvas once
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect(0, 0, width, height)

      const sampleRate = this.audioContext.sampleRate
      const nyquist = sampleRate / 2

      // Draw spectrogram with better frequency resolution
      const sliceWidth = width / this.spectrogramData.length
      // Reduce binStep to show more detail
      const binStep = 2
      const frequencyRange = 5000 // Show up to 5kHz for better note visibility
      const maxBin = Math.min(bufferLength, Math.floor((frequencyRange / nyquist) * bufferLength))
      const binHeight = height / maxBin

      for (let i = 0; i < this.spectrogramData.length; i++) {
        const spectrum = this.spectrogramData[i]
        const x = i * sliceWidth

        for (let j = 0; j < maxBin; j += binStep) {
          const value = spectrum[j]
          if (value < 5) continue // Lower threshold to show more detail

          // Map frequency bins to y position (inverted, with log scale for better note perception)
          const y = height - (j / maxBin) * height

          // Enhanced color mapping for better visibility
          const intensity = value / 255
          let r, g, b

          if (intensity < 0.25) {
            // Low: dark blue
            r = 0
            g = 0
            b = Math.floor(intensity * 4 * 255)
          } else if (intensity < 0.5) {
            // Medium-low: cyan
            const t = (intensity - 0.25) / 0.25
            r = 0
            g = Math.floor(t * 255)
            b = 255
          } else if (intensity < 0.75) {
            // Medium-high: green to yellow
            const t = (intensity - 0.5) / 0.25
            r = Math.floor(t * 255)
            g = 255
            b = Math.floor((1 - t) * 128)
          } else {
            // High: yellow to red
            const t = (intensity - 0.75) / 0.25
            r = 255
            g = Math.floor((1 - t * 0.7) * 255)
            b = 0
          }

          ctx.fillStyle = `rgb(${r},${g},${b})`
          ctx.fillRect(x, y, sliceWidth + 1, binHeight * binStep + 1)
        }
      }

      // Draw frequency labels and note markers
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = "10px sans-serif"

      // Draw common musical note frequencies with more detail in low range
      const noteFreqs = [
        { freq: 82.41, name: "E2" },
        { freq: 87.31, name: "F2" },
        { freq: 92.5, name: "F#2" },
        { freq: 98.0, name: "G2" },
        { freq: 103.83, name: "G#2" },
        { freq: 110.0, name: "A2" },
        { freq: 116.54, name: "A#2" },
        { freq: 123.47, name: "B2" },
        { freq: 130.81, name: "C3" },
        { freq: 146.83, name: "D3" },
        { freq: 164.81, name: "E3" },
        { freq: 196.0, name: "G3" },
        { freq: 220.0, name: "A3" },
        { freq: 246.94, name: "B3" },
        { freq: 329.63, name: "E4" },
        { freq: 440.0, name: "A4" },
        { freq: 659.25, name: "E5" },
        { freq: 880.0, name: "A5" },
        { freq: 1318.51, name: "E6" },
      ]

      noteFreqs.forEach(({ freq, name }) => {
        if (freq < frequencyRange) {
          const y = height - (freq / frequencyRange) * height
          // Draw subtle line with more visibility for low notes
          const isLowNote = freq < 150
          ctx.strokeStyle = isLowNote ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)"
          ctx.lineWidth = isLowNote ? 0.8 : 0.5
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
          // Draw label with better visibility for low notes
          ctx.fillStyle = isLowNote ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.8)"
          ctx.font = isLowNote ? "bold 10px sans-serif" : "10px sans-serif"
          ctx.fillText(`${name} (${Math.round(freq)}Hz)`, width - 90, y - 2)
        }
      })

      // Highlight current detected frequency if available
      if (this.freqDisplay !== "--" && this.history.length > 0) {
        const currentFreq = parseFloat(this.freqDisplay)
        if (currentFreq > 0 && currentFreq < frequencyRange) {
          const y = height - (currentFreq / frequencyRange) * height

          // Draw full-width bright line for current note
          ctx.strokeStyle = "rgba(255, 255, 0, 0.9)"
          ctx.lineWidth = 2.5
          ctx.setLineDash([5, 3]) // Dashed line
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
          ctx.setLineDash([]) // Reset line dash

          // Draw frequency marker on the right
          ctx.fillStyle = "yellow"
          ctx.beginPath()
          ctx.arc(width - 5, y, 4, 0, 2 * Math.PI)
          ctx.fill()

          // Draw frequency label
          ctx.fillStyle = "yellow"
          ctx.font = "bold 11px sans-serif"
          ctx.fillText(`${Math.round(currentFreq)}Hz`, 5, y - 5)
        }
      }
    },
  },
}
</script>

<style scoped>
h4 {
  font-weight: 600;
}

.tuning-meter-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 10px;
}

.tuning-meter-bar {
  position: relative;
  width: 100%;
  height: 40px;
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
