<template>
  <v-card id="quiz-config" class="pa-6 rounded-lg" elevation="2">
    <v-card-title class="justify-center text-h5 pb-4">
      <v-icon left color="primary">mdi-tune-variant</v-icon>
      {{ t('configTitle') }}
    </v-card-title>

    <v-card-text>
      <!-- Levels Selection -->
      <p class="text-subtitle-1 font-weight-medium mb-2">{{ t('selectLevels') }}</p>
      <v-row class="mb-4">
        <v-col v-for="lv in levels" :key="lv.key" cols="12" sm="4">
          <v-checkbox
            :input-value="selectedLevels.includes(lv.key)"
            @change="toggleLevel(lv.key)"
            hide-details
            class="level-checkbox"
            :color="lv.color"
          >
            <template v-slot:label>
              <span>
                <v-icon small :color="lv.color" class="mr-1">{{ lv.icon }}</v-icon>
                {{ lv.label }} ({{ lv.count }})
              </span>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>

      <!-- Question Count -->
      <p class="text-subtitle-1 font-weight-medium mb-2">{{ t('numQuestions') }}</p>
      <v-row class="align-center mb-2">
        <v-col cols="12" sm="6">
          <v-slider
            :value="questionCount"
            @input="$emit('update:questionCount', $event)"
            :min="1"
            :max="maxQuestions"
            :disabled="maxQuestions === 0"
            thumb-label
            thumb-color="primary"
            track-color="primary lighten-3"
            color="primary"
            :label="questionCount + ' ' + t('questions')"
          ></v-slider>
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field
            :value="questionCount"
            @input="$emit('update:questionCount', Number($event))"
            type="number"
            :min="1"
            :max="maxQuestions"
            :disabled="maxQuestions === 0"
            hide-details
            dense
            outlined
            class="mx-2"
          ></v-text-field>
        </v-col>
      </v-row>
      <p class="text-caption grey--text mb-0">
        {{ t('available') }}: <strong>{{ maxQuestions }}</strong> {{ t('questions') }}
      </p>
    </v-card-text>

    <v-card-actions class="justify-center pb-4">
      <v-btn
        x-large
        color="primary"
        :disabled="selectedLevels.length === 0 || maxQuestions === 0"
        :loading="starting"
        @click="$emit('start')"
        class="px-10 rounded-lg"
        elevation="4"
      >
        <v-icon left>mdi-play-circle-outline</v-icon>
        {{ t('startQuiz') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'QuizConfig',
  props: {
    selectedLevels: { type: Array, required: true },
    questionCount: { type: Number, required: true },
    maxQuestions: { type: Number, default: 0 },
    starting: { type: Boolean, default: false },
    levels: { type: Array, required: true },
    translations: { type: Object, default: () => ({}) },
  },

  methods: {
    toggleLevel(key) {
      const levels = [...this.selectedLevels]
      const idx = levels.indexOf(key)
      if (idx >= 0) {
        levels.splice(idx, 1)
      } else {
        levels.push(key)
      }
      this.$emit('update:selectedLevels', levels)
    },

    t(key) {
      return this.translations[key] || key
    },
  },
}
</script>

<style scoped>
.level-checkbox {
  margin-top: 0;
  padding-top: 0;
}
</style>
