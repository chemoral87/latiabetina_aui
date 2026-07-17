<template>
  <div class="d-flex flex-wrap" style="gap: 4px">
    <v-chip
      v-for="(chip, idx) in chips"
      :key="idx"
      :color="chip.color"
      :text-color="idx === currentIndex ? 'white' : undefined"
      small
      class="question-dot"
      :class="{ 'current-dot': idx === currentIndex }"
      @click="$emit('go-to', idx)"
    >
      {{ idx + 1 }}
    </v-chip>
  </div>
</template>

<script>
export default {
  name: 'QuizProgressChips',
  props: {
    chips: { type: Array, required: true },
    currentIndex: { type: Number, required: true },
  },
}
</script>

<style scoped>
.question-dot {
  cursor: pointer;
  transition: transform 0.15s ease;
  min-width: 32px;
  justify-content: center;
}
.question-dot:hover {
  transform: scale(1.15);
}
.current-dot {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
