<template>
  <div class="d-flex flex-column">
    <!-- Row 1: AutoPass toggle -->
    <div class="d-flex align-center">
      <v-switch
        :input-value="autoPass"
        :label="t('autoPass')"
        color="primary"
        hide-details
        dense
        class="auto-pass-switch mt-0 pt-0"
        @change="$emit('toggle-autopass', $event)"
      ></v-switch>
      <v-icon v-if="autoPass" small color="primary" class="ml-1">mdi-auto-fix</v-icon>
    </div>

    <!-- Row 2: Delay slider -->
    <div v-if="autoPass" class="d-flex align-center mt-1">
      <v-slider
        :value="delay"
        :min="1"
        :max="10"
        :step="1"
        hide-details
        dense
        class="delay-slider"
        @input="$emit('update:delay', $event)"
      ></v-slider>
      <span class="text-caption font-weight-bold ml-1" style="min-width: 28px;">{{ delay }}s</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizProgressAutoPass',
  props: {
    autoPass: { type: Boolean, default: false },
    delay: { type: Number, default: 3 },
    translations: { type: Object, default: () => ({}) },
  },

  emits: ['toggle-autopass', 'update:delay'],

  methods: {
    t(key) { return this.translations[key] || key },
  },
}
</script>

<style scoped>
.auto-pass-switch {
  margin: 0;
}
.auto-pass-switch >>> .v-label {
  font-size: 12px;
}

.delay-slider {
  flex: 1;
  min-width: 60px;
}
.delay-slider >>> .v-slider__thumb {
  width: 14px;
  height: 14px;
}
.delay-slider >>> .v-slider__track-container {
  height: 4px;
}
</style>
