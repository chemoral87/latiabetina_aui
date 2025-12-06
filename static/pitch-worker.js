// pitch-worker.js (Optimized Web Worker with YIN Algorithm)
// YIN: A fundamental frequency estimator for speech and music
// Performance optimized to minimize garbage collection and memory allocations

// ===== PERSISTENT BUFFERS (reused across frames) =====
let yinBuffer = null
let maxBufferSize = 0

// Cache for configuration to detect changes
let cachedSampleRate = 0
let cachedBufferSize = 0

// Performance stats (optional, can be removed in production)
let frameCount = 0
let totalProcessingTime = 0

self.onmessage = function (e) {
  const startTime = performance.now()

  const { buffer, sampleRate, sensitivity, noiseProfile, noiseThreshold } = e.data
  const SIZE = buffer.length

  // === OPTIMIZATION 1: Initialize/resize buffers only when needed ===
  if (SIZE !== cachedBufferSize || sampleRate !== cachedSampleRate) {
    initializeBuffers(SIZE)
    cachedBufferSize = SIZE
    cachedSampleRate = sampleRate
  }

  // === OPTIMIZATION 2: Fast RMS calculation with early exit ===
  const metrics = calculateMetrics(buffer, SIZE)

  // Early exit for noise/silence
  if (noiseProfile && metrics.rms < noiseProfile * noiseThreshold) {
    self.postMessage({ freq: -1, dB: metrics.dB })
    return
  }

  // Early exit for low signal
  const effectiveSensitivity = metrics.maxSample > 0.05 ? sensitivity * 0.5 : sensitivity
  if (metrics.dB < 25 || metrics.rms < effectiveSensitivity || metrics.maxSample < 0.008) {
    self.postMessage({ freq: -1, dB: metrics.dB })
    return
  }

  // === OPTIMIZATION 3: YIN with reused buffers ===
  const freq = yinPitchDetection(buffer, sampleRate)

  // Performance tracking (optional)
  frameCount++
  totalProcessingTime += performance.now() - startTime

  // Log performance every 100 frames (optional, remove in production)
  if (frameCount % 100 === 0) {
    const avgTime = (totalProcessingTime / frameCount).toFixed(3)
    console.log(`[Worker] Avg processing: ${avgTime}ms/frame (${frameCount} frames)`)
  }

  if (freq > 20 && freq < 2000) {
    // Calculate cents deviation for tuning accuracy
    const cents = calculateCentsDeviation(freq)

    // Calculate FFT for spectrogram (simple implementation)
    const fftData = calculateSimpleFFT(buffer, sampleRate)

    self.postMessage({
      freq,
      dB: metrics.dB,
      cents: cents.toFixed(1),
      nearestNote: getNearestNote(freq),
      fftData,
    })
  } else {
    self.postMessage({ freq: -1, dB: metrics.dB, cents: 0, nearestNote: null, fftData: null })
  }
}

/**
 * Initialize persistent buffers (called only when buffer size changes)
 */
function initializeBuffers(bufferSize) {
  const halfSize = Math.floor(bufferSize / 2)
  maxBufferSize = halfSize
  yinBuffer = new Float32Array(halfSize)
  console.log(`[Worker] Buffers initialized: ${bufferSize} samples, YIN buffer: ${halfSize}`)
}

/**
 * Calculate RMS, dB and max sample (optimized, single pass)
 * @returns {{rms: number, dB: string, maxSample: number}}
 */
function calculateMetrics(buffer, size) {
  let sumSquares = 0
  let maxSample = 0

  // Single pass through buffer
  for (let i = 0; i < size; i++) {
    const sample = buffer[i]
    sumSquares += sample * sample
    const absSample = Math.abs(sample)
    if (absSample > maxSample) maxSample = absSample
  }

  const rms = Math.sqrt(sumSquares / size)
  const dBSPL = 20 * Math.log10(rms / 0.00002)

  return {
    rms,
    dB: Math.max(0, dBSPL).toFixed(1),
    maxSample,
  }
}

