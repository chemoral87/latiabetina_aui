<template>
  <v-card outlined class="pa-3 indicator-container">
    <div class="text-caption font-weight-medium mb-2 text-center">
      Turno Actual
    </div>
    <v-chip
      :color="currentTurn === 'white' ? 'grey lighten-2' : 'grey darken-3'"
      :dark="currentTurn === 'black'"
      block
      class="justify-center turn-indicator"
    >
      <v-icon small left>{{ currentTurn === 'white' ? 'mdi-chess-king' : 'mdi-chess-king' }}</v-icon>
      {{ currentTurn === 'white' ? 'Blancas' : 'Negras' }}
    </v-chip>
  </v-card>
</template>

<script>
export default {
  name: 'ChessIndicator',
  props: {
    currentTurn: {
      type: String,
      required: true,
      validator: (value) => ['white', 'black'].includes(value)
    }
  }
}
</script>

<style scoped>
.indicator-container {
  background: white !important;
  border-radius: 8px !important;
}

.turn-indicator {
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-2px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
