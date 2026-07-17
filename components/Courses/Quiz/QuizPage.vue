<template>
  <v-container class="pa-4" style="max-width: 900px">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap mb-4" style="gap: 12px">
      <QuizHeaderTitle :icon="icon" :title="title" :subtitle="subtitle" />
      <QuizLanguageToggle :value="lang" @input="setLang" />
    </div>

    <!-- Config screen (before starting) -->
    <QuizConfig
      v-if="!quizStarted"
      :selected-levels="selectedLevels"
      @update:selectedLevels="SET_SELECTED_LEVELS"
      :question-count="questionCount"
      @update:questionCount="SET_QUESTION_COUNT"
      :max-questions="maxQuestions"
      :starting="starting"
      :levels="levelOptions"
      :translations="translations"
      @start="startQuiz"
    />

    <!-- Quiz in progress -->
    <template v-else>
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

      <div class="d-flex align-center justify-space-between flex-wrap mb-3" style="gap: 12px">
        <QuizProgressChips
          :chips="progressChips"
          :current-index="currentQuestionIndex"
          @go-to="GO_TO_QUESTION"
        />
        <QuizProgressAutoPass
          :auto-pass="autoPass"
          :delay="autoPassDelay"
          :translations="translations"
          @toggle-autopass="SET_AUTO_PASS"
          @update:delay="SET_AUTO_PASS_DELAY"
        />
      </div>

      <QuizQuestion
        v-if="currentQuestion && currentQuestion.question"
        :key="currentQuestion.id"
        :question="currentQuestion.question"
        :answers="currentQuestion.answers"
        :level-color="levelColor(currentQuestion.level)"
        :level-icon="levelIcon(currentQuestion.level)"
        :level-label="levelLabel(currentQuestion.level)"
        :is-answered="isAnswered(currentQuestionIndex)"
        :user-answer="userAnswers[currentQuestionIndex]"
        :circle-color="answerCircleColor"
        @answer="onAnswer"
      />

      <QuizNavigation
        :current-index="currentQuestionIndex"
        :total="questions.length"
        :answered="answeredCount"
        :all-answered="allAnswered"
        :translations="translations"
        @previous="PREVIOUS_QUESTION"
        @next="NEXT_QUESTION"
        @finish="finishQuiz"
      />
    </template>

    <QuizResults
      :show="showFinalResults"
      @update:show="SET_SHOW_RESULTS"
      :correct="correctCount"
      :incorrect="incorrectCount"
      :total="questions.length"
      :result-color="finalResultColor"
      :result-icon="finalResultIcon"
      :level-stats="levelStatsList"
      :translations="translations"
      @reset="resetQuiz"
      @close="SET_SHOW_RESULTS(false)"
    />
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import QuizHeaderTitle from '~/components/Courses/Quiz/QuizHeaderTitle.vue'
import QuizLanguageToggle from '~/components/Courses/Quiz/QuizLanguageToggle.vue'
import QuizConfig from '~/components/Courses/Quiz/QuizConfig.vue'
import QuizProgressInfo from '~/components/Courses/Quiz/QuizProgressInfo.vue'
import QuizProgressChips from '~/components/Courses/Quiz/QuizProgressChips.vue'
import QuizProgressAutoPass from '~/components/Courses/Quiz/QuizProgressAutoPass.vue'
import QuizQuestion from '~/components/Courses/Quiz/QuizQuestion.vue'
import QuizNavigation from '~/components/Courses/Quiz/QuizNavigation.vue'
import QuizResults from '~/components/Courses/Quiz/QuizResults.vue'

const TRANSLATIONS = {
  es: {
    configTitle: 'Configura tu quiz',
    selectLevels: 'Selecciona los niveles',
    numQuestions: 'Número de preguntas',
    questions: 'preguntas',
    available: 'Disponibles',
    startQuiz: 'Comenzar quiz',
    previous: 'Anterior',
    next: 'Siguiente',
    finish: 'Finalizar',
    autoPass: 'Avance automático',
    question: 'Pregunta',
    of: 'de',
    correct: 'correctas',
    quizCompleted: '¡Quiz completado!',
    score: 'Puntaje',
    correctAnswers: 'Correctas',
    incorrectAnswers: 'Incorrectas',
    newQuiz: 'Nuevo quiz',
    review: 'Revisar',
  },
  en: {
    configTitle: 'Configure your quiz',
    selectLevels: 'Select levels',
    numQuestions: 'Number of questions',
    questions: 'questions',
    available: 'Available',
    startQuiz: 'Start quiz',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
    autoPass: 'Auto advance',
    question: 'Question',
    of: 'of',
    correct: 'correct',
    quizCompleted: 'Quiz completed!',
    score: 'Score',
    correctAnswers: 'Correct',
    incorrectAnswers: 'Incorrect',
    newQuiz: 'New quiz',
    review: 'Review',
  },
}

