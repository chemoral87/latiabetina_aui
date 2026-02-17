<template>
  <v-card
    flat
    class="board-card mx-auto"
    :class="{ 'rotated': isRotated }"
  >
    <div class="board-wrapper pa-4">
      <div class="board">
        <div
          v-for="(square, index) in squares"
          :key="index"
          class="square"
          :class="[
            getSquareColor(index),
            { 'highlighted': isHighlighted(index) },
            { 'selected': selectedSquare === index },
            { 'in-check': checkSquare === index }
          ]"
          @click="$emit('square-click', index)"
        >
          <div v-if="square" class="piece" :class="getPieceColor(square)">
            {{ getPieceSymbol(square) }}
          </div>
        </div>

        <!-- Overlay SVG para hints (Movido dentro del tablero para alinear coordenadas) -->
        <svg class="board-overlay" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
          <marker id="arrowhead-red" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 z" fill="#ff5252" />
          </marker>
          <marker id="arrowhead-green" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 z" fill="#4caf50" />
          </marker>
          <marker id="arrowhead-blue" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 z" fill="#2196f3" />
          </marker>
          </defs>
          
          <g v-for="(hint, i) in processedHints" :key="i">
            <!-- Círculo en origen -->
            <circle 
              :cx="hint.x1" :cy="hint.y1" 
              :r="hint.radius" 
              :stroke="hint.color" 
              stroke-width="5" 
              fill="none" 
              opacity="0.7"
            />
            <!-- Flecha a destino -->
            <line 
              :x1="hint.x1" :y1="hint.y1" 
              :x2="hint.x2" :y2="hint.y2" 
              :stroke="hint.color" 
              :stroke-width="12 * (hint.arrowScale || 1)" 
              :marker-end="getMarker(hint.color)"
              opacity="0.7"
            />
          </g>
        </svg>
      </div>

      <!-- Coordenadas -->
      <div class="coordinates">
        <div class="files">
          <span v-for="file in files" :key="file">{{ file }}</span>
        </div>
        <div class="ranks">
          <span v-for="rank in ranks" :key="rank">{{ rank }}</span>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'ChessBoard',
  props: {
    squares: {
      type: Array,
      required: true
    },
    isRotated: {
      type: Boolean,
      default: false
    },
    selectedSquare: {
      type: Number,
      default: null
    },
    validMoves: {
      type: Array,
      default: () => []
    },
    hints: {
      type: Array,
      default: () => []
    },
    checkSquare: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      pieceSymbols: {
        'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
      }
    }
  },
  computed: {
    files() {
      return this.isRotated 
        ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] 
        : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    },
    ranks() {
      return this.isRotated 
        ? ['1', '2', '3', '4', '5', '6', '7', '8'] 
        : ['8', '7', '6', '5', '4', '3', '2', '1']
    },
    processedHints() {
      return this.hints.map(hint => {
        const fromRow = Math.floor(hint.from / 8)
        const fromCol = hint.from % 8
        const toRow = Math.floor(hint.to / 8)
        const toCol = hint.to % 8

        // Aplicar offset compensando la rotación
        const visualOffset = this.isRotated ? -(hint.xOffset || 0) : (hint.xOffset || 0)
        
        return {
          x1: fromCol * 100 + 50 + visualOffset,
          y1: fromRow * 100 + 50,
          x2: toCol * 100 + 50 + visualOffset,
          y2: toRow * 100 + 50,
          color: hint.color,
          radius: hint.radius || 38,
          arrowScale: hint.arrowScale || 1
        }
      })
    }
  },
  methods: {
    getMarker(color) {
      if (color === '#ff5252') return 'url(#arrowhead-red)'
      if (color === '#2196f3') return 'url(#arrowhead-blue)'
      return 'url(#arrowhead-green)'
    },
    getSquareColor(index) {
      const row = Math.floor(index / 8)
      const col = index % 8
      return (row + col) % 2 === 0 ? 'light' : 'dark'
    },
    getPieceSymbol(piece) {
      return this.pieceSymbols[piece] || ''
    },
    getPieceColor(piece) {
      return piece === piece.toUpperCase() ? 'white-piece' : 'black-piece'
    },
    isHighlighted(index) {
      return this.validMoves.includes(index)
    }
  }
}
</script>

<style scoped>
.board-card {
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  transition: transform 0.5s ease;
  max-width: 500px;
}

.board-card.rotated {
  transform: rotate(180deg);
}

.board-wrapper {
  position: relative;
}

.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  border: 2px solid #616161;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1;
  position: relative; /* Para alinear el SVG correctamente */
}

.square {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.square:hover {
  filter: brightness(0.95);
}

.square.light {
  background: #f0d9b5;
}

.square.dark {
  background: #b58863;
}

.square.highlighted {
  background: #ffd54f !important;
  box-shadow: inset 0 0 8px rgba(255, 193, 7, 0.5);
}

.square.in-check {
  background: radial-gradient(circle, #ff5252 0%, #ff1744 40%, transparent 80%) !important;
  box-shadow: inset 0 0 15px rgba(255, 0, 0, 0.8);
}

.square.selected {
  box-shadow: inset 0 0 0 3px #2196f3;
  z-index: 10;
}

.piece {
  font-size: clamp(1.5rem, 6vmin, 2.5rem);
  transition: transform 0.15s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  user-select: none;
}

/* Fix: Counter-rotate pieces when board is rotated */
.board-card.rotated .piece {
  transform: rotate(180deg);
}

.square:hover .piece {
  transform: scale(1.08);
}

/* Fix: Counter-rotate pieces on hover when board is rotated */
.board-card.rotated .square:hover .piece {
  transform: rotate(180deg) scale(1.08);
}

.white-piece {
  color: #ffffff;
  text-shadow: 
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
}

.black-piece {
  color: #1a1a1a;
 text-shadow: 
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
}

.coordinates {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.board-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 15; /* Encima de piezas pero debajo de interacciones si fuera necesario, pero pointer-events:none lo arregla */
}

.files {
  position: absolute;
  bottom: 0rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-around;
  color: #616161;
  font-weight: 500;
  font-size: 0.75rem;
}

.ranks {
  position: absolute;
  left: 0.25rem;
  top: 1rem;
  bottom: 1rem;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  color: #616161;
  font-weight: 500;
  font-size: 0.75rem;
}

/* Fix: Counter-rotate coordinates when board is rotated */
.board-card.rotated .coordinates {
  transform: rotate(180deg);
}

@media (max-width: 600px) {
  .board-card {
    max-width: 100%;
  }
  
  .piece {
    font-size: clamp(1.2rem, 5vmin, 2rem);
  }
}
</style>
