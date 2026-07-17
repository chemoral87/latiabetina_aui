<template>
  <v-card id="quiz-navigation" class="rounded-lg" elevation="1">
    <v-card-actions class="pa-4 d-flex justify-space-between flex-wrap" style="gap: 8px">
      <v-btn
        :disabled="currentIndex === 0"
        color="primary"
        outlined
        @click="$emit('previous')"
      >
        <v-icon left>mdi-chevron-left</v-icon>
        {{ t('previous') }}
      </v-btn>

      <div class="d-flex align-center">
        <span class="text-body-2 grey--text mr-2">
          {{ answered }}/{{ total }}
        </span>
      </div>

      <div class="d-flex" style="gap: 8px">
        <v-btn
          v-if="currentIndex < total - 1"
          color="primary"
          @click="$emit('next')"
        >
          {{ t('next') }}
          <v-icon right>mdi-chevron-right</v-icon>
        </v-btn>

        <v-btn
          v-if="allAnswered"
          color="success"
          @click="$emit('finish')"
        >
          <v-icon left>mdi-check-all</v-icon>
          {{ t('finish') }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'QuizNavigation',
  props: {
    currentIndex: { type: Number, required: true },
    total: { type: Number, required: true },
    answered: { type: Number, default: 0 },
    allAnswered: { type: Boolean, default: false },
    translations: { type: Object, default: () => ({}) },
  },

  methods: {
    t(key) { return this.translations[key] || key },
  },
}
</script>
