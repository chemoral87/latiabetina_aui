<template>
  <div id="quiz-language-toggle" class="d-flex justify-end">
    <v-btn-toggle v-model="internalLang" mandatory dense rounded>
      <v-btn small value="es" :class="{ 'font-weight-bold': value === 'es' }">
        <v-icon small class="mr-1">mdi-flag</v-icon> ES
      </v-btn>
      <v-btn small value="en" :class="{ 'font-weight-bold': value === 'en' }">
        <v-icon small class="mr-1">mdi-flag-outline</v-icon> EN
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
export default {
  name: 'QuizLanguageToggle',
  props: {
    value: {
      type: String,
      default: 'es',
    },
  },
  computed: {
    internalLang: {
      get() { return this.value },
      set(val) { this.$emit('input', val) },
    },
  },
}
</script>
