const LEVEL_CONFIG = {
  basic: { color: 'green', icon: 'mdi-star', label: { en: 'Basic', es: 'Básico' }, count: { en: 60, es: 60 } },
  intermediate: { color: 'orange', icon: 'mdi-star-half-full', label: { en: 'Intermediate', es: 'Intermedio' }, count: { en: 60, es: 60 } },
  expert: { color: 'red', icon: 'mdi-star-outline', label: { en: 'Expert', es: 'Experto' }, count: { en: 60, es: 60 } },
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const state = () => ({
  lang: 'es',
  allQuestions: [],
  selectedLevels: ['basic', 'intermediate', 'expert'],
  questionCount: 15,
  quizStarted: false,
  starting: false,
  questions: [],
  userAnswers: [],
  currentQuestionIndex: 0,
  showFinalResults: false,
  autoPass: true,
  autoPassDelay: 3,
})

export const getters = {
  levelConfig: () => LEVEL_CONFIG,

  levelColor: () => (level) => LEVEL_CONFIG[level]?.color || 'grey',
  levelIcon: () => (level) => LEVEL_CONFIG[level]?.icon || 'mdi-help',
  levelLabel: (state) => (level) => LEVEL_CONFIG[level]?.label?.[state.lang] || LEVEL_CONFIG[level]?.label || level,
  levelCount: () => (level, lang) => LEVEL_CONFIG[level]?.count?.[lang] || 50,

  maxQuestions(state) {
    if (state.selectedLevels.length === 0) return 0
    return state.allQuestions.filter((q) => state.selectedLevels.includes(q.level)).length
  },

  currentQuestion(state) {
    return state.questions[state.currentQuestionIndex] || {}
  },

  answeredCount(state) {
    return state.userAnswers.filter((a) => a !== null && a !== undefined).length
  },

  correctCount(state) {
    return state.questions.reduce((count, question, idx) => {
      if (state.userAnswers[idx] === null || state.userAnswers[idx] === undefined) return count
      return count + (question.answers[state.userAnswers[idx]].isCorrect ? 1 : 0)
    }, 0)
  },

  incorrectCount(state, getters) {
    return getters.answeredCount - getters.correctCount
  },

  allAnswered(state, getters) {
    return getters.answeredCount === state.questions.length
  },

  isAnswered: (state) => (index) => {
    return state.userAnswers[index] !== null && state.userAnswers[index] !== undefined
  },

  scoreColor(state, getters) {
    if (getters.answeredCount === 0) return ''
    const pct = getters.correctCount / getters.answeredCount
    if (pct >= 0.8) return 'green--text'
    if (pct >= 0.5) return 'orange--text'
    return 'red--text'
  },

  finalResultColor(state, getters) {
    const pct = getters.correctCount / state.questions.length
    if (pct >= 0.8) return 'green--text'
    if (pct >= 0.5) return 'orange--text'
    return 'red--text'
  },

  finalResultIcon(state, getters) {
    const pct = getters.correctCount / state.questions.length
    if (pct >= 0.9) return 'mdi-trophy'
    if (pct >= 0.7) return 'mdi-emoticon-happy'
    if (pct >= 0.5) return 'mdi-emoticon-neutral'
    return 'mdi-emoticon-sad'
  },

  progressPercent(state) {
    return ((state.currentQuestionIndex + 1) / state.questions.length) * 100
  },

  questionChipColor: (state, getters) => (idx) => {
    if (idx === state.currentQuestionIndex) return 'primary'
    if (!getters.isAnswered(idx)) return 'grey lighten-3'
    const answer = state.questions[idx]?.answers[state.userAnswers[idx]]
    return answer && answer.isCorrect ? 'success' : 'error'
  },

  answerCircleColor(state, getters) {
    return getters.isAnswered(state.currentQuestionIndex) ? 'grey lighten-1' : 'grey darken-1'
  },

  levelStats: (state, getters) => (level) => {
    let total = 0
    let correct = 0
    state.questions.forEach((q, realIdx) => {
      if (q.level !== level) return
      total++
      if (!getters.isAnswered(realIdx)) return
      if (q.answers[state.userAnswers[realIdx]].isCorrect) correct++
    })
    return { total, correct }
  },
}

export const mutations = {
  SET_LANG(state, lang) {
    state.lang = lang
  },
  SET_ALL_QUESTIONS(state, questions) {
    state.allQuestions = questions
  },
  SET_SELECTED_LEVELS(state, levels) {
    state.selectedLevels = levels
  },
  SET_QUESTION_COUNT(state, count) {
    const clamped = Math.max(1, Math.min(count, 999))
    state.questionCount = clamped
  },
  SET_STARTING(state, value) {
    state.starting = value
  },
  START_QUIZ(state) {
    state.quizStarted = true
    state.starting = false
  },
  SET_QUIZ(state, { questions, userAnswers, currentIndex }) {
    state.questions = questions
    state.userAnswers = userAnswers
    state.currentQuestionIndex = currentIndex
  },
  SET_AUTO_PASS(state, value) {
    state.autoPass = value
  },
  SET_AUTO_PASS_DELAY(state, value) {
    state.autoPassDelay = Math.max(1, Math.min(value, 10))
  },
  SET_SHOW_RESULTS(state, value) {
    state.showFinalResults = value
  },
  RESET_QUIZ(state) {
    state.quizStarted = false
    state.questions = []
    state.userAnswers = []
    state.currentQuestionIndex = 0
    state.showFinalResults = false
  },
  NEXT_QUESTION(state) {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      state.currentQuestionIndex++
    }
  },
  PREVIOUS_QUESTION(state) {
    if (state.currentQuestionIndex > 0) {
      state.currentQuestionIndex--
    }
  },
  GO_TO_QUESTION(state, idx) {
    if (idx >= 0 && idx < state.questions.length) {
      state.currentQuestionIndex = idx
    }
  },
}

