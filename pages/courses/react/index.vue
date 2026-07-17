<template>
  <QuizPage
    icon="mdi-atom"
    title-en="React 16 Quiz"
    subtitle-en="Test your React 16 knowledge"
    title-es="React 16 Quiz"
    subtitle-es="Pon a prueba tus conocimientos de React 16"
    :questions-en="questionsEn"
    :questions-es="questionsEs"
  />
</template>

<script>
import questionsEn from './questions_en.json'
import questionsEs from './questions_es.json'
import QuizPage from '~/components/Courses/Quiz/QuizPage.vue'

export default {
  components: { QuizPage },

  data() {
    return {
      questionsEn,
      questionsEs,
    }
  },
}
</script>