/**
 * YIN Pitch Detection Algorithm (optimized with reused buffers)
 * @param {Array} buffer - Audio buffer (receives array from postMessage)
 * @param {number} sampleRate - Sample rate in Hz
 * @returns {number} Detected frequency in Hz, or -1 if no pitch found
 */
function yinPitchDetection(buffer, sampleRate) {
  const bufferSize = buffer.length
  const halfBufferSize = Math.floor(bufferSize / 2)
  const threshold = 0.1 // Reduced from 0.15 for better accuracy

  // === STEP 1: Difference function (reusing yinBuffer) ===
  // Note: yinBuffer is pre-allocated, we just write to it
  for (let tau = 0; tau < halfBufferSize; tau++) {
    let sum = 0
    // Unrolled loop for better performance (process 4 samples at a time)
    let i = 0
    const limit = halfBufferSize - 3

    for (; i < limit; i += 4) {
      const d0 = buffer[i] - buffer[i + tau]
      const d1 = buffer[i + 1] - buffer[i + 1 + tau]
      const d2 = buffer[i + 2] - buffer[i + 2 + tau]
      const d3 = buffer[i + 3] - buffer[i + 3 + tau]
      sum += d0 * d0 + d1 * d1 + d2 * d2 + d3 * d3
    }

    // Handle remaining samples
    for (; i < halfBufferSize; i++) {
      const delta = buffer[i] - buffer[i + tau]
      sum += delta * delta
    }

    yinBuffer[tau] = sum
  }

  // === STEP 2: Cumulative mean normalized difference ===
  yinBuffer[0] = 1
  let runningSum = 0

  for (let tau = 1; tau < halfBufferSize; tau++) {
    runningSum += yinBuffer[tau]
    yinBuffer[tau] *= tau / runningSum
  }

  // === STEP 3: Absolute threshold (with early exit) ===
  let tauEstimate = -1

  // Start from tau=2 to avoid DC and very low frequencies
  for (let tau = 2; tau < halfBufferSize; tau++) {
    if (yinBuffer[tau] < threshold) {
      // Find local minimum (look ahead a few samples)
      let minTau = tau
      let minVal = yinBuffer[tau]

      // Look ahead up to 10 samples for better minimum
      const lookAhead = Math.min(10, halfBufferSize - tau)
      for (let j = 1; j < lookAhead; j++) {
        if (yinBuffer[tau + j] < minVal) {
          minVal = yinBuffer[tau + j]
          minTau = tau + j
        } else if (yinBuffer[tau + j] > yinBuffer[tau + j - 1]) {
          // Value started increasing, we found the minimum
          break
        }
      }

      tauEstimate = minTau
      break
    }
  }

  if (tauEstimate === -1) {
    return -1
  }

  // === STEP 4: Enhanced Parabolic interpolation for maximum accuracy ===
  let betterTau = tauEstimate

  if (tauEstimate > 1 && tauEstimate < halfBufferSize - 2) {
    // Use 5-point interpolation for better accuracy when possible
    const s_2 = tauEstimate > 1 ? yinBuffer[tauEstimate - 2] : yinBuffer[tauEstimate - 1]
    const s_1 = yinBuffer[tauEstimate - 1]
    const s0 = yinBuffer[tauEstimate]
    const s1 = yinBuffer[tauEstimate + 1]
    const s2 = tauEstimate < halfBufferSize - 2 ? yinBuffer[tauEstimate + 2] : yinBuffer[tauEstimate + 1]

    // Use weighted 3-point parabolic interpolation (most accurate)
    const denominator = s_1 - 2 * s0 + s1

    if (Math.abs(denominator) > 0.00001) {
      // Avoid division by near-zero
      const adjustment = (0.5 * (s_1 - s1)) / denominator

      // Only apply adjustment if it's reasonable (within ±0.6 for better accuracy)
      if (!isNaN(adjustment) && Math.abs(adjustment) <= 0.6) {
        betterTau = tauEstimate + adjustment

        // Verify the interpolation makes sense by checking neighboring values
        const leftSlope = s0 - s_1
        const rightSlope = s1 - s0

        // If slopes have same sign, we're on a monotonic section, be more conservative
        if (leftSlope * rightSlope > 0) {
          betterTau = tauEstimate + adjustment * 0.5
        }
      }
    }
  }

  // Convert tau to frequency with high precision
  const frequency = sampleRate / betterTau

  // Validation
  if (frequency < 20 || frequency > 2000 || !isFinite(frequency)) {
    return -1
  }

  // === STEP 5: Extremely conservative octave error correction ===
  return correctOctaveErrors(frequency, Math.round(betterTau), sampleRate, halfBufferSize)
}

