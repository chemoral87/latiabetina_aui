<template>
  <v-container fluid class="timer-container">
    <!-- Header -->
    <v-row dense justify="center">
      <v-col cols="12">
        <div class="text-center">
          <h1 class="text-h6 font-weight-medium py-0 my-0">Temporizadores</h1>
        </div>
      </v-col>
    </v-row>

    <!-- Grid de Temporizadores -->
    <v-row dense>
      <v-col v-for="timer in timers" :key="timer.id" cols="6" class="timer-col">
        <v-card elevation="3" rounded="lg" class="pa-3 timer-card" :class="{ 'timer-active': timer.isRunning, 'timer-finished': timer.isFinished }" @click="toggleTimer(timer)">
          <!-- Círculo con progreso -->
          <div class="circle-wrapper">
            <svg class="progress-ring" :width="circleSize" :height="circleSize">
              <!-- Círculo de fondo -->
              <circle class="progress-ring-bg" :stroke="timer.isFinished ? '#4CAF50' : '#e0e0e0'" :stroke-width="strokeWidth" fill="transparent" :r="radius" :cx="circleSize / 2" :cy="circleSize / 2" />
              <!-- Círculo de progreso -->
              <circle class="progress-ring-circle" :stroke="getTimerColor(timer)" :stroke-width="strokeWidth" fill="transparent" :r="radius" :cx="circleSize / 2" :cy="circleSize / 2" :style="getCircleStyle(timer)" />
            </svg>

            <!-- Contenido del círculo -->
            <div class="circle-content">
              <div class="time-display">{{ formatTime(timer.currentTime) }}</div>
              <div class="time-label">{{ timer.label }}</div>
              <v-icon :color="getIconColor(timer)" size="20">
                {{ getTimerIcon(timer) }}
              </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Botón de reset global -->
    <v-row dense justify="center" class="mt-2">
      <v-col cols="12">
        <v-btn color="secondary" block small rounded elevation="2" @click="resetAllTimers">
          <v-icon left small>mdi-refresh</v-icon>
          Resetear Todos
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      circleSize: 140,
      strokeWidth: 8,
      timers: [
        {
          id: 1,
          label: "1 min",
          totalTime: 60,
          currentTime: 60,
          isRunning: false,
          isFinished: false,
          interval: null,
        },
        {
          id: 2,
          label: "30 seg",
          totalTime: 30,
          currentTime: 30,
          isRunning: false,
          isFinished: false,
          interval: null,
        },
        {
          id: 3,
          label: "20 seg",
          totalTime: 20,
          currentTime: 20,
          isRunning: false,
          isFinished: false,
          interval: null,
        },
        {
          id: 4,
          label: "10 seg",
          totalTime: 10,
          currentTime: 10,
          isRunning: false,
          isFinished: false,
          interval: null,
        },
      ],
    }
  },
  computed: {
    radius() {
      return (this.circleSize - this.strokeWidth) / 2
    },
    circumference() {
      return 2 * Math.PI * this.radius
    },
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Timers",
      icon: "mdi-timer-outline",
    })
  },
  beforeDestroy() {
    // Limpiar todos los intervalos
    this.timers.forEach((timer) => {
      if (timer.interval) {
        clearInterval(timer.interval)
      }
    })
  },
  methods: {
    toggleTimer(timer) {
      if (timer.isFinished) {
        this.resetTimer(timer)
        return
      }

      if (timer.isRunning) {
        this.pauseTimer(timer)
      } else {
        this.startTimer(timer)
      }
    },
    startTimer(timer) {
      timer.isRunning = true
      timer.isFinished = false

      timer.interval = setInterval(() => {
        if (timer.currentTime > 0) {
          timer.currentTime--
        } else {
          this.finishTimer(timer)
        }
      }, 1000)
    },
    pauseTimer(timer) {
      timer.isRunning = false
      if (timer.interval) {
        clearInterval(timer.interval)
        timer.interval = null
      }
    },
    finishTimer(timer) {
      timer.isRunning = false
      timer.isFinished = true
      if (timer.interval) {
        clearInterval(timer.interval)
        timer.interval = null
      }

      // Emitir sonido
      this.playSound()

      // Auto-reset después de 2 segundos
      setTimeout(() => {
        if (timer.isFinished) {
          this.resetTimer(timer)
        }
      }, 2000)
    },
    resetTimer(timer) {
      timer.currentTime = timer.totalTime
      timer.isRunning = false
      timer.isFinished = false
      if (timer.interval) {
        clearInterval(timer.interval)
        timer.interval = null
      }
    },
    resetAllTimers() {
      this.timers.forEach((timer) => {
        this.resetTimer(timer)
      })
    },
    playSound() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Función interna para crear cada "dong"
      const playDong = (startTime) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Frecuencia de 400Hz (más grave, suena más a "dong")
        oscillator.frequency.value = 852
        oscillator.type = "sine"

        // Envolvente de sonido: inicia fuerte y decae rápido
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.1, startTime + 0.5)

        oscillator.start(startTime)
        oscillator.stop(startTime + 0.5)
      }

      // Primer Dong (ahora mismo)
      playDong(audioContext.currentTime)

      // Segundo Dong (0.6 segundos después)
      playDong(audioContext.currentTime + 0.6)
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`
    },
    getCircleStyle(timer) {
      const progress = timer.currentTime / timer.totalTime
      const offset = this.circumference * (1 - progress)

      return {
        strokeDasharray: `${this.circumference} ${this.circumference}`,
        strokeDashoffset: offset,
        transition: "stroke-dashoffset 1s linear, stroke 0.3s ease",
      }
    },
    getTimerColor(timer) {
      if (timer.isFinished) return "#4CAF50"
      if (timer.isRunning) return "#2196F3"

      const progress = timer.currentTime / timer.totalTime
      if (progress <= 0.25) return "#F44336"
      if (progress <= 0.5) return "#FF9800"
      return "#9E9E9E"
    },
    getIconColor(timer) {
      if (timer.isFinished) return "success"
      if (timer.isRunning) return "primary"
      return "grey"
    },
    getTimerIcon(timer) {
      if (timer.isFinished) return "mdi-check-circle"
      if (timer.isRunning) return "mdi-pause-circle"
      return "mdi-play-circle"
    },
  },
}
</script>

<style scoped>
.timer-container {
  min-height: 100vh;
  padding: 0.5rem;
}

.timer-col {
  display: flex;
}

.timer-card {
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.timer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
}

.timer-active {
  background: #e3f2fd !important;
  border: 2px solid #2196f3;
}

.timer-finished {
  background: #e8f5e9 !important;
  border: 2px solid #4caf50;
}

.circle-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  opacity: 0.3;
}

.progress-ring-circle {
  transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
}

.circle-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
}

.time-display {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
}

.time-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}
</style>
