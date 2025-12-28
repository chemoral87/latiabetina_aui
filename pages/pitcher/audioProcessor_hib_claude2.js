// audioProcessor.js - Optimizado: Velocidad de Gemini + Precisión de Claude
import { A4_FREQ, A4_MIDI } from "./constants.js"

export class AudioProcessor {
  constructor() {
    this.mediaStream = null
    this.audioContext = null
    this.analyser = null
    this.buffer = null
    this.isMicActive = false
    this.sampleRate = 44100

    this.noiseSamples = []
    this.noiseCalibrating = false

    this.correlationArray = null
    this.lastFreq = -1
    this.consecutiveCount = 0
    this.isTracking = false

    // Parámetros optimizados
    this.MIN_DB = 27
    this.sensitivity = 0.005

    // Umbrales balanceados: rápido pero preciso
    this.STRICT_THRESHOLD = 7 // cents: balance entre velocidad y precisión
    this.GLIDE_THRESHOLD = 100 // cents: libertad para glissandos
    this.CONSECUTIVE_THRESHOLD = 2 // frames: respuesta rápida

    this.MIN_FREQ = 40
    this.MAX_FREQ = 2000

    // Filtro de mediana simple para eliminar outliers
    this.recentFreqs = []
    this.MEDIAN_WINDOW = 3
  }

