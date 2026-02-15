<template>
  <v-card outlined class="mt-4 pa-3">
    <div class="text-subtitle-2 font-weight-medium mb-2 d-flex align-center">
      <v-icon small left color="primary">mdi-robot</v-icon>
      Mejor Opción (Stockfish)
    </div>
    
    <div v-if="loading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
    </div>
    
    <div v-else-if="move" class="d-flex flex-column ga-2">
      <div class="best-move-item pa-3 rounded elevation-1">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center ga-2">
            <span class="text-h5">🏆</span>
            <span class="text-h5 font-weight-bold primary--text">{{ move.san }}</span>
          </div>
          <div class="d-flex flex-column align-end">
             <v-chip small label :color="getScoreColor(move.eval)" dark class="font-weight-bold mb-1">
              {{ formatEval(move.eval, move.mate) }}
            </v-chip>
            <span v-if="move.winChance" class="text-caption success--text font-weight-bold">
              {{ move.winChance.toFixed(1) }}% Vic.
            </span>
          </div>
        </div>

        <!-- Línea de continuación -->
        <div v-if="move.continuationArr && move.continuationArr.length" class="text-caption grey--text text--darken-2 mt-1 py-1" style="background: rgba(0,0,0,0.03); border-radius: 4px;">
          <v-icon x-small left class="ml-1">mdi-arrow-right</v-icon>
          {{ move.continuationArr.slice(0, 8).join(' ') }}
          <span v-if="move.continuationArr.length > 8">...</span>
        </div>
      </div>
    </div>
    
    <div v-else class="text-caption grey--text text-center pa-2">
      Esperando movimiento...
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'ChessBestMovesStockfish',
  props: {
    move: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatEval(cp, mate) {
      if (mate) return `M${mate}`
      return (cp / 100).toFixed(2)
    },
    getScoreColor(cp) {
      if (cp > 50) return 'success'
      if (cp < -50) return 'error'
      return 'grey darken-2'
    }
  }
}
</script>

<style scoped>
.best-move-item {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
}
</style>
