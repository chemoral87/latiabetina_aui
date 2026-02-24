// audioProcessor.js - Optimización "Ultra-Fast" para Glissandos Cortos
import { A4_FREQ, A4_MIDI } from "../constants.js"

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

    // Miss tolerance: how many consecutive low-volume frames before truly resetting
    this.missCount = 0
    this.MISS_TOLERANCE = 4

    // Filtro de Mediana reducido al mínimo para no añadir lag
    this.recentFreqs = []
    this.MEDIAN_WINDOW = 2

    // Sensibilidad para no perder puntos en movimientos rápidos
    this.MIN_DB = 10 // Lowered to capture soft/quiet notes
    this.sensitivity = 0.005

    // CONFIGURACIÓN PARA GLISSANDOS ULTRA-CORTOS:
    this.STRICT_THRESHOLD = 20 // Más laxo al inicio para enganchar rápido
    this.GLIDE_THRESHOLD = 300 // 300 cents: permite rastrear cambios extremos
    this.CONSECUTIVE_THRESHOLD = 1 // DIBUJO INSTANTÁNEO (Máxima densidad de puntos)

    this.MIN_FREQ = 40
    this.MAX_FREQ = 2000
  }

  async initializeMicrophone() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.sampleRate = this.audioContext.sampleRate
      this.analyser = this.audioContext.createAnalyser()

      // Mantenemos 4096 para precisión, pero el análisis será más frecuente
      this.analyser.fftSize = 4096
      this.buffer = new Float32Array(this.analyser.fftSize)

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)

      // Boost soft input signals so low-volume notes reach the analyser
      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = 4

      // Highpass filter to remove subsonic rumble; avoids the narrow 440 Hz bandpass
      // that was attenuating notes far from A4
      const filter = this.audioContext.createBiquadFilter()
      filter.type = "highpass"
      filter.frequency.value = 40
      filter.Q.value = 0.7

      source.connect(gainNode)
      gainNode.connect(filter)
      filter.connect(this.analyser)
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

    let sumSquares = 0
    for (let i = 0; i < this.buffer.length; i++) {
      sumSquares += this.buffer[i] * this.buffer[i]
    }
    const rms = Math.sqrt(sumSquares / this.buffer.length)
    const dB = 20 * Math.log10(rms / 0.00002)

    // Only reset after MISS_TOLERANCE consecutive low-volume frames so brief
    // dips (breath, soft passage) don't freeze the histogram
    if (dB < this.MIN_DB || rms < this.sensitivity) {
      this.missCount++
      if (this.missCount > this.MISS_TOLERANCE) {
        this.resetTracking()
      }
      return { freq: -1, dB }
    }
    this.missCount = 0 // reset miss counter on good frame

    return this.autoCorrelate(this.buffer, dB, rms)
  }

  autoCorrelate(buf, dB, rms) {
    const SIZE = buf.length
    if (!this.correlationArray) this.correlationArray = new Float32Array(SIZE)

    const winBuf = new Float32Array(buf)
    for (let i = 0; i < SIZE; i++) {
      winBuf[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / (SIZE - 1)))
    }

    let maxCorr = -1
    let bestLag = -1
    const minLag = Math.floor(this.sampleRate / this.MAX_FREQ)
    const maxLag = Math.floor(this.sampleRate / this.MIN_FREQ)

    for (let lag = minLag; lag < maxLag; lag++) {
      let corr = 0
      for (let i = 0; i < SIZE - lag; i++) {
        corr += winBuf[i] * winBuf[i + lag]
      }
      this.correlationArray[lag] = corr
      if (corr > maxCorr) {
        maxCorr = corr
        bestLag = lag
      }
    }

    // Lowered confidence gate so quiet (low RMS) signals are not discarded
    if (maxCorr < 0.02) return { freq: -1, dB }

    let refinedLag = bestLag
    if (bestLag > 0 && bestLag < SIZE - 1) {
      const y1 = this.correlationArray[bestLag - 1]
      const y2 = this.correlationArray[bestLag]
      const y3 = this.correlationArray[bestLag + 1]
      const delta = (y3 - y1) / (2 * (2 * y2 - y1 - y3))
      refinedLag = bestLag + delta
    }

    const freq = this.sampleRate / refinedLag
    return { freq, dB, rms }
  }

  smoothFrequency(currentFreq) {
    if (this.lastFreq === -1) {
      this.lastFreq = currentFreq
      this.consecutiveCount = 1
      this.isTracking = true // Inicio inmediato
      return currentFreq
    }

    const diffCents = Math.abs(1200 * Math.log2(currentFreq / this.lastFreq))
    const currentThreshold = this.isTracking ? this.GLIDE_THRESHOLD : this.STRICT_THRESHOLD

    if (diffCents < currentThreshold) {
      this.consecutiveCount++
      this.isTracking = true

      // Si detectamos movimiento rápido (típico de glissando), saltamos el filtro de mediana
      if (diffCents > 30) {
        this.lastFreq = currentFreq
        return currentFreq
      }

      // Para notas estables, mantenemos el suavizado de Claude8
      this.recentFreqs.push(currentFreq)
      if (this.recentFreqs.length > this.MEDIAN_WINDOW) this.recentFreqs.shift()

      const sorted = [...this.recentFreqs].sort((a, b) => a - b)
      const medianFreq = sorted[Math.floor(sorted.length / 2)]

      this.lastFreq = medianFreq
      return medianFreq
    } else {
      if (this.isTracking) {
        // While tracking, a big jump is more likely a new note than noise.
        // Accept it immediately so the histogram never freezes mid-singing.
        this.lastFreq = currentFreq
        this.recentFreqs = [currentFreq]
        return currentFreq
      }
      // Not yet tracking: discard this frame, wait for stability
      this.lastFreq = currentFreq
      return -1
    }
  }

  calibrateNoise() {
    this.noiseCalibrating = true
    this.noiseSamples = []
    return new Promise((resolve) => {
      const capture = () => {
        if (this.noiseSamples.length < 30) {
          this.analyser.getFloatTimeDomainData(this.buffer)
          let s = 0
          for (let i = 0; i < this.buffer.length; i++) {
            s += this.buffer[i] * this.buffer[i]
          }
          this.noiseSamples.push(Math.sqrt(s / this.buffer.length))
          setTimeout(capture, 20)
        } else {
          // Calibración con recorte de outliers (estilo ap_claude8)
          const sorted = [...this.noiseSamples].sort((a, b) => a - b)
          const trimCount = Math.floor(sorted.length * 0.1)
          const trimmed = sorted.slice(trimCount, -trimCount)
          const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length

          // Use 1.8x multiplier (was 2.5x) so the threshold doesn't cut soft notes
          this.sensitivity = Math.max(0.002, avg * 1.8)
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
    this.missCount = 0
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