  async initializeMicrophone() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.sampleRate = this.audioContext.sampleRate
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 8192 // Mayor resolución para mejor precisión
      this.analyser.smoothingTimeConstant = 0.3
      this.buffer = new Float32Array(this.analyser.fftSize)

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)

      // Filtro pasa-banda optimizado
      const lowpass = this.audioContext.createBiquadFilter()
      lowpass.type = "lowpass"
      lowpass.frequency.value = 2500
      lowpass.Q.value = 0.7

      const highpass = this.audioContext.createBiquadFilter()
      highpass.type = "highpass"
      highpass.frequency.value = 60
      highpass.Q.value = 0.7

      source.connect(highpass)
      highpass.connect(lowpass)
      lowpass.connect(this.analyser)

      this.isMicActive = true
      return true
    } catch (error) {
      console.error("Error inicializando micrófono:", error)
      throw error
    }
  }

  analyzeFrequency() {
    if (!this.analyser || !this.isMicActive) return { freq: -1, dB: -100 }

    this.analyser.getFloatTimeDomainData(this.buffer)

    // Cálculo de RMS con ventana optimizada
    let sumSquares = 0
    const windowSize = Math.min(this.buffer.length, 2048)
    for (let i = 0; i < windowSize; i++) {
      sumSquares += this.buffer[i] * this.buffer[i]
    }
    const rms = Math.sqrt(sumSquares / windowSize)
    const dB = 20 * Math.log10(Math.max(rms, 0.00002) / 0.00002)

    if (dB < this.MIN_DB || rms < this.sensitivity) {
      this.resetTracking()
      return { freq: -1, dB }
    }

    return this.autoCorrelate(this.buffer, dB, rms)
  }

  autoCorrelate(buf, dB, rms) {
    const SIZE = buf.length
    if (!this.correlationArray) this.correlationArray = new Float32Array(SIZE)

    // Ventana de Hamming para mejor análisis espectral
    const winBuf = new Float32Array(buf)
    for (let i = 0; i < SIZE; i++) {
      winBuf[i] *= 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (SIZE - 1))
    }

    // Autocorrelación con normalización mejorada
    let maxCorr = -1
    let bestLag = -1
    const minLag = Math.floor(this.sampleRate / this.MAX_FREQ)
    const maxLag = Math.floor(this.sampleRate / this.MIN_FREQ)

    // Calcular energía total para normalización
    let energy = 0
    for (let i = 0; i < SIZE; i++) {
      energy += winBuf[i] * winBuf[i]
    }

    for (let lag = minLag; lag < maxLag; lag++) {
      let corr = 0
      let lagEnergy = 0

      for (let i = 0; i < SIZE - lag; i++) {
        corr += winBuf[i] * winBuf[i + lag]
        lagEnergy += winBuf[i + lag] * winBuf[i + lag]
      }

      // Normalización para mejor detección
      if (energy > 0 && lagEnergy > 0) {
        corr = corr / Math.sqrt(energy * lagEnergy)
      }

      this.correlationArray[lag] = corr

      if (corr > maxCorr) {
        maxCorr = corr
        bestLag = lag
      }
    }

    // Umbral adaptativo basado en la señal
    const threshold = Math.max(0.15, Math.min(0.4, rms * 40))

    if (maxCorr < threshold) {
      return { freq: -1, dB }
    }

    // Interpolación parabólica para sub-sample precision
    let refinedLag = bestLag
    if (bestLag > 1 && bestLag < SIZE - 2) {
      const y0 = this.correlationArray[bestLag - 1]
      const y1 = this.correlationArray[bestLag]
      const y2 = this.correlationArray[bestLag + 1]

      // Solo interpolar si hay un pico claro
      if (y1 > y0 && y1 > y2) {
        const delta = (0.5 * (y2 - y0)) / (2 * y1 - y0 - y2)
        refinedLag = bestLag + delta
      }
    }

    const freq = this.sampleRate / refinedLag

    // Validación de rango
    if (freq < this.MIN_FREQ || freq > this.MAX_FREQ) {
      return { freq: -1, dB }
    }

    return { freq, dB, rms, confidence: maxCorr }
  }

  smoothFrequency(currentFreq) {
    // Inicialización
    if (this.lastFreq === -1) {
      this.lastFreq = currentFreq
      this.consecutiveCount = 1
      this.recentFreqs = [currentFreq]
      return -1
    }

    // Determinar umbral según estado de tracking
    const currentThreshold = this.isTracking ? this.GLIDE_THRESHOLD : this.STRICT_THRESHOLD

    // Actualizar buffer de frecuencias recientes
    this.recentFreqs.push(currentFreq)
    if (this.recentFreqs.length > this.MEDIAN_WINDOW) {
      this.recentFreqs.shift()
    }

    // Aplicar filtro de mediana para eliminar outliers
    const medianFreq = this.getMedian(this.recentFreqs)
    const medianDiff = Math.abs(1200 * Math.log2(medianFreq / this.lastFreq))

    // Verificar consistencia
    if (medianDiff < currentThreshold) {
      this.consecutiveCount++
    } else {
      // Reset si hay inconsistencia
      this.isTracking = false
      this.consecutiveCount = 1
      this.lastFreq = currentFreq
      return -1
    }

    // Emitir cuando alcanza el threshold
    if (this.consecutiveCount >= this.CONSECUTIVE_THRESHOLD) {
      this.isTracking = true
      this.lastFreq = medianFreq
      return medianFreq
    }

    return -1
  }

  getMedian(arr) {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }

  calibrateNoise() {
    this.noiseCalibrating = true
    this.noiseSamples = []
    return new Promise((resolve) => {
      const capture = () => {
        if (this.noiseSamples.length < 35) {
          this.analyser.getFloatTimeDomainData(this.buffer)
          let s = 0
          const windowSize = Math.min(this.buffer.length, 2048)
          for (let i = 0; i < windowSize; i++) {
            s += this.buffer[i] * this.buffer[i]
          }
          this.noiseSamples.push(Math.sqrt(s / windowSize))
          setTimeout(capture, 20)
        } else {
          // Descartar outliers (10% superior e inferior)
          const sorted = [...this.noiseSamples].sort((a, b) => a - b)
          const trimCount = Math.floor(sorted.length * 0.1)
          const trimmed = sorted.slice(trimCount, -trimCount)

          const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
          this.sensitivity = Math.max(0.004, avg * 2.6)

          console.log(`Calibración completada. Sensibilidad: ${this.sensitivity.toFixed(4)}`)
          this.noiseCalibrating = false
          resolve()
        }
      }
      capture()
    })
  }

  resetTracking() {
    this.lastFreq = -1
    this.consecutiveCount = 0
    this.isTracking = false
    this.recentFreqs = []
  }

  async cleanupMicrophone() {
    if (this.mediaStream) this.mediaStream.getTracks().forEach((t) => t.stop())
    if (this.audioContext) await this.audioContext.close()
    this.isMicActive = false
  }

  setSensitivity(s) {
    this.sensitivity = s
  }

  getSensitivity() {
    return this.sensitivity
  }

  reset() {
    this.resetTracking()
  }

  midiToFreq(midi) {
    return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
  }

  freqToMidi(freq) {
    if (freq <= 0) return 0
    return 69 + 12 * Math.log2(freq / A4_FREQ)
  }
}