/**
 * Correct octave errors (very conservative to preserve accuracy)
 */
function correctOctaveErrors(freq, tau, sampleRate, maxTau) {
  const currentScore = yinBuffer[tau]

  // Much more conservative thresholds - only correct obvious octave errors
  // Check octave lower (2x tau) - only if the score is MUCH better
  const doubleTau = tau * 2
  if (doubleTau < maxTau) {
    const doubleScore = yinBuffer[doubleTau]
    // Changed from 1.1 to 0.8 - only correct if score is 20% better
    if (doubleScore < currentScore * 0.8) {
      return sampleRate / doubleTau
    }
  }

  // Check octave + fifth lower (3x tau) - even more conservative
  const tripleTau = tau * 3
  if (tripleTau < maxTau) {
    const tripleScore = yinBuffer[tripleTau]
    // Changed from 1.15 to 0.75 - only correct if score is 25% better
    if (tripleScore < currentScore * 0.75) {
      return sampleRate / tripleTau
    }
  }

  return freq
}

/**
 * Calculate cents deviation from nearest note
 * Positive = sharp, Negative = flat
 */
function calculateCentsDeviation(freq) {
  const A4 = 440
  const C0 = A4 * Math.pow(2, -4.75) // C0 = 16.35 Hz

  // Calculate exact MIDI note (fractional)
  const exactMidi = 12 * Math.log2(freq / C0)

  // Nearest MIDI note (integer)
  const nearestMidi = Math.round(exactMidi)

  // Cents deviation (100 cents = 1 semitone)
  const cents = (exactMidi - nearestMidi) * 100

  return cents
}

/**
 * Get nearest note info
 */
function getNearestNote(freq) {
  const A4 = 440
  const noteNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]

  const midi = 69 + 12 * Math.log2(freq / A4)
  const roundedMidi = Math.round(midi)
  const noteIndex = roundedMidi % 12
  const octave = Math.floor(roundedMidi / 12) - 1

  return {
    name: noteNames[noteIndex],
    octave,
    midi: roundedMidi,
    freq: A4 * Math.pow(2, (roundedMidi - 69) / 12),
  }
}

/**
 * Simple FFT for spectrogram (magnitude spectrum)
 * Returns array of magnitudes for visualization
 */
function calculateSimpleFFT(buffer, sampleRate) {
  const fftSize = 512 // Smaller FFT for real-time performance
  const magnitudes = new Float32Array(fftSize / 2)

  // Simple DFT (not full FFT, but fast enough for visualization)
  // We only calculate first 128 bins (up to ~2.6kHz at 44.1kHz)
  const maxBin = 128

  for (let k = 0; k < maxBin; k++) {
    let real = 0
    let imag = 0

    for (let n = 0; n < fftSize && n < buffer.length; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize
      real += buffer[n] * Math.cos(angle)
      imag -= buffer[n] * Math.sin(angle)
    }

    // Magnitude
    magnitudes[k] = Math.sqrt(real * real + imag * imag) / fftSize
  }

  // Normalize to 0-1 range
  let max = 0
  for (let i = 0; i < maxBin; i++) {
    if (magnitudes[i] > max) max = magnitudes[i]
  }

  if (max > 0) {
    for (let i = 0; i < maxBin; i++) {
      magnitudes[i] /= max
    }
  }

  return Array.from(magnitudes.slice(0, maxBin))
}
