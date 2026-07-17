<template>
  <div>
    <!-- Full-width header bar when quiz is active -->
    <div id="quiz-header" v-if="quizStarted" style="background: #fafafa; border-bottom: 1px solid #e0e0e0;">
      <v-container fluid class="py-2 px-4">
        <v-row align="center">
          <QuizHeaderTitle icon="mdi-vuejs" :title="t('title')" :subtitle="t('subtitle')" />

          <!-- Progress info: counter, score, progress bar, countdown -->
          <v-col cols="12" md="3">
            <QuizProgressInfo
              :current-index="currentQuestionIndex"
              :total="questions.length"
              :correct="correctCount"
              :answered="answeredCount"
              :progress="progressPercent"
              :score-color="scoreColor"
              :auto-pass="autoPass"
              :countdown-active="countdownActive"
              :countdown-progress="countdownProgress"
              :translations="translations"
            />
          </v-col>

          <!-- Question chips -->
          <v-col cols="12" md="2">
            <QuizProgressChips
              :chips="questionChips"
              :current-index="currentQuestionIndex"
              @go-to="GO_TO_QUESTION"
            />
          </v-col>

          <!-- Auto-advance controls -->
          <v-col cols="12" md="2">
            <QuizProgressAutoPass
              :auto-pass="autoPass"
              :delay="autoPassDelay"
              :translations="translations"
              @toggle-autopass="SET_AUTO_PASS"
              @update:delay="SET_AUTO_PASS_DELAY"
            />
          </v-col>

          <!-- Language toggle (2 cols) -->
          <v-col cols="12" md="2" class="d-flex justify-end">
            <QuizLanguageToggle :value="lang" @input="switchLang" />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Main content -->
    <v-container id="quiz-main" class="pa-4">
      <template v-if="!quizStarted">
        <QuizLanguageToggle :value="lang" @input="switchLang" />

        <div class="text-center mb-6">
          <v-icon large color="primary" class="mb-2">mdi-vuejs</v-icon>
          <h2 class="text-h4 font-weight-bold primary--text">{{ t('title') }}</h2>
          <p class="text-body-2 grey--text mt-1">{{ t('subtitle') }}</p>
        </div>

        <QuizConfig :selected-levels="selectedLevels" :question-count="questionCount" :max-questions="maxQuestions"
          :starting="starting" :levels="configLevels" :translations="translations"
          @update:selectedLevels="SET_SELECTED_LEVELS" @update:questionCount="SET_QUESTION_COUNT" @start="startQuiz" />
      </template>

      <template v-else>
        <QuizQuestion :question="currentQuestion.question" :answers="currentQuestion.answers || []"
          :level-color="levelColor(currentQuestion.level)" :level-icon="levelIcon(currentQuestion.level)"
          :level-label="levelLabel(currentQuestion.level)" :is-answered="isAnswered(currentQuestionIndex)"
          :user-answer="userAnswers[currentQuestionIndex]" :circle-color="answerCircleColor" @answer="answer" />

        <QuizNavigation :current-index="currentQuestionIndex" :total="questions.length" :answered="answeredCount"
          :all-answered="allAnswered" :translations="translations" @previous="PREVIOUS_QUESTION" @next="NEXT_QUESTION"
          @finish="showResults" />

        <QuizResults :show="showFinalResults" :correct="correctCount" :incorrect="incorrectCount"
          :total="questions.length" :result-color="finalResultColor" :result-icon="finalResultIcon"
          :level-stats="resultsLevelStats" :translations="translations" @reset="RESET_QUIZ" @close="hideResults" />
      </template>
    </v-container>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import questionsEn from './questions_en.json'
import questionsEs from './questions_es.json'
import QuizLanguageToggle from '~/components/Courses/Quiz/QuizLanguageToggle.vue'
import QuizConfig from '~/components/Courses/Quiz/QuizConfig.vue'
import QuizHeaderTitle from '~/components/Courses/Quiz/QuizHeaderTitle.vue'
import QuizProgressInfo from '~/components/Courses/Quiz/QuizProgressInfo.vue'
import QuizProgressChips from '~/components/Courses/Quiz/QuizProgressChips.vue'
import QuizProgressAutoPass from '~/components/Courses/Quiz/QuizProgressAutoPass.vue'
import QuizQuestion from '~/components/Courses/Quiz/QuizQuestion.vue'
import QuizNavigation from '~/components/Courses/Quiz/QuizNavigation.vue'
import QuizResults from '~/components/Courses/Quiz/QuizResults.vue'

const QUESTIONS = { en: questionsEn, es: questionsEs }

