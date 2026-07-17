<template>
  <QuizPage
    icon="mdi-vuejs"
    title-en="Vue 2 Quiz"
    subtitle-en="Test your Vue 2 knowledge"
    title-es="Vue 2 Quiz"
    subtitle-es="Pon a prueba tus conocimientos de Vue 2"
    :questions-en="questionsEn"
    :questions-es="questionsEs"
  />
</template>

<script>
import questionsBasic from './questions_basic.json'
import questionsIntermediate from './questions_intermediate.json'
import questionsExpert from './questions_expert.json'
import QuizPage from '~/components/Courses/Quiz/QuizPage.vue'

const normalizeQuestions = (questions, lang) =>
  questions.map((question) => ({
    ...question,
    question: question.question?.[lang] || question.question,
    answers: question.answers.map((answer) => ({
      ...answer,
      text: answer.text?.[lang] || answer.text,
    })),
  }))

export default {
  components: { QuizPage },

  data() {
    const questionsEn = [
      ...normalizeQuestions(questionsBasic, 'en'),
      ...normalizeQuestions(questionsIntermediate, 'en'),
      ...normalizeQuestions(questionsExpert, 'en'),
    ]
    const questionsEs = [
      ...normalizeQuestions(questionsBasic, 'es'),
      ...normalizeQuestions(questionsIntermediate, 'es'),
      ...normalizeQuestions(questionsExpert, 'es'),
    ]

    return {
      questionsEn,
      questionsEs,
    }
  },
}
</script>
