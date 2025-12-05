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
    </h4>

    <div class="text-center mb-3"></div>

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
              <v-slider v-model="sensitivity" :min="0.001" :max="0.3" :step="0.005" label="Sensibilidad" hide-details thumb-label />
              <div class="text-center font-weight-bold">
                {{ sensitivity.toFixed(4) }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <v-slider v-model="noiseThreshold" :min="1.2" :max="3.0" :step="0.1" label="Filtro de Ruido" hide-details thumb-label />
              <div class="text-center font-weight-bold">{{ noiseThreshold.toFixed(1) }}x</div>
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

      lastFreq: null,
      lastDetectionTime: null,
      isFirstDetection: true,
      confirmationBuffer: [],
      confirmationCount: 0,

      pitchWorker: null,
      workerBusy: false,

      // Sistema de filtrado de ruido de fondo
      noiseProfile: null,
      noiseCalibrating: false,
      noiseSamples: [],
      noiseThreshold: 1.5, // Multiplicador sobre el nivel de ruido base
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
    this.buffer = new Float32Array(4096)

    // Inicializar Web Worker
    if (typeof Worker !== "undefined") {
      this.pitchWorker = new Worker("/pitch-worker.js")
      this.pitchWorker.onmessage = this.handleWorkerMessage
    }

    this.updateCanvasSize()
    window.addEventListener("resize", this.debouncedResize)
    this.drawHistogram()
  },
  beforeUnmount() {
    if (this.isMicActive) {
      this.cleanup()
    }
    if (this.pitchWorker) {
      this.pitchWorker.terminate()
      this.pitchWorker = null
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
    handleWorkerMessage(e) {
      const { freq: rawFreq, dB } = e.data
      this.workerBusy = false
      this.dBDisplay = dB
      this.processFrequency(rawFreq)
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
      this.lastDetectionTime = null
      this.isFirstDetection = true
      this.confirmationBuffer = []
      this.confirmationCount = 0
      const canvas = this.$refs.histogram
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.drawNoteLines()
    },
    calibrateNoise() {
      // Verificar que el micrófono esté activo
      if (!this.analyser || !this.isMicActive) {
        console.warn("El micrófono debe estar activo para calibrar el ruido")
        return
      }

      // Capturar perfil de ruido ambiente durante 2 segundos
      this.noiseCalibrating = true
      this.noiseSamples = []

      const captureNoise = () => {
        if (this.noiseSamples.length < 120 && this.analyser && this.noiseCalibrating) {
          // ~2 segundos a 60fps
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
          // Calcular promedio del ruido
          const avgNoise = this.noiseSamples.reduce((a, b) => a + b, 0) / this.noiseSamples.length
          this.noiseProfile = avgNoise

          // Ajustar sensibilidad automáticamente basado en el ruido detectado
          // Sensitivity debe ser mayor al ruido pero no demasiado alto
          const recommendedSensitivity = Math.max(0.005, Math.min(0.15, avgNoise * 2.5))
          this.sensitivity = recommendedSensitivity

          this.noiseCalibrating = false
        } else {
          this.noiseCalibrating = false
          console.warn("No se pudieron capturar muestras de ruido")
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
      this.history = []
      this.lastFreq = null
      this.lastDetectionTime = null
      this.isFirstDetection = true
      this.confirmationBuffer = []
      this.confirmationCount = 0
      if (this.ctx && this.$refs.histogram) {
        this.ctx.clearRect(0, 0, this.$refs.histogram.width, this.$refs.histogram.height)
        this.drawNoteLines()
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
          this.analyser.fftSize = 4096
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
      if (!this.lastFreq || this.isFirstDetection) {
        this.lastFreq = currentFreq
        this.isFirstDetection = false
        return currentFreq
      }

      const OCTAVE_THRESHOLD_LOW = 1.8
      const OCTAVE_THRESHOLD_HIGH = 2.2
      const HALF_OCTAVE_THRESHOLD_LOW = 0.45
      const HALF_OCTAVE_THRESHOLD_HIGH = 0.55

      const ratio = currentFreq / this.lastFreq

      // Aplicar correcciones de octava con menos agresividad para preservar glissandos
      if (ratio > OCTAVE_THRESHOLD_LOW && ratio < OCTAVE_THRESHOLD_HIGH) {
        currentFreq = currentFreq * 0.7 + this.lastFreq * 2 * 0.3 // Menos agresivo
      } else if (ratio > HALF_OCTAVE_THRESHOLD_LOW && ratio < HALF_OCTAVE_THRESHOLD_HIGH) {
        currentFreq = currentFreq * 0.7 + this.lastFreq * 0.5 * 0.3 // Menos agresivo
      }

      // Factor de suavizado balanceado para glissandos suaves sin cortes
      const SMOOTHING_FACTOR = 0.2 // Balanceado para glissandos naturales
      this.lastFreq = this.lastFreq * (1 - SMOOTHING_FACTOR) + currentFreq * SMOOTHING_FACTOR

      return this.lastFreq
    },
    autoCorrelate(buf, sampleRate) {
      const SIZE = buf.length
      const MIN_DB = 25 // Reducido para frecuencias bajas
      const MIN_SAMPLE_THRESHOLD = 0.008 // Más sensible
      const PEAK_THRESHOLD_FACTOR = 0.15 // Más sensible para bajas frecuencias
      const WINDOW_PADDING = 15 // Mayor ventana

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

      // Filtrar ruido de fondo usando perfil calibrado
      if (this.noiseProfile && rms < this.noiseProfile * this.noiseThreshold) {
        this.freqDisplay = "--"
        this.noteDisplay = "--"
        return -1
      }

      // Sensitivity adaptativa: más permisiva para señales con buen volumen
      const effectiveSensitivity = maxSample > 0.05 ? this.sensitivity * 0.5 : this.sensitivity

      if (dBSPL < MIN_DB || rms < effectiveSensitivity || maxSample < MIN_SAMPLE_THRESHOLD) {
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

      // Interpolación parabólica para mayor precisión
      let refinedPeak = peakIndex
      if (peakIndex > 0 && peakIndex < windowSize - 1) {
        const y1 = this.correlationArray[peakIndex - 1]
        const y2 = this.correlationArray[peakIndex]
        const y3 = this.correlationArray[peakIndex + 1]
        const offset = (0.5 * (y1 - y3)) / (y1 - 2 * y2 + y3)
        if (!isNaN(offset) && Math.abs(offset) < 1) {
          refinedPeak = peakIndex + offset
        }
      }

      let freq = sampleRate / refinedPeak

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

      // Verificar claridad del pitch (ratio de correlación)
      const clarity = maxVal / this.correlationArray[0]

      // Ajustado para no corregir frecuencias bajas (80-100Hz)
      if (freq > 0 && freq < 2000) {
        // Para rango muy bajo, requerir claridad mínima
        if (freq >= 80 && freq <= 110 && clarity < 0.5) {
          return -1 // Rechazar si no es claro
        }

        // Umbrales MUY conservadores para evitar falsas correcciones de armónicos
        if (freq > 300 && freq < 600) {
          freq = checkHarmonic(2, 0.95) // Muy conservador
        } else if (freq > 450 && freq < 900) {
          freq = checkHarmonic(3, 0.92) // Muy conservador
        }
      }

      return freq > 20 && freq < 2000 ? freq : -1
    },
    update() {
      if (!this.analyser) {
        console.warn("[Update] No analyser disponible")
        return
      }

      // Si el worker está ocupado, esperar al siguiente frame
      if (this.workerBusy) {
        if (this.isMicActive) requestAnimationFrame(this.update)
        return
      }

      this.analyser.getFloatTimeDomainData(this.buffer)
      // Log de los primeros samples del buffer

      // Enviar datos al worker si está disponible
      if (this.pitchWorker) {
        this.workerBusy = true
        this.pitchWorker.postMessage({
          buffer: Array.from(this.buffer),
          sampleRate: this.audioContext.sampleRate,
          sensitivity: this.sensitivity,
          noiseProfile: this.noiseProfile,
          noiseThreshold: this.noiseThreshold,
        })
      } else {
        // Fallback si no hay worker
        const rawFreq = this.autoCorrelate(this.buffer, this.audioContext.sampleRate)

        this.processFrequency(rawFreq)
      }

      if (this.isMicActive) requestAnimationFrame(this.update)
    },
    processFrequency(rawFreq) {
      if (rawFreq !== -1) {
        const currentTime = Date.now()

        // Check if there was a pause (>100ms without detection) or if it's the first detection
        if (!this.lastDetectionTime || (this.lastDetectionTime && currentTime - this.lastDetectionTime > 100)) {
          // Clear all state to prevent interpolation after pause
          this.lastFreq = null
          this.isFirstDetection = true
          this.confirmationBuffer = []
          this.confirmationCount = 0
        }

        this.lastDetectionTime = currentTime

        let correctedFreq = rawFreq

        // Sistema de confirmación para primeras detecciones después de pausa
        if (this.isFirstDetection || this.confirmationCount < 4) {
          // Añadir al buffer de confirmación
          this.confirmationBuffer.push(correctedFreq)

          // Mantener solo las últimas 5 mediciones
          if (this.confirmationBuffer.length > 5) {
            this.confirmationBuffer.shift()
          }

          // Verificar estabilidad del buffer
          if (this.confirmationBuffer.length >= 4) {
            const avg = this.confirmationBuffer.reduce((sum, f) => sum + f, 0) / this.confirmationBuffer.length
            const variance = this.confirmationBuffer.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / this.confirmationBuffer.length
            const stdDev = Math.sqrt(variance)

            // Si la desviación es pequeña (frecuencia estable), confirmar
            if (stdDev < avg * 0.01) {
              // 1% de tolerancia más estricta
              correctedFreq = avg
              this.confirmationCount++

              if (this.confirmationCount >= 4) {
                this.isFirstDetection = false
              }
            } else {
              // Si no es estable, no procesar esta detección
              this.freqDisplay = "--"
              this.noteDisplay = "--"
              if (this.isMicActive) requestAnimationFrame(this.update)
              return
            }
          } else {
            // No hay suficientes mediciones aún, no procesar

            this.freqDisplay = "--"
            this.noteDisplay = "--"
            if (this.isMicActive) requestAnimationFrame(this.update)
            return
          }
        }

        const smoothedFreq = this.smoothFrequency(correctedFreq)
        const exactFreq = parseFloat(smoothedFreq.toFixed(2))
        const midi = this.freqToMidi(exactFreq)
        const note = this.getNoteNameNum(midi)

        this.freqDisplay = exactFreq.toString()
        this.noteDisplay = note

        // Only add to history and plot if sound level is above threshold and frequency is confirmed
        const currentDB = parseFloat(this.dBDisplay)
        // Umbral de dB reducido para mayor sensibilidad
        const DB_THRESHOLD = 30
        if (!isNaN(currentDB) && currentDB >= DB_THRESHOLD && !this.isFirstDetection) {
          this.history.unshift({ freq: exactFreq, midi })
          if (this.history.length > this.maxHistory) this.history.pop()
          this.drawHistogram()
        } // else if (isNaN(currentDB)) { /* no-op */ }
        // else if (currentDB < DB_THRESHOLD) { /* no-op */ }
        // else if (this.isFirstDetection) { /* no-op */ }
      } else {
        this.freqDisplay = "--"
        this.noteDisplay = "--"
        this.dBDisplay = "--"
      }
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
      if (!currentData || !currentData.freq || currentData.freq < 70 || currentData.freq > 1300) {
        for (let i = 1; i < len; i++) {
          const { freq, midi } = this.history[i]
          if (!freq || freq < 70 || freq > 1300) continue
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

        // Only plot frequencies within 70Hz - 1300Hz range
        if (shiftedFreq < 70 || shiftedFreq > 1300) continue

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
        if (!freq || freq < 70 || freq > 1300) continue
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

        // Only plot frequencies within 70Hz - 1300Hz range
        if (shiftedFreq < 70 || shiftedFreq > 1300) continue

        const shiftedMidi = this.freqToMidi(shiftedFreq)
        const y = height - ((shiftedMidi - MIN_MIDI) / this.totalNotes) * height

        if (y >= 0 && y <= height) {
          const x = width - i * spacing - TEXT_WIDTH - 5
          // Calcular el índice completo (0–23) a partir del valor midi redondeado a medio tono
          const fullIndex = Math.round(shiftedMidi * 2) % 24
          ctx.fillStyle = COLORS[fullIndex]
          ctx.beginPath()
          ctx.arc(x, y, 1.7, 0, Math.PI * 2)
          ctx.fill()
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
</style>
