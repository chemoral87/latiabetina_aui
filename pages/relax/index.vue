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
            <v-col cols="3">
              <v-text-field v-model.number="initialContract" label="Contracción inicial" outlined dense hide-details type="number" step="0.1" suffix="s" color="orange darken-2" :disabled="isPlaying">
                <template #prepend-inner>
                  <v-icon small color="orange darken-2">mdi-arrow-collapse-all</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="3">
              <v-text-field v-model.number="expansion" label="Expansión" outlined dense hide-details type="number" step="0.1" suffix="s" color="blue" :disabled="isPlaying">
                <template #prepend-inner>
                  <v-icon small color="blue">mdi-arrow-expand-all</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="3">
              <v-text-field v-model.number="contraction" label="Contracción" outlined dense hide-details type="number" step="0.1" suffix="s" color="red" :disabled="isPlaying">
                <template #prepend-inner>
                  <v-icon small color="red">mdi-arrow-collapse-all</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="3">
              <v-text-field v-model.number="immobile" label="Inmóvil" outlined dense hide-details type="number" step="0.1" suffix="s" color="green" :disabled="isPlaying">
                <template #prepend-inner>
                  <v-icon small color="green">mdi-timer-sand</v-icon>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row dense class="mt-1">
            <v-col cols="12">
              <v-text-field v-model.number="goalTime" label="Tiempo objetivo" outlined dense hide-details type="number" step="1" suffix="min" color="purple darken-2" :disabled="isPlaying">
                <template #prepend-inner>
                  <v-icon small color="purple darken-2">mdi-flag-checkered</v-icon>
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

            <!-- Indicadores de estado -->
            <v-col cols="7" class="d-flex flex-wrap gap-1">
              <v-chip
                v-if="initialContract > 0"
                :color="animationState === 'initialContract' ? 'orange darken-2' : 'grey lighten-1'"
                :dark="animationState === 'initialContract'"
                small
                class="mr-1 mb-1"
              >
                <v-icon left x-small>mdi-arrow-collapse-all</v-icon>
                Contracción inicial
              </v-chip>
              <v-chip
                v-if="expansion > 0"
                :color="animationState === 'expansion' ? 'blue darken-2' : 'grey lighten-1'"
                :dark="animationState === 'expansion'"
                small
                class="mr-1 mb-1"
              >
                <v-icon left x-small>mdi-arrow-expand-all</v-icon>
                Expansión
              </v-chip>
              <v-chip
                v-if="contraction > 0"
                :color="animationState === 'contraction' ? 'red darken-2' : 'grey lighten-1'"
                :dark="animationState === 'contraction'"
                small
                class="mr-1 mb-1"
              >
                <v-icon left x-small>mdi-arrow-collapse-all</v-icon>
                Contracción
              </v-chip>
              <v-chip
                v-if="immobile > 0"
                :color="animationState === 'immobile' ? 'green darken-2' : 'grey lighten-1'"
                :dark="animationState === 'immobile'"
                small
                class="mb-1"
              >
                <v-icon left x-small>mdi-timer-sand</v-icon>
                Inmóvil
              </v-chip>
            </v-col>

            <!-- Temporizador -->
            <v-col cols="auto">
              <v-chip v-if="isPlaying" color="primary" outlined small block>
                <v-icon left x-small>mdi-clock-outline</v-icon>
                {{ formattedTime }}
              </v-chip>
              <v-chip v-else color="grey" outlined small block disabled>
                <v-icon left x-small>mdi-clock-outline</v-icon>
                00:00
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
    <!-- Diálogo de felicitación -->
    <v-dialog v-model="showCompletionDialog" max-width="340" persistent>
      <v-card rounded="xl" class="text-center pa-4">
        <div class="celebration-icon mb-2">🎉</div>
        <v-card-title class="text-h6 justify-center pb-1">¡Felicidades!</v-card-title>
        <v-card-text class="text-body-1 pb-2">
          Completaste la rutina de <strong>{{ goalTime }} minuto{{ goalTime !== 1 ? 's' : '' }}</strong>.<br/>
          ¡Excelente trabajo!
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="purple darken-2" dark rounded elevation="2" @click="closeCompletion">
            <v-icon left small>mdi-refresh</v-icon>
            Volver a empezar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      goalTime: 5,
      showCompletionDialog: false,
      initialContract: 0.72,
      expansion: 5.28,
      contraction: 5.04,
      immobile: 0.96,
      animationState: "idle",
      circleStyle: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        backgroundColor: "#2E7D32",
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
    formattedTime() {
      const m = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0')
      const s = (this.elapsedSeconds % 60).toString().padStart(2, '0')
      return `${m}:${s}`
    },
    stateColor() {
      const colors = {
        initialContract: "orange darken-2",
        expansion: "blue darken-2",
        contraction: "red darken-2",
        immobile: "green darken-2",
        idle: "grey",
      }
      return colors[this.animationState] || "grey"
    },
    stateIcon() {
      const icons = {
        initialContract: "mdi-arrow-collapse-all",
        expansion: "mdi-arrow-expand-all",
        contraction: "mdi-arrow-collapse-all",
        immobile: "mdi-timer-sand",
        idle: "mdi-circle-outline",
      }
      return icons[this.animationState] || "mdi-circle-outline"
    },
    stateText() {
      const texts = {
        initialContract: "Contracción inicial",
        expansion: "Expansión",
        contraction: "Contracción",
        immobile: "Inmóvil",
        idle: "Preparado",
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
    completeAnimation() {
      this.isPlaying = false
      clearInterval(this.timerInterval)
      this.timerInterval = null
      this.timeouts.forEach((timeout) => clearTimeout(timeout))
      this.timeouts = []
      this.animationState = "idle"
      this.circleStyle.backgroundColor = "#2E7D32"
      this.circleStyle.transform = "scale(1)"
      this.circleStyle.transitionDuration = "0.5s"
      this.innerCircleStyle.transform = "scale(1)"
      this.innerCircleStyle.transitionDuration = "0.5s"
      this.showCompletionDialog = true
    },
    closeCompletion() {
      this.showCompletionDialog = false
      this.elapsedSeconds = 0
    },
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
        if (this.goalTime > 0 && this.elapsedSeconds >= this.goalTime * 60) {
          this.completeAnimation()
        }
      }, 1000)
      this.animationState = "initialContract"
      this.animateCircle()
    },
    stopAnimation() {
      this.isPlaying = false
      clearInterval(this.timerInterval)
      this.timerInterval = null
      this.elapsedSeconds = 0

      this.timeouts.forEach((timeout) => clearTimeout(timeout))
      this.timeouts = []

      this.animationState = "idle"
      this.circleStyle.backgroundColor = "#2E7D32"
      this.circleStyle.transform = "scale(1)"
      this.circleStyle.transitionDuration = "0.5s"
      this.innerCircleStyle.transform = "scale(1)"
      this.innerCircleStyle.transitionDuration = "0.5s"
    },
    animateCircle() {
      if (!this.isPlaying) return

      if (this.animationState === "initialContract") {
        // 1. Contracción inicial: el círculo se encoge levemente
        this.circleStyle.transitionDuration = `${this.initialContract}s`
        this.circleStyle.transitionTimingFunction = "ease-in"
        this.circleStyle.backgroundColor = "#FF9800"
        this.circleStyle.transform = "scale(0.75)"
        this.innerCircleStyle.transitionDuration = `${this.initialContract}s`
        this.innerCircleStyle.transitionTimingFunction = "ease-in"
        this.innerCircleStyle.transform = "scale(1.3)"
        const t1 = setTimeout(() => {
          this.animationState = "expansion"
          this.animateCircle()
        }, this.initialContract * 1000)
        this.timeouts.push(t1)

      } else if (this.animationState === "expansion") {
        // 2. Expansión: el círculo crece al máximo
        this.circleStyle.transitionDuration = `${this.expansion}s`
        this.circleStyle.transitionTimingFunction = "ease-out"
        this.circleStyle.backgroundColor = "#1565C0"
        this.circleStyle.transform = "scale(3)"
        this.innerCircleStyle.transitionDuration = `${this.expansion}s`
        this.innerCircleStyle.transitionTimingFunction = "ease-out"
        this.innerCircleStyle.transform = "scale(0.777)"
        const t2 = setTimeout(() => {
          this.animationState = "contraction"
          this.animateCircle()
        }, this.expansion * 1000)
        this.timeouts.push(t2)

      } else if (this.animationState === "contraction") {
        // 3. Contracción: el círculo vuelve a su tamaño normal
        this.circleStyle.transitionDuration = `${this.contraction}s`
        this.circleStyle.transitionTimingFunction = "ease-in-out"
        this.circleStyle.backgroundColor = "#C62828"
        this.circleStyle.transform = "scale(1)"
        this.innerCircleStyle.transitionDuration = `${this.contraction}s`
        this.innerCircleStyle.transitionTimingFunction = "ease-in-out"
        this.innerCircleStyle.transform = "scale(1)"
        const t3 = setTimeout(() => {
          this.animationState = "immobile"
          this.animateCircle()
        }, this.contraction * 1000)
        this.timeouts.push(t3)

      } else if (this.animationState === "immobile") {
        // 4. Inmóvil: el círculo permanece quieto
        this.circleStyle.transitionDuration = `${this.immobile}s`
        this.circleStyle.transitionTimingFunction = "linear"
        this.circleStyle.backgroundColor = "#2E7D32"
        this.circleStyle.transform = "scale(1)"
        this.innerCircleStyle.transitionDuration = `${this.immobile}s`
        this.innerCircleStyle.transitionTimingFunction = "linear"
        this.innerCircleStyle.transform = "scale(1)"
        const t4 = setTimeout(() => {
          // Reinicia el ciclo
          this.animationState = "initialContract"
          this.animateCircle()
        }, this.immobile * 1000)
        this.timeouts.push(t4)
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

.celebration-icon {
  font-size: 3rem;
  line-height: 1;
}
</style>