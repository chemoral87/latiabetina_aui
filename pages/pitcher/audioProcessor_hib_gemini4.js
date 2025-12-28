// audioProcessor.js - Versión Final Unificada (Ataque Limpio + Glissando)
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

    // Parámetros de sensibilidad y ruido
    this.MIN_DB = 28
    this.sensitivity = 0.005

    // Umbrales para Histéresis Dinámica
    this.STRICT_THRESHOLD = 8 // cents: rigor para evitar puntos basura al inicio
    this.GLIDE_THRESHOLD = 110 // cents: permisividad para glissandos fluidos
    this.CONSECUTIVE_THRESHOLD = 3

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

      // fftSize 4096 es vital para la resolución en notas graves (Fa2-La2)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 4096
      this.buffer = new Float32Array(this.analyser.fftSize)

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)

      // Filtro de paso de banda para limpiar armónicos no deseados en móviles
      const filter = this.audioContext.createBiquadFilter()
      filter.type = "bandpass"
      filter.frequency.value = 500
      filter.Q.value = 0.5

      source.connect(filter)
      filter.connect(this.analyser)
      this.isMicActive = true
      return true
    } catch (error) {
      console.error("Error al inicializar micrófono:", error)
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

    // Si el volumen cae por debajo del umbral, reiniciamos el tracking
    if (dB < this.MIN_DB || rms < this.sensitivity) {
      this.resetTracking()
      return { freq: -1, dB }
    }

    return this.autoCorrelate(this.buffer, dB, rms)
  }

  autoCorrelate(buf, dB, rms) {
    const SIZE = buf.length
    if (!this.correlationArray) this.correlationArray = new Float32Array(SIZE)

    // Aplicar ventana de Hanning para mejorar la precisión espectral
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

    if (maxCorr < 0.1) return { freq: -1, dB }

    // Interpolación parabólica para obtener precisión de sub-cents
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
      return -1
    }

    const diffCents = Math.abs(1200 * Math.log2(currentFreq / this.lastFreq))

    // Si ya estamos trackeando, somos permisivos para el glissando
    // Si no, somos estrictos para evitar transitorios en el ataque
    const currentThreshold = this.isTracking ? this.GLIDE_THRESHOLD : this.STRICT_THRESHOLD

    if (diffCents < currentThreshold) {
      this.consecutiveCount++
    } else {
      // Salto brusco: reseteamos para limpiar el gráfico de líneas diagonales
      this.isTracking = false
      this.consecutiveCount = 1
      this.lastFreq = currentFreq
      return -1
    }

    if (this.consecutiveCount >= this.CONSECUTIVE_THRESHOLD) {
      this.isTracking = true
      this.lastFreq = currentFreq
      return currentFreq
    }

    return -1
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
          const avg = this.noiseSamples.reduce((a, b) => a + b, 0) / 30
          this.sensitivity = Math.max(0.005, avg * 2.5)
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
