// audioProcessor.js - Versión mejorada con detección suavizada
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

    // Parámetros de control mejorados
    this.MIN_DB = 26
    this.sensitivity = 0.005

    // Umbrales dinámicos ajustados
    this.STRICT_THRESHOLD = 6 // Más permisivo en el ataque inicial
    this.GLIDE_THRESHOLD = 100 // Permite glissandos amplios
    this.CONSECUTIVE_THRESHOLD = 2 // Respuesta más rápida

    this.MIN_FREQ = 40
    this.MAX_FREQ = 2000

    // Buffer de frecuencias para suavizado
    this.freqBuffer = []
    this.FREQ_BUFFER_SIZE = 5

    // Sistema de confianza para la detección
    this.confidenceScore = 0
    this.MIN_CONFIDENCE = 0.7

    // Filtro de mediana para eliminar outliers
    this.recentFreqs = []
    this.MEDIAN_WINDOW = 3

    // Prevención de saltos bruscos
    this.maxJumpCents = 200 // Máximo salto permitido en cents
  }

  async initializeMicrophone() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false, // Mejor control manual
        },
      })
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.sampleRate = this.audioContext.sampleRate
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 8192 // Mayor resolución
      this.analyser.smoothingTimeConstant = 0.3 // Suavizado adicional
      this.buffer = new Float32Array(this.analyser.fftSize)

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)

      // Filtro pasa-banda mejorado
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
      console.error("Error mic:", error)
      throw error
    }
  }

  analyzeFrequency() {
    if (!this.analyser || !this.isMicActive) return { freq: -1, dB: -100 }

    this.analyser.getFloatTimeDomainData(this.buffer)

    // Cálculo de RMS mejorado con ventana
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

    // Ventana de Hamming para mejor análisis
    const winBuf = new Float32Array(buf)
    for (let i = 0; i < SIZE; i++) {
      winBuf[i] *= 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (SIZE - 1))
    }

    // Autocorrelación mejorada
    let maxCorr = -1
    let bestLag = -1
    const minLag = Math.floor(this.sampleRate / this.MAX_FREQ)
    const maxLag = Math.floor(this.sampleRate / this.MIN_FREQ)

    // Normalización de energía
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
    const threshold = Math.max(0.15, Math.min(0.4, rms * 50))

    if (maxCorr < threshold) {
      this.confidenceScore *= 0.5 // Reducir confianza
      return { freq: -1, dB }
    }

    // Incrementar confianza
    this.confidenceScore = Math.min(1.0, this.confidenceScore + 0.3)

    // Interpolación parabólica mejorada
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

    // Validación adicional de frecuencia
    if (freq < this.MIN_FREQ || freq > this.MAX_FREQ) {
      return { freq: -1, dB }
    }

    return { freq, dB, rms, confidence: maxCorr }
  }

  smoothFrequency(currentFreq) {
    // Si no tenemos historial, inicializar
    if (this.lastFreq === -1) {
      this.lastFreq = currentFreq
      this.consecutiveCount = 1
      this.freqBuffer = [currentFreq]
      this.recentFreqs = [currentFreq]
      return -1
    }

    // Prevenir saltos imposibles (probablemente errores de detección)
    const diffCents = Math.abs(1200 * Math.log2(currentFreq / this.lastFreq))

    if (diffCents > this.maxJumpCents && !this.isTracking) {
      // Salto muy grande, probablemente un error
      this.consecutiveCount = 0
      return -1
    }

    // Determinar umbral según el estado
    const currentThreshold = this.isTracking ? this.GLIDE_THRESHOLD : this.STRICT_THRESHOLD

    // Actualizar buffer de frecuencias recientes
    this.recentFreqs.push(currentFreq)
    if (this.recentFreqs.length > this.MEDIAN_WINDOW) {
      this.recentFreqs.shift()
    }

    // Aplicar filtro de mediana para eliminar outliers
    const medianFreq = this.getMedian(this.recentFreqs)

    // Verificar consistencia
    const medianDiff = Math.abs(1200 * Math.log2(medianFreq / this.lastFreq))

    if (medianDiff < currentThreshold) {
      this.consecutiveCount++

      // Agregar al buffer de suavizado
      this.freqBuffer.push(medianFreq)
      if (this.freqBuffer.length > this.FREQ_BUFFER_SIZE) {
        this.freqBuffer.shift()
      }
    } else {
      // Reset si hay inconsistencia
      this.consecutiveCount = 1
      this.freqBuffer = [currentFreq]
      this.isTracking = false
      this.lastFreq = currentFreq
      return -1
    }

    // Verificar si ya podemos emitir la nota
    if (this.consecutiveCount >= this.CONSECUTIVE_THRESHOLD && this.confidenceScore >= this.MIN_CONFIDENCE) {
      this.isTracking = true

      // Aplicar promedio ponderado exponencial para suavizado
      const smoothedFreq = this.exponentialSmoothing(this.freqBuffer)
      this.lastFreq = smoothedFreq

      return smoothedFreq
    }

    return -1
  }

  getMedian(arr) {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }

  exponentialSmoothing(freqArray) {
    if (freqArray.length === 0) return 0
    if (freqArray.length === 1) return freqArray[0]

    // Dar más peso a las frecuencias recientes
    let weighted = 0
    let totalWeight = 0
    const alpha = 0.3 // Factor de suavizado

    for (let i = 0; i < freqArray.length; i++) {
      const weight = Math.pow(alpha, freqArray.length - 1 - i)
      weighted += freqArray[i] * weight
      totalWeight += weight
    }

    return weighted / totalWeight
  }

  calibrateNoise() {
    this.noiseCalibrating = true
    this.noiseSamples = []

    return new Promise((resolve) => {
      const capture = () => {
        if (this.noiseSamples.length < 40) {
          // Más muestras
          this.analyser.getFloatTimeDomainData(this.buffer)
          let s = 0
          const windowSize = Math.min(this.buffer.length, 2048)
          for (let i = 0; i < windowSize; i++) {
            s += this.buffer[i] * this.buffer[i]
          }
          this.noiseSamples.push(Math.sqrt(s / windowSize))
          setTimeout(capture, 25)
        } else {
          // Descartar outliers (10% superior e inferior)
          const sorted = [...this.noiseSamples].sort((a, b) => a - b)
          const trimCount = Math.floor(sorted.length * 0.1)
          const trimmed = sorted.slice(trimCount, -trimCount)

          const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
          this.sensitivity = Math.max(0.003, avg * 2.8)

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
    this.freqBuffer = []
    this.recentFreqs = []
    this.confidenceScore = 0
  }

  async cleanupMicrophone() {
    if (this.mediaStream) this.mediaStream.getTracks().forEach((t) => t.stop())
    if (this.audioContext) await this.audioContext.close()
    this.isMicActive = false
    this.resetTracking()
  }

  setSensitivity(s) {
    this.sensitivity = Math.max(0.001, Math.min(0.1, s))
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
