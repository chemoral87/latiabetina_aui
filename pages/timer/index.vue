<template>
  <v-container fluid class="breathing-container">
    <!-- Header -->
    <v-row justify="center" class="mb-8">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="0" class="text-center pa-4" color="transparent">
          <h1 class="text-h4 font-weight-light mb-2">Ejercicio de Respiración</h1>
          <p class="text-subtitle-1 text--secondary">Configura tus tiempos y comienza a respirar</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Controles de configuración -->
    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="2" class="pa-6" rounded="lg">
          <v-card-title class="text-h6 pb-4">
            <v-icon left color="primary">mdi-cog-outline</v-icon>
            Configuración de Tiempos
          </v-card-title>

          <v-row>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="inhale" label="Inhalar" outlined dense type="number" step="0.1" suffix="seg" prepend-inner-icon="mdi-arrow-expand-vertical" color="blue" :disabled="isPlaying">
                <template #prepend>
                  <v-icon color="blue">mdi-lungs</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" sm="4">
              <v-text-field v-model.number="exhale" label="Exhalar" outlined dense type="number" step="0.1" suffix="seg" prepend-inner-icon="mdi-arrow-collapse-vertical" color="red" :disabled="isPlaying">
                <template #prepend>
                  <v-icon color="red">mdi-waves</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" sm="4">
              <v-text-field v-model.number="hold" label="Retener" outlined dense type="number" step="0.1" suffix="seg" prepend-inner-icon="mdi-pause-circle-outline" color="green" :disabled="isPlaying">
                <template #prepend>
                  <v-icon color="green">mdi-timer-sand</v-icon>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Área de animación -->
    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <v-card elevation="3" class="pa-8" rounded="lg" color="grey lighten-5">
          <!-- Indicador de estado -->
          <v-chip :color="stateColor" dark class="mb-6" large>
            <v-icon left>{{ stateIcon }}</v-icon>
            {{ stateText }}
          </v-chip>

          <!-- Círculo de animación -->
          <div class="animation-wrapper">
            <div :style="circleStyle" class="circle-animation">
              <div :style="innerCircleStyle" class="inner-circle-animation"></div>
            </div>
          </div>

          <!-- Temporizador -->
          <v-chip v-if="isPlaying" color="primary" outlined class="mt-6" large>
            <v-icon left>mdi-clock-outline</v-icon>
            {{ elapsedSeconds }}s
          </v-chip>
        </v-card>
      </v-col>
    </v-row>

    <!-- Controles de reproducción -->
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <v-btn :color="isPlaying ? 'error' : 'primary'" x-large rounded elevation="2" min-width="200" @click="toggleAnimation">
          <v-icon left large>
            {{ isPlaying ? "mdi-stop" : "mdi-play" }}
          </v-icon>
          {{ isPlaying ? "Detener" : "Comenzar" }}
        </v-btn>
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
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        backgroundColor: "green",
        transition: "transform 0.5s ease-out",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      },
      innerCircleStyle: {
        width: "75px",
        height: "75px",
        borderRadius: "50%",
        backgroundColor: "white",
        transition: "transform 0.5s ease-out",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.animation-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 450px;
}

.circle-animation {
  display: inline-block;
  margin: auto;
}

.inner-circle-animation {
  display: inline-block;
}
</style>
