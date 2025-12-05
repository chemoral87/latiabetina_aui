// pitch-worker.js (Web Worker for pitch detection)
self.onmessage = function (e) {
  const { buffer, sampleRate, sensitivity, noiseProfile, noiseThreshold } = e.data
  const SIZE = buffer.length
  let sumSquares = 0
  let maxSample = 0
  for (let i = 0; i < SIZE; i++) {
    const sample = buffer[i]
    sumSquares += sample * sample
    if (Math.abs(sample) > maxSample) maxSample = Math.abs(sample)
  }
  const rms = Math.sqrt(sumSquares / SIZE)
  const dBSPL = 20 * Math.log10(rms / 0.00002)
  // Noise filtering
  if (noiseProfile && rms < noiseProfile * noiseThreshold) {
    self.postMessage({ freq: -1, dB: dBSPL.toFixed(1) })
    return
  }
  // Sensitivity
  const effectiveSensitivity = maxSample > 0.05 ? sensitivity * 0.5 : sensitivity
  if (dBSPL < 25 || rms < effectiveSensitivity || maxSample < 0.008) {
    self.postMessage({ freq: -1, dB: dBSPL.toFixed(1) })
    return
  }
  const PEAK_THRESHOLD_FACTOR = 0.15
  const WINDOW_PADDING = 15
  const threshold = maxSample * PEAK_THRESHOLD_FACTOR
  let start = 0
  let end = SIZE - 1
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) > threshold) {
      start = Math.max(0, i - WINDOW_PADDING)
      break
    }
  }
  for (let i = SIZE - 1; i > SIZE / 2; i--) {
    if (Math.abs(buffer[i]) > threshold) {
      end = Math.min(SIZE - 1, i + WINDOW_PADDING)
      break
    }
  }
  const windowSize = end - start
  if (windowSize <= 0) {
    self.postMessage({ freq: -1, dB: dBSPL.toFixed(1) })
    return
  }
  const correlationArray = new Float32Array(windowSize)
  for (let lag = 0; lag < windowSize; lag++) {
    let sum = 0
    for (let i = 0; i < windowSize - lag; i++) {
      sum += buffer[start + i] * buffer[start + i + lag]
    }
    correlationArray[lag] = sum
  }
  let dipIndex = 0
  while (dipIndex < windowSize - 1 && correlationArray[dipIndex] > correlationArray[dipIndex + 1]) {
    dipIndex++
  }
  let maxVal = -Infinity
  let peakIndex = -1
  for (let i = dipIndex; i < windowSize; i++) {
    if (correlationArray[i] > maxVal) {
      maxVal = correlationArray[i]
      peakIndex = i
    }
  }
  if (peakIndex <= 0) {
    self.postMessage({ freq: -1, dB: dBSPL.toFixed(1) })
    return
  }
  // Parabolic interpolation
  let refinedPeak = peakIndex
  if (peakIndex > 0 && peakIndex < windowSize - 1) {
    const y1 = correlationArray[peakIndex - 1]
    const y2 = correlationArray[peakIndex]
    const y3 = correlationArray[peakIndex + 1]
    const offset = (0.5 * (y1 - y3)) / (y1 - 2 * y2 + y3)
    if (!isNaN(offset) && Math.abs(offset) < 1) {
      refinedPeak = peakIndex + offset
    }
  }
  let freq = sampleRate / refinedPeak
  // Harmonic check
  const checkHarmonic = (divisor, thresholdRatio) => {
    const subIndex = Math.floor(peakIndex / divisor)
    if (subIndex > 0 && subIndex < windowSize) {
      const subVal = correlationArray[subIndex]
      if (subVal > thresholdRatio * maxVal) {
        return sampleRate / subIndex
      }
    }
    return freq
  }
  const clarity = maxVal / correlationArray[0]
  if (freq > 0 && freq < 2000) {
    if (freq >= 80 && freq <= 110 && clarity < 0.5) {
      self.postMessage({ freq: -1, dB: dBSPL.toFixed(1) })
      return
    }
    if (freq > 300 && freq < 600) {
      freq = checkHarmonic(2, 0.95)
    } else if (freq > 450 && freq < 900) {
      freq = checkHarmonic(3, 0.92)
    }
  }
  if (freq > 20 && freq < 2000) {
    self.postMessage({ freq, dB: dBSPL.toFixed(1) })
  } else {
    self.postMessage({ freq: -1, dB: dBSPL.toFixed(1) })
  }
}
