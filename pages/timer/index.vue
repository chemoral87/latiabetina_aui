<template>
  <v-container fluid>
    <v-row dense>
      <!-- Filtro de búsqueda -->
      <v-col cols="12" md="2"></v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-text-field v-model="inhale" label="Inhalar" outlined></v-text-field>
      </v-col>
      <v-col cols="auto">
        <v-text-field v-model="exhale" label="Exhalar" outlined></v-text-field>
      </v-col>
      <v-col cols="auto">
        <v-text-field v-model="hold" label="Retener" outlined></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn :color="isPlaying ? 'red' : 'primary'" @click="toggleAnimation">
          {{ isPlaying ? "Stop" : "Play" }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <span v-if="isPlaying">Tiempo: {{ elapsedSeconds }}s</span>
      </v-col>
    </v-row>
    <v-row justify="center">
      <div :style="circleStyle" class="circle-animation">
        <div :style="innerCircleStyle" class="inner-circle-animation"></div>
      </div>
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
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        backgroundColor: "green",
        transition: "transform 0.5s ease-out", // Default easing
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      innerCircleStyle: {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "white",
        transition: "transform 0.5s ease-out", // Default easing
      },
      isPlaying: false,
      elapsedSeconds: 0,
      timerInterval: null,
      timeouts: [], // Array to store timeout references
    }
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
<style>
.circle-animation {
  display: inline-block;
}
.inner-circle-animation {
  display: inline-block;
}
</style>
