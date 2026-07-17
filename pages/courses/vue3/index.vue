<template>
  <QuizPage
    icon="mdi-vuejs"
    title-en="Vue 3 Quiz"
    subtitle-en="Test your Vue 3 knowledge"
    title-es="Vue 3 Quiz"
    subtitle-es="Pon a prueba tus conocimientos de Vue 3"
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