export const actions = {
  init({ commit }, { questions }) {
    commit('SET_ALL_QUESTIONS', questions)
  },

  switchLang({ commit, state, getters }, { lang, questions }) {
    const wasStarted = state.quizStarted
    commit('SET_LANG', lang)
    commit('SET_ALL_QUESTIONS', questions)

    if (wasStarted && state.questions.length > 0) {
      // Remap questions to the new language using their id, and preserve
      // user answers by matching childId
      const newPoolById = {}
      questions.forEach((q) => { newPoolById[q.id] = q })

      const newQuestions = state.questions.map((oldQ) => {
        const match = newPoolById[oldQ.id]
        if (!match) return { ...oldQ }
        return {
          ...match,
          answers: shuffleArray([...match.answers]),
        }
      })

      const newUserAnswers = state.questions.map((oldQ, idx) => {
        const oldAnswerIdx = state.userAnswers[idx]
        if (oldAnswerIdx === null || oldAnswerIdx === undefined) return null

        const oldAnswer = oldQ.answers[oldAnswerIdx]
        if (!oldAnswer || oldAnswer.childId === undefined) return null

        const newQ = newQuestions[idx]
        const newIdx = newQ.answers.findIndex((a) => a.childId === oldAnswer.childId)
        return newIdx >= 0 ? newIdx : null
      })

      commit('SET_QUIZ', {
        questions: newQuestions,
        userAnswers: newUserAnswers,
        currentIndex: state.currentQuestionIndex,
      })
    } else if (!wasStarted) {
      // Reset selections if needed (counts may differ)
      const max = questions.filter((q) => state.selectedLevels.includes(q.level)).length
      if (state.questionCount > max) {
        commit('SET_QUESTION_COUNT', max)
      }
    }
  },

  startQuiz({ commit, state }) {
    commit('SET_STARTING', true)

    let pool = state.allQuestions.filter((q) => state.selectedLevels.includes(q.level))
    pool = shuffleArray(pool)
    const count = Math.min(state.questionCount, pool.length)
    const questions = pool.slice(0, count).map((q) => ({
      ...q,
      answers: shuffleArray(q.answers),
    }))
    const userAnswers = new Array(questions.length).fill(null)

    commit('SET_QUIZ', { questions, userAnswers, currentIndex: 0 })
    commit('START_QUIZ')
  },

  answer({ commit, getters, state }, answerIdx) {
    if (getters.isAnswered(state.currentQuestionIndex)) return
    // Vue 2 reactivity: use $set-like approach via splice
    const answers = [...state.userAnswers]
    answers[state.currentQuestionIndex] = answerIdx
    commit('SET_QUIZ', {
      questions: state.questions,
      userAnswers: answers,
      currentIndex: state.currentQuestionIndex,
    })
  },
}
