<template>
  <v-dialog id="quiz-results" :value="show" max-width="600" persistent @input="$emit('update:show', $event)">
    <v-card class="rounded-xl text-center pa-6">
      <v-card-text>
        <v-icon :color="resultColor" size="80" class="mb-4">
          {{ resultIcon }}
        </v-icon>

        <h2 class="text-h4 font-weight-bold mb-2">{{ t('quizCompleted') }}</h2>

        <div class="d-flex justify-center align-center my-4">
          <div class="text-center mx-4">
            <div class="text-h2 font-weight-bold" :class="resultColor">
              {{ Math.round((correct / total) * 100) }}%
            </div>
            <div class="text-body-1 grey--text">{{ t('score') }}</div>
          </div>
          <v-divider vertical class="mx-4" style="height: 80px"></v-divider>
          <div class="text-center mx-4">
            <div class="text-h2 font-weight-bold green--text">{{ correct }}</div>
            <div class="text-body-1 grey--text">{{ t('correctAnswers') }}</div>
          </div>
          <v-divider vertical class="mx-4" style="height: 80px"></v-divider>
          <div class="text-center mx-4">
            <div class="text-h2 font-weight-bold red--text">{{ incorrect }}</div>
            <div class="text-body-1 grey--text">{{ t('incorrectAnswers') }}</div>
          </div>
        </div>

        <v-divider class="my-4"></v-divider>

        <div class="d-flex justify-center flex-wrap" style="gap: 16px">
          <div class="text-center" v-for="stat in levelStats" :key="stat.key">
            <div class="text-body-2 font-weight-medium" :class="stat.color + '--text'">
              {{ stat.label }}
            </div>
            <div class="text-h6">{{ stat.correct }}/{{ stat.total }}</div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn color="primary" large class="px-8 rounded-lg" @click="$emit('reset')">
          <v-icon left>mdi-refresh</v-icon>
          {{ t('newQuiz') }}
        </v-btn>
        <v-btn color="grey" large outlined class="px-8 rounded-lg" @click="$emit('close')">
          {{ t('review') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'QuizResults',
  props: {
    show: { type: Boolean, default: false },
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    total: { type: Number, required: true },
    resultColor: { type: String, default: 'green--text' },
    resultIcon: { type: String, default: 'mdi-emoticon-happy' },
    levelStats: { type: Array, default: () => [] },
    translations: { type: Object, default: () => ({}) },
  },

  methods: {
    t(key) { return this.translations[key] || key },
  },
}
</script>
