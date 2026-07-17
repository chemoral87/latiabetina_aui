<template>
  <div class="quiz-progress-info mb-2">
    <div class="d-flex align-center justify-space-between mb-1">
      <span class="text-body-2 font-weight-medium">
        {{ t('question') }} {{ currentIndex + 1 }} {{ t('of') }} {{ total }}
      </span>
      <span class="text-body-2 font-weight-medium" :class="scoreColor">
        {{ correct }}/{{ answered }} {{ t('correct') }}
      </span>
    </div>

    <v-progress-linear :value="progress" color="primary" height="8" rounded></v-progress-linear>

    <!-- AutoPass countdown bar -->
    <div v-if="autoPass && countdownActive" class="mt-1"
      style="height: 3px; background: #e0e0e0; border-radius: 2px; overflow: hidden;">
      <div class="countdown-bar" :style="{ width: countdownProgress + '%' }"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizProgressInfo',
  props: {
    currentIndex: { type: Number, required: true },
    total: { type: Number, required: true },
    correct: { type: Number, default: 0 },
    answered: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    scoreColor: { type: String, default: '' },
    autoPass: { type: Boolean, default: false },
    countdownActive: { type: Boolean, default: false },
    countdownProgress: { type: Number, default: 0 },
    translations: { type: Object, default: () => ({}) },
  },

  methods: {
    t(key) { return this.translations[key] || key },
  },
}
</script>

<style scoped>
.countdown-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  border-radius: 2px;
  transition: width 0.1s linear;
}
</style>
