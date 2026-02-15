<template>
  <v-card outlined class="mt-4 pa-3">
    <div class="text-subtitle-2 font-weight-medium mb-2 d-flex align-center">
      <v-icon small left color="secondary">mdi-cloud-search</v-icon>
      Análisis Lichess (2 opciones)
    </div>
    
    <div v-if="loading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate color="secondary" size="24"></v-progress-circular>
    </div>
    
    <div v-else-if="moves.length > 0" class="d-flex flex-column ga-2">
      <div 
        v-for="(move, index) in moves" 
        :key="index"
        class="best-move-item pa-2 rounded"
      >
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center ga-2">
            <span v-if="index === 0" class="text-h6">🥇</span>
            <span v-else-if="index === 1" class="text-h6">🥈</span>
            <span v-else class="font-weight-bold grey--text text--darken-2 pl-1">#{{ index + 1 }}</span>
            <span class="text-body-2 font-weight-bold primary--text">{{ move.san }}</span>
          </div>
          <div class="d-flex align-center ga-2">
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
      No hay datos de Lichess.
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'ChessBestMovesLichess',
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
  background-color: #f5f5f5;
  border-left: 3px solid transparent;
}
.best-move-item:hover {
  background-color: #eeeeee;
}
</style>
