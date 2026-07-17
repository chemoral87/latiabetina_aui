<template>
  <v-card id="quiz-question" class="mb-4 rounded-lg" elevation="2">
    <!-- Level badge -->
    <div class="pa-4 pb-0 d-flex align-center">
      <v-chip small :color="levelColor" text-color="white" class="mb-2">
        <v-icon x-small left>{{ levelIcon }}</v-icon>
        {{ levelLabel }}
      </v-chip>
    </div>

    <v-card-title class="text-h6 pt-2 pb-0 black--text">
      {{ question }}
    </v-card-title>

    <v-card-text class="pa-4">
      <div
        v-for="(answer, idx) in answers"
        :key="idx"
        :class="getAnswerClasses(idx)"
        @click="onAnswerClick(idx)"
      >
        <div class="d-flex align-center">
          <v-icon
            v-if="isAnswered && answer.isCorrect"
            small
            color="success"
            class="mr-2"
          >
            mdi-check-circle
          </v-icon>
          <v-icon
            v-else-if="isAnswered && userAnswer === idx && !answer.isCorrect"
            small
            color="error"
            class="mr-2"
          >
            mdi-close-circle
          </v-icon>
          <v-icon v-else small :color="circleColor" class="mr-2">
            mdi-circle-outline
          </v-icon>
          <span :class="getAnswerTextClass(idx)">{{ answer.text }}</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'QuizQuestion',
  props: {
    question: { type: String, required: true },
    answers: { type: Array, required: true },
    levelColor: { type: String, default: 'grey' },
    levelIcon: { type: String, default: 'mdi-help' },
    levelLabel: { type: String, default: '' },
    isAnswered: { type: Boolean, default: false },
    userAnswer: { type: Number, default: null },
    circleColor: { type: String, default: 'grey darken-1' },
  },

  methods: {
    getAnswerClasses(idx) {
      const classes = ['d-flex', 'align-center', 'pa-3', 'mb-2', 'rounded-lg', 'answer-option']
      if (!this.isAnswered) {
        classes.push('answer-unanswered')
        return classes
      }
      const answer = this.answers[idx]
      if (answer.isCorrect) {
        classes.push('answer-correct')
      } else if (this.userAnswer === idx) {
        classes.push('answer-wrong')
      } else {
        classes.push('answer-disabled')
      }
      return classes
    },

    getAnswerTextClass(idx) {
      const classes = []
      if (!this.isAnswered) {
        classes.push('black--text')
        return classes
      }
      const answer = this.answers[idx]
      if (answer.isCorrect) {
        classes.push('green--text', 'font-weight-bold')
      } else if (this.userAnswer === idx) {
        classes.push('red--text', 'font-weight-bold')
      } else {
        classes.push('grey--text')
      }
      return classes
    },

    onAnswerClick(idx) {
      if (!this.isAnswered) {
        this.$emit('answer', idx)
      }
    },
  },
}
</script>

<style scoped>
.answer-option {
  transition: all 0.2s ease;
  border: 2px solid transparent;
  cursor: pointer;
  user-select: none;
}
.answer-unanswered:hover {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}
.answer-correct {
  background-color: #e8f5e9 !important;
  border-color: #4caf50 !important;
}
.answer-wrong {
  background-color: #ffebee !important;
  border-color: #f44336 !important;
}
.answer-disabled {
  opacity: 0.6;
  cursor: default !important;
}
.theme--dark .answer-unanswered:hover {
  background-color: #424242;
  border-color: #616161;
}
.theme--dark .answer-correct {
  background-color: #1b5e20 !important;
  border-color: #4caf50 !important;
}
.theme--dark .answer-wrong {
  background-color: #b71c1c !important;
  border-color: #f44336 !important;
}
</style>
