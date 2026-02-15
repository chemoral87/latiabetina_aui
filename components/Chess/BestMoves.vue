<template>
  <v-card outlined class="mt-4 pa-3">
    <div class="text-subtitle-2 font-weight-medium mb-2">
      Mejores Movimientos (Stockfish 17)
    </div>
    
    <div v-if="loading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
    </div>
    
    <div v-else-if="moves.length > 0" class="d-flex flex-column ga-2">
      <div 
        v-for="(move, index) in moves" 
        :key="index"
        class="best-move-item pa-2 rounded"
        :class="getScoreClass(move.eval)"
      >
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center ga-2">
            <span class="font-weight-bold grey--text text--darken-2">#{{ index + 1 }}</span>
            <span class="text-body-2 font-weight-bold primary--text">{{ move.san }}</span>
          </div>
          <div class="d-flex align-center ga-2">
            <span v-if="move.winChance" class="text-caption success--text font-weight-medium">
              {{ move.winChance.toFixed(1) }}% Vic.
            </span>
            <v-chip x-small label :color="getScoreColor(move.eval)" dark>
              {{ formatEval(move.eval, move.mate) }}
            </v-chip>
          </div>
        </div>

        <!-- Línea de continuación -->
        <div v-if="move.continuationArr && move.continuationArr.length" class="text-caption grey--text text--darken-1 text-truncate">
          <v-icon x-small left>mdi-arrow-right</v-icon>
          {{ move.continuationArr.slice(0, 5).join(' ') }}
          <span v-if="move.continuationArr.length > 5">...</span>
        </div>
      </div>
    </div>
    
    <div v-else class="text-caption grey--text text-center pa-2">
      Realiza un movimiento para ver el análisis
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'ChessBestMoves',
  props: {
    moves: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatEval(cp, mate) {
      if (mate) return `Mate en ${mate}`
      return (cp / 100).toFixed(2)
    },
    getScoreClass(cp) {
      // Background styling based on advantage could be added here
      return ''
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
  background-color: #f5f5f5;
  border-left: 3px solid transparent;
}
.best-move-item:hover {
  background-color: #eeeeee;
}
</style>
