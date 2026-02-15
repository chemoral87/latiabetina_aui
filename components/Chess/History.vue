<template>
  <v-card outlined class="history-panel pa-3">
    <div class="history-header text-subtitle-2 font-weight-medium mb-2">
      Historial de Movimientos
    </div>

    <div class="history-table">
      <!-- Header -->
      <div class="history-row header-row">
        <div class="move-number">#</div>
        <div class="move-white">Blancas</div>
        <div class="move-black">Negras</div>
      </div>

      <!-- Movimientos -->
      <div
        v-for="(pair, pairIndex) in movePairs"
        :key="pairIndex"
        class="history-row"
      >
        <div class="move-number">{{ pairIndex + 1 }}</div>
        <div
          class="move-white move-cell"
          :class="{ 'active': pair.whiteIndex === currentMoveIndex }"
          @click="pair.white && handleMoveClick(pair.whiteIndex)"
        >
          {{ pair.white || '' }}
        </div>
        <div
          class="move-black move-cell"
          :class="{ 'active': pair.blackIndex === currentMoveIndex }"
          @click="pair.black && handleMoveClick(pair.blackIndex)"
        >
          {{ pair.black || '' }}
        </div>
      </div>

      <div v-if="moves.length === 0" class="no-moves text-caption text-center pa-4">
        No hay movimientos aún
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'ChessHistory',
  props: {
    moves: {
      type: Array,
      required: true,
      default: () => []
    },
    currentMoveIndex: {
      type: Number,
      default: -1
    }
  },
  computed: {
    movePairs() {
      const pairs = []
      for (let i = 0; i < this.moves.length; i += 2) {
        pairs.push({
          white: this.moves[i]?.notation || null,
          whiteIndex: i,
          black: this.moves[i + 1]?.notation || null,
          blackIndex: i + 1
        })
      }
      return pairs
    }
  },
  methods: {
    handleMoveClick(moveIndex) {
      this.$emit('move-selected', moveIndex)
    }
  }
}
</script>

<style scoped>
.history-panel {
  background: white !important;
  border-radius: 8px !important;
  min-height: 400px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.history-header {
  color: #424242;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
}

.history-table {
  flex: 1;
  overflow-y: auto;
}

.history-row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr;
  gap: 4px;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
  min-height: 32px;
}

.history-row.header-row {
  background: #fafafa;
  font-weight: 600;
  font-size: 0.75rem;
  color: #616161;
  text-transform: uppercase;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 2px solid #e0e0e0;
}

.move-number {
  text-align: center;
  color: #9e9e9e;
  font-size: 0.75rem;
  padding: 4px;
}

.move-white,
.move-black {
  padding: 6px 8px;
  font-size: 0.8rem;
  text-align: center;
}

.move-cell {
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.move-cell:hover {
  background: #f5f5f5;
}

.move-cell.active {
  background: #2196f3;
  color: white;
  font-weight: 600;
}

.no-moves {
  color: #9e9e9e;
  font-style: italic;
}
</style>
