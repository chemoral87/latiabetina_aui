<template>
  <QuizPage
    icon="mdi-database"
    title-en="SQL Server Quiz"
    subtitle-en="Test your SQL Server knowledge"
    title-es="SQL Server Quiz"
    subtitle-es="Pon a prueba tus conocimientos de SQL Server"
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