export default {
  name: 'QuizPage',
  components: {
    QuizHeaderTitle,
    QuizLanguageToggle,
    QuizConfig,
    QuizProgressInfo,
    QuizProgressChips,
    QuizProgressAutoPass,
    QuizQuestion,
    QuizNavigation,
    QuizResults,
  },

  props: {
    icon: { type: String, default: 'mdi-help-circle' },
    titleEn: { type: String, required: true },
    subtitleEn: { type: String, default: '' },
    titleEs: { type: String, required: true },
    subtitleEs: { type: String, default: '' },
    questionsEn: { type: Array, required: true },
    questionsEs: { type: Array, required: true },
  },

  data() {
    return {
      countdownActive: false,
      countdownProgress: 0,
      countdownTimer: null,
      countdownInterval: null,
    }
  },

  computed: {
    ...mapState('quiz', [
      'allQuestions',
      'selectedLevels',
      'questionCount',
      'quizStarted',
      'starting',
      'questions',
      'userAnswers',
      'currentQuestionIndex',
      'showFinalResults',
      'autoPass',
      'autoPassDelay',
    ]),

    ...mapGetters('quiz', [
      'levelConfig',
      'levelColor',
      'levelIcon',
      'levelLabel',
      'maxQuestions',
      'currentQuestion',
      'answeredCount',
      'correctCount',
      'incorrectCount',
      'allAnswered',
      'isAnswered',
      'scoreColor',
      'finalResultColor',
      'finalResultIcon',
      'progressPercent',
      'questionChipColor',
      'answerCircleColor',
      'levelStats',
    ]),

    lang() {
      return this.$store.state.quiz.lang
    },

    title() {
      return this.lang === 'en' ? this.titleEn : this.titleEs
    },

    subtitle() {
      return this.lang === 'en' ? this.subtitleEn : this.subtitleEs
    },

    currentLangQuestions() {
      return this.lang === 'en' ? this.questionsEn : this.questionsEs
    },

    translations() {
      return TRANSLATIONS[this.lang] || TRANSLATIONS.es
    },

    levelOptions() {
      return Object.keys(this.levelConfig).map((key) => ({
        key,
        icon: this.levelIcon(key),
        color: this.levelColor(key),
        label: this.levelLabel(key),
        count: this.allQuestions.filter((q) => q.level === key).length,
      }))
    },

    progressChips() {
      return this.questions.map((q, idx) => ({ color: this.questionChipColor(idx) }))
    },

    levelStatsList() {
      return Object.keys(this.levelConfig)
        .map((key) => {
          const stat = this.levelStats(key)
          return {
            key,
            label: this.levelLabel(key),
            color: this.levelColor(key),
            correct: stat.correct,
            total: stat.total,
          }
        })
        .filter((stat) => stat.total > 0)
    },
  },

  created() {
    this.RESET_QUIZ()
    this.init({ questions: this.currentLangQuestions })
  },

  beforeDestroy() {
    this.clearCountdown()
  },

  methods: {
    ...mapMutations('quiz', [
      'SET_SELECTED_LEVELS',
      'SET_QUESTION_COUNT',
      'SET_AUTO_PASS',
      'SET_AUTO_PASS_DELAY',
      'SET_SHOW_RESULTS',
      'RESET_QUIZ',
      'NEXT_QUESTION',
      'PREVIOUS_QUESTION',
      'GO_TO_QUESTION',
    ]),

    ...mapActions('quiz', ['init', 'switchLang', 'startQuiz', 'answer']),

    setLang(newLang) {
      if (newLang === this.lang) return
      this.switchLang({
        lang: newLang,
        questions: newLang === 'en' ? this.questionsEn : this.questionsEs,
      })
    },

    onAnswer(idx) {
      if (this.isAnswered(this.currentQuestionIndex)) return
      this.answer(idx)

      if (this.autoPass) {
        this.startCountdown()
      }
    },

    startCountdown() {
      this.clearCountdown()
      this.countdownActive = true
      this.countdownProgress = 0

      const totalMs = this.autoPassDelay * 1000
      const stepMs = 50
      let elapsed = 0

      this.countdownInterval = setInterval(() => {
        elapsed += stepMs
        this.countdownProgress = Math.min(100, (elapsed / totalMs) * 100)
      }, stepMs)

      this.countdownTimer = setTimeout(() => {
        this.clearCountdown()
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.NEXT_QUESTION()
        } else if (this.allAnswered) {
          this.finishQuiz()
        }
      }, totalMs)
    },

    clearCountdown() {
      if (this.countdownTimer) {
        clearTimeout(this.countdownTimer)
        this.countdownTimer = null
      }
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
      }
      this.countdownActive = false
      this.countdownProgress = 0
    },

    finishQuiz() {
      this.clearCountdown()
      this.SET_SHOW_RESULTS(true)
    },

    resetQuiz() {
      this.clearCountdown()
      this.RESET_QUIZ()
    },
  },
}
</script>