const TRANSLATIONS = {
  en: {
    title: 'Vue 3 Quiz',
    subtitle: 'Test your Vue 3 knowledge',
    configTitle: 'Configure your Quiz',
    selectLevels: 'Select levels:',
    numQuestions: 'Number of questions:',
    available: 'Available',
    questions: 'questions',
    startQuiz: 'Start Quiz',
    question: 'Question',
    of: 'of',
    correct: 'correct',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
    quizCompleted: 'Quiz Completed!',
    score: 'Score',
    correctAnswers: 'Correct',
    incorrectAnswers: 'Incorrect',
    newQuiz: 'New Quiz',
    review: 'Review',
    autoPass: 'Auto-advance',
    delay: 'Delay',
  },
  es: {
    title: 'Vue 3 Quiz',
    subtitle: 'Pon a prueba tus conocimientos de Vue 3',
    configTitle: 'Configura tu Quiz',
    selectLevels: 'Selecciona los niveles:',
    numQuestions: 'Número de preguntas:',
    available: 'Disponibles',
    questions: 'preguntas',
    startQuiz: 'Comenzar Quiz',
    question: 'Pregunta',
    of: 'de',
    correct: 'correctas',
    previous: 'Anterior',
    next: 'Siguiente',
    finish: 'Finalizar',
    quizCompleted: '¡Quiz Completado!',
    score: 'Aciertos',
    correctAnswers: 'Correctas',
    incorrectAnswers: 'Incorrectas',
    newQuiz: 'Nuevo Quiz',
    review: 'Revisar',
    autoPass: 'Auto-avance',
    delay: 'Espera',
  },
}

export default {
  components: {
    QuizLanguageToggle,
    QuizConfig,
    QuizHeaderTitle,
    QuizProgressInfo,
    QuizProgressChips,
    QuizProgressAutoPass,
    QuizQuestion,
    QuizNavigation,
    QuizResults,
  },

  computed: {
    ...mapState('quiz', [
      'lang', 'selectedLevels', 'questionCount', 'quizStarted', 'starting',
      'questions', 'userAnswers', 'currentQuestionIndex', 'showFinalResults', 'autoPass', 'autoPassDelay',
    ]),
    ...mapGetters('quiz', [
      'maxQuestions', 'currentQuestion', 'answeredCount', 'correctCount',
      'incorrectCount', 'allAnswered', 'scoreColor', 'finalResultColor',
      'finalResultIcon', 'progressPercent', 'answerCircleColor', 'isAnswered',
      'levelColor', 'levelIcon', 'levelLabel', 'levelCount', 'levelStats',
      'questionChipColor',
    ]),

    configLevels() {
      return ['basic', 'intermediate', 'expert'].map((key) => ({
        key,
        color: this.levelColor(key),
        icon: this.levelIcon(key),
        label: this.levelLabel(key),
        count: this.levelCount(key, this.lang),
      }))
    },

    questionChips() {
      return this.questions.map((_, idx) => ({ color: this.questionChipColor(idx) }))
    },

    resultsLevelStats() {
      return ['basic', 'intermediate', 'expert'].map((key) => ({
        key,
        label: this.levelLabel(key),
        color: this.levelColor(key),
        ...this.levelStats(key),
      }))
    },

    translations() {
      return TRANSLATIONS[this.lang] || TRANSLATIONS.en
    },

    t() {
      return (key) => TRANSLATIONS[this.lang]?.[key] || key
    },
  },

  data() {
    return {
      countdownTimer: null,
      countdownActive: false,
      countdownProgress: 0,
    }
  },

  watch: {
    answeredCount(newVal, oldVal) {
      if (!this.autoPass) return
      if (newVal <= oldVal) return
      if (this.allAnswered) {
        this.startAutoPassTimer(() => this.showResults())
      } else {
        this.startAutoPassTimer(() => this.NEXT_QUESTION())
      }
    },
    currentQuestionIndex() {
      this.cancelAutoPassTimer()
    },
  },

  methods: {
    ...mapMutations('quiz', [
      'SET_SELECTED_LEVELS', 'SET_QUESTION_COUNT', 'SET_AUTO_PASS', 'SET_AUTO_PASS_DELAY',
      'NEXT_QUESTION', 'PREVIOUS_QUESTION', 'GO_TO_QUESTION',
      'SET_SHOW_RESULTS', 'RESET_QUIZ',
    ]),
    ...mapActions('quiz', ['init', 'startQuiz', 'answer']),

    switchLang(lang) {
      this.$store.dispatch('quiz/switchLang', { lang, questions: QUESTIONS[lang] })
    },

    showResults() { this.SET_SHOW_RESULTS(true) },
    hideResults() { this.SET_SHOW_RESULTS(false) },

    startAutoPassTimer(callback) {
      this.cancelAutoPassTimer()
      this.countdownActive = true
      this.countdownProgress = 100
      const startTime = Date.now()
      const duration = (this.autoPassDelay || 3) * 1000
      this.countdownTimer = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
        this.countdownProgress = remaining
        if (elapsed >= duration) {
          this.cancelAutoPassTimer()
          callback()
        }
      }, 50)
    },

    cancelAutoPassTimer() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
      this.countdownActive = false
      this.countdownProgress = 0
    },
  },

  created() {
    const data = QUESTIONS[this.lang] || questionsEs
    this.init({ questions: data })
  },

  beforeDestroy() {
    this.cancelAutoPassTimer()
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
