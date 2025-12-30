<template>
  <v-container fluid class="breathing-container">
    <!-- Header -->
    <v-row dense justify="center">
      <v-col cols="12">
        <div class="text-center">
          <h1 class="text-h6 font-weight-medium py-0 my-0">Ejercicio de Respiración</h1>
        </div>
      </v-col>
    </v-row>

    <!-- Controles de configuración -->
    <v-row dense justify="center">
      <v-col cols="12">
        <v-card elevation="2" rounded="lg" class="pa-1">
          <v-card-title class="text-subtitle-1 py-0 my-0">
            <v-icon left small color="primary">mdi-cog-outline</v-icon>
            Configuración
          </v-card-title>

          <v-row dense>
            <v-col cols="4">
              <v-text-field v-model.number="inhale" label="Inhalar" outlined dense hide-details type="number" step="0.1" suffix="s" color="blue" :disabled="isPlaying">
                <template #prepend-inner>
                  <v-icon small color="blue">mdi-lungs</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="4">
              <v-text-field v-model.number="exhale" label="Exhalar" outlined dense hide-details type="number" step="0.1" suffix="s" color="red" :disabled="isPlaying">
                <template #prepend-inner>
                  <v-icon small color="red">mdi-waves</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="4">
              <v-text-field v-model.number="hold" label="Retener" outlined dense hide-details type="number" step="0.1" suffix="s" color="green" :disabled="isPlaying">
                <template #prepend-inner>
                  <v-icon small color="green">mdi-timer-sand</v-icon>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Área de animación y controles -->
    <v-row dense justify="center" class="mb-3">
      <v-col cols="12">
        <v-card elevation="3" class="pa-3" rounded="lg" color="grey lighten-5">
          <v-row dense align="center">
            <!-- Botón de control -->
            <v-col cols="5">
              <v-btn :color="isPlaying ? 'error' : 'primary'" rounded elevation="2" small @click="toggleAnimation">
                <v-icon left small>
                  {{ isPlaying ? "mdi-stop" : "mdi-play" }}
                </v-icon>
                {{ isPlaying ? "Detener" : "Comenzar" }}
              </v-btn>
            </v-col>

            <!-- Indicador de estado -->
            <v-col cols="4">
              <v-chip :color="stateColor" dark small block>
                <v-icon left x-small>{{ stateIcon }}</v-icon>
                {{ stateText }}
              </v-chip>
            </v-col>

            <!-- Temporizador -->
            <v-col cols="auto">
              <v-chip v-if="isPlaying" color="primary" outlined small block>
                <v-icon left x-small>mdi-clock-outline</v-icon>
                {{ elapsedSeconds }}s
              </v-chip>
              <v-chip v-else color="grey" outlined small block disabled>
                <v-icon left x-small>mdi-clock-outline</v-icon>
                0s
              </v-chip>
            </v-col>
          </v-row>

          <!-- Círculo de animación -->
          <div class="animation-wrapper">
            <div :style="circleStyle" class="circle-animation">
              <div :style="innerCircleStyle" class="inner-circle-animation"></div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      inhale: 5.4,
      exhale: 5,
      hold: 1.6,
      animationState: "hold",
      circleStyle: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        backgroundColor: "green",
        transition: "transform 0.5s ease-out",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      },
      innerCircleStyle: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "white",
        transition: "transform 0.5s ease-out",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
      isPlaying: false,
      elapsedSeconds: 0,
      timerInterval: null,
      timeouts: [],
    }
  },
  computed: {
    stateColor() {
      const colors = {
        hold: "green",
        inhale: "blue",
        exhale: "red",
      }
      return colors[this.animationState] || "grey"
    },
    stateIcon() {
      const icons = {
        hold: "mdi-timer-sand",
        inhale: "mdi-arrow-expand-vertical",
        exhale: "mdi-arrow-collapse-vertical",
      }
      return icons[this.animationState] || "mdi-circle"
    },
    stateText() {
      const texts = {
        hold: "Reteniendo",
        inhale: "Inhalando",
        exhale: "Exhalando",
      }
      return texts[this.animationState] || "Preparado"
    },
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Timer",
      icon: "mdi-clock-outline",
    })
  },
  methods: {
    toggleAnimation() {
      if (this.isPlaying) {
        this.stopAnimation()
      } else {
        this.startAnimation()
      }
    },
    startAnimation() {
      this.isPlaying = true
      this.elapsedSeconds = 0
      this.timerInterval = setInterval(() => {
        this.elapsedSeconds++
      }, 1000)
      this.animateCircle()
    },
    stopAnimation() {
      this.isPlaying = false
      clearInterval(this.timerInterval)
      this.timerInterval = null
      this.elapsedSeconds = 0

      // Clear all timeouts
      this.timeouts.forEach((timeout) => clearTimeout(timeout))
      this.timeouts = []

      // Reset to initial state
      this.animationState = "hold"
      this.circleStyle.backgroundColor = "green"
      this.circleStyle.transform = "scale(1)"
      this.innerCircleStyle.transform = "scale(1)"
    },
    animateCircle() {
      if (!this.isPlaying) return

      if (this.animationState === "hold") {
        this.circleStyle.transitionDuration = `${this.hold}s`
        this.circleStyle.transitionTimingFunction = "ease-out"
        this.circleStyle.backgroundColor = "green"
        this.circleStyle.transform = "scale(1)"
        this.innerCircleStyle.transitionDuration = `${this.hold}s`
        this.innerCircleStyle.transitionTimingFunction = "ease-out"
        this.innerCircleStyle.transform = "scale(1)"
        const timeout = setTimeout(() => {
          this.circleStyle.transitionTimingFunction = "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
          this.innerCircleStyle.transitionTimingFunction = "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
          this.animationState = "inhale"
          this.animateCircle()
        }, this.hold * 1000)
        this.timeouts.push(timeout)
      } else if (this.animationState === "inhale") {
        this.circleStyle.transitionDuration = `${this.inhale}s`
        this.circleStyle.transitionTimingFunction = "ease-out"
        this.circleStyle.backgroundColor = "blue"
        this.circleStyle.transform = "scale(3)"
        this.innerCircleStyle.transitionDuration = `${this.inhale}s`
        this.innerCircleStyle.transitionTimingFunction = "ease-out"
        this.innerCircleStyle.transform = "scale(.777)"
        const timeout = setTimeout(() => {
          this.circleStyle.transitionTimingFunction = "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
          this.innerCircleStyle.transitionTimingFunction = "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
          this.animationState = "exhale"
          this.animateCircle()
        }, this.inhale * 1000)
        this.timeouts.push(timeout)
      } else if (this.animationState === "exhale") {
        this.circleStyle.transitionDuration = `${this.exhale}s`
        this.circleStyle.transitionTimingFunction = "ease-out"
        this.circleStyle.backgroundColor = "red"
        this.circleStyle.transform = "scale(1)"
        this.innerCircleStyle.transitionDuration = `${this.exhale}s`
        this.innerCircleStyle.transitionTimingFunction = "ease-out"
        this.innerCircleStyle.transform = "scale(1)"
        const timeout = setTimeout(() => {
          this.animationState = "hold"
          this.animateCircle()
        }, this.exhale * 1000)
        this.timeouts.push(timeout)
      }
    },
  },
}
</script>

<style scoped>
.breathing-container {
  min-height: 100vh;
  padding: 0.5rem;
}

.animation-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  overflow: hidden;
  padding: 10px;
}

.circle-animation {
  display: inline-block;
  margin: auto;
}

.inner-circle-animation {
  display: inline-block;
}
</style>
