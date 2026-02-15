<template>
  <v-container fluid class="chess-container pa-2">
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <div class="text-center">
          <span class="chess-title text-h6 font-weight-medium">
            Tablero de Ajedrez
          </span>
        </div>

        <v-row>
          <!-- Panel de controles izquierdo -->
          <v-col cols="12" md="3" lg="2" class="d-flex flex-column ga-3">
            <ChessControls
              :is-rotated="isRotated"
              @rotate-to-white="rotateToWhite"
              @rotate-to-black="rotateToBlack"
              @reset-board="resetBoard"
            />  

            <!-- Indicador de turno -->
            <ChessIndicator
              :current-turn="currentTurn"
            />
            
            <ChessBestMovesStockfish
              :move="bestMoveStockfish"
              :loading="loadingStockfish"
              class="mt-4"
            />
            <ChessBestMovesLichess
              :moves="bestMovesLichess"
              :loading="loadingLichess"
              class="mt-4"
            />


          </v-col>

          <!-- Tablero central -->
          <v-col cols="12" md="6" lg="7">
            <ChessBoard
              :squares="squares"
              :is-rotated="isRotated"
              :selected-square="selectedSquare"
              :valid-moves="validMoves"
              :hints="boardHints"
              @square-click="handleSquareClick"
            />
          </v-col>

          <!-- Historial de movimientos derecho -->
          <v-col cols="12" md="3" lg="3">
            <ChessHistory 
              :moves="moveHistory" 
              :current-move-index="currentMoveIndex"
              @move-selected="goToMove"
            />
            

          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import ChessHistory from '~/components/Chess/History.vue'
import ChessControls from '~/components/Chess/Controls.vue'
import ChessIndicator from '~/components/Chess/Indicator.vue'
import ChessBoard from '~/components/Chess/Board.vue'
import ChessBestMovesStockfish from '~/components/Chess/BestMovesStockfish.vue'
import ChessBestMovesLichess from '~/components/Chess/BestMovesLichess.vue'

// Estado del tablero
const isRotated = ref(false)
const selectedSquare = ref(null)
const validMoves = ref([])
const currentTurn = ref('white') // 'white' o 'black'
// Estados para análisis
const bestMoveStockfish = ref(null)
const bestMovesLichess = ref([])
const loadingStockfish = ref(false)
const loadingLichess = ref(false)

// Historial de movimientos
const moveHistory = ref([])
const currentMoveIndex = ref(-1)
const boardHistory = ref([])

// Piezas: mayúsculas = blancas, minúsculas = negras
// K/k = Rey, Q/q = Reina, R/r = Torre, B/b = Alfil, N/n = Caballo, P/p = Peón
const initialPosition = [
  'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r', // Fila 8 (negras)
  'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', // Fila 7 (peones negros)
  '', '', '', '', '', '', '', '',         // Fila 6
  '', '', '', '', '', '', '', '',         // Fila 5
  '', '', '', '', '', '', '', '',         // Fila 4
  '', '', '', '', '', '', '', '',         // Fila 3
  'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', // Fila 2 (peones blancos)
  'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'  // Fila 1 (blancas)
]

const squares = ref([...initialPosition])

// Guardar posición inicial en el historial
boardHistory.value.push([...initialPosition])



// Símbolos de piezas Unicode
const pieceSymbols = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
}

// Funciones
const rotateToWhite = () => {
  isRotated.value = false
}

const rotateToBlack = () => {
  isRotated.value = true
}

const resetBoard = () => {
  squares.value = [...initialPosition]
  selectedSquare.value = null
  validMoves.value = []
  moveHistory.value = []
  currentMoveIndex.value = -1
  boardHistory.value = [[...initialPosition]]
  currentTurn.value = 'white'
  currentTurn.value = 'white'
  bestMoveStockfish.value = null
  bestMovesLichess.value = []
}

const boardToFen = () => {
  let fen = ''
  for (let row = 0; row < 8; row++) {
    let empty = 0
    for (let col = 0; col < 8; col++) {
      const piece = squares.value[row * 8 + col]
      if (!piece) {
        empty++
      } else {
        if (empty > 0) {
          fen += empty
          empty = 0
        }
        fen += piece
      }
    }
    if (empty > 0) fen += empty
    if (row < 7) fen += '/'
  }
  
  fen += ` ${currentTurn.value.charAt(0)}`
  fen += ' - - 0 1' 
  return fen
}

const notationToIndex = (notation) => {
  const file = notation.charCodeAt(0) - 97 // a->0
  const rank = 8 - parseInt(notation[1]) // 8->0
  return rank * 8 + file
}

const boardHints = computed(() => {
  const hints = []

    // Lichess (Verde)
  if (bestMovesLichess.value) {
    bestMovesLichess.value.forEach(move => {
      hints.push({
        from: notationToIndex(move.lan.substring(0, 2)),
        to: notationToIndex(move.lan.substring(2, 4)),
        color: '#4caf50' // Verde
      })
    })
  }
  
  // Stockfish (Rojo)
  if (bestMoveStockfish.value && bestMoveStockfish.value.lan) {
    const lan = bestMoveStockfish.value.lan 
    hints.push({
      from: notationToIndex(lan.substring(0, 2)),
      to: notationToIndex(lan.substring(2, 4)),
      color: '#ff5252' // Rojo
    })
  }


  
  return hints
})

const getStockfishMove = async (fen) => {
  loadingStockfish.value = true
  bestMoveStockfish.value = null
  
  try {
    const response = await fetch('https://chess-api.com/v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen, variants: 1, depth: 12 })
    })
    
    if (response.ok) {
      const data = await response.json()
      bestMoveStockfish.value = Array.isArray(data) ? data[0] : data
    }
  } catch (error) {
    console.error('Stockfish API Error:', error)
  } finally {
    loadingStockfish.value = false
  }
}

const getLichessMoves = async (fen) => {
  loadingLichess.value = true
  bestMovesLichess.value = []
  
  try {
    const lichessRes = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=2`)
    if (lichessRes.ok) {
      const data = await lichessRes.json()
      if (data.pvs && data.pvs.length > 0) {
        bestMovesLichess.value = data.pvs.map(pv => {
           const moves = pv.moves.split(' ')
           const bestMoveLan = moves[0]
           const continuation = moves.slice(1)
           
           // Generar SAN simple
           const from = bestMoveLan.substring(0, 2)
           const to = bestMoveLan.substring(2, 4)
           const index = notationToIndex(from)
           const piece = squares.value[index]
           const pieceLetter = (piece && piece.toUpperCase() !== 'P') ? piece.toUpperCase() : ''
           const san = `${pieceLetter}${to}` 
           
           return {
             san,
             lan: bestMoveLan,
             eval: pv.cp,
             mate: pv.mate,
             continuationArr: continuation
           }
        })
      }
    }
  } catch (e) {
    console.log('Lichess API unavailable')
  } finally {
    loadingLichess.value = false
  }
}

const getBestMoves = () => {
  const fen = boardToFen()
  getStockfishMove(fen)
  getLichessMoves(fen)
}

const getPieceSymbol = (piece) => {
  return pieceSymbols[piece] || ''
}

const handleSquareClick = (index) => {
  // Si hay una casilla seleccionada y clickeamos en un movimiento válido
  if (selectedSquare.value !== null && validMoves.value.includes(index)) {
    // Guardar el movimiento
    const piece = squares.value[selectedSquare.value]
    const fromNotation = indexToNotation(selectedSquare.value)
    const toNotation = indexToNotation(index)
    const moveNotation = `${getPieceSymbol(piece)}${fromNotation}-${toNotation}`
    
    // Mover la pieza
    squares.value[index] = squares.value[selectedSquare.value]
    squares.value[selectedSquare.value] = ''
    
    // Guardar en el historial
    // Si estamos en medio del historial, eliminar movimientos futuros
    if (currentMoveIndex.value < moveHistory.value.length - 1) {
      moveHistory.value = moveHistory.value.slice(0, currentMoveIndex.value + 1)
      boardHistory.value = boardHistory.value.slice(0, currentMoveIndex.value + 2)
    }
    
    moveHistory.value.push({
      notation: moveNotation,
      from: selectedSquare.value,
      to: index
    })
    boardHistory.value.push([...squares.value])
    currentMoveIndex.value = moveHistory.value.length - 1
    
    // Cambiar turno
    currentTurn.value = currentTurn.value === 'white' ? 'black' : 'white'
    
    selectedSquare.value = null
    validMoves.value = []
    
    // Obtener mejores movimientos
    getBestMoves()
  } else if (squares.value[index]) {
    // Verificar que sea el turno correcto
    const piece = squares.value[index]
    const isWhitePiece = piece === piece.toUpperCase()
    const isCorrectTurn = (isWhitePiece && currentTurn.value === 'white') || 
                          (!isWhitePiece && currentTurn.value === 'black')
    
    if (!isCorrectTurn) {
      // No permitir seleccionar pieza del color incorrecto
      return
    }
    
    // Seleccionar nueva pieza
    selectedSquare.value = index
    validMoves.value = calculateValidMoves(index)
  } else {
    // Deseleccionar
    selectedSquare.value = null
    validMoves.value = []
  }
}

const indexToNotation = (index) => {
  const row = Math.floor(index / 8)
  const col = index % 8
  const file = String.fromCharCode(97 + col) // a-h
  const rank = 8 - row // 1-8
  return `${file}${rank}`
}

const goToMove = (moveIndex) => {
  currentMoveIndex.value = moveIndex
  squares.value = [...boardHistory.value[moveIndex + 1]]
  selectedSquare.value = null
  validMoves.value = []
  // Actualizar turno basado en el índice del movimiento
  currentTurn.value = (moveIndex + 1) % 2 === 0 ? 'white' : 'black'
}

const calculateValidMoves = (index) => {
  const piece = squares.value[index]
  if (!piece) return []

  const moves = []
  const row = Math.floor(index / 8)
  const col = index % 8
  const isWhite = piece === piece.toUpperCase()

  switch (piece.toUpperCase()) {
    case 'P': // Peón
      moves.push(...getPawnMoves(row, col, isWhite))
      break
    case 'N': // Caballo
      moves.push(...getKnightMoves(row, col, isWhite))
      break
    case 'B': // Alfil
      moves.push(...getBishopMoves(row, col, isWhite))
      break
    case 'R': // Torre
      moves.push(...getRookMoves(row, col, isWhite))
      break
    case 'Q': // Reina
      moves.push(...getQueenMoves(row, col, isWhite))
      break
    case 'K': // Rey
      moves.push(...getKingMoves(row, col, isWhite))
      break
  }

  return moves
}

const getPawnMoves = (row, col, isWhite) => {
  const moves = []
  const direction = isWhite ? -1 : 1
  const startRow = isWhite ? 6 : 1

  // Movimiento hacia adelante
  const forwardIndex = (row + direction) * 8 + col
  if (row + direction >= 0 && row + direction < 8 && !squares.value[forwardIndex]) {
    moves.push(forwardIndex)

    // Doble movimiento desde posición inicial
    if (row === startRow) {
      const doubleIndex = (row + 2 * direction) * 8 + col
      if (!squares.value[doubleIndex]) {
        moves.push(doubleIndex)
      }
    }
  }

  // Capturas diagonales
  for (const dc of [-1, 1]) {
    const newCol = col + dc
    if (newCol >= 0 && newCol < 8 && row + direction >= 0 && row + direction < 8) {
      const captureIndex = (row + direction) * 8 + newCol
      const targetPiece = squares.value[captureIndex]
      if (targetPiece && (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
        moves.push(captureIndex)
      }
    }
  }

  return moves
}

const getKnightMoves = (row, col, isWhite) => {
  const moves = []
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]

  for (const [dr, dc] of knightMoves) {
    const newRow = row + dr
    const newCol = col + dc
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const index = newRow * 8 + newCol
      const targetPiece = squares.value[index]
      if (!targetPiece || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
        moves.push(index)
      }
    }
  }

  return moves
}

const getBishopMoves = (row, col, isWhite) => {
  return getSlidingMoves(row, col, isWhite, [[-1, -1], [-1, 1], [1, -1], [1, 1]])
}

const getRookMoves = (row, col, isWhite) => {
  return getSlidingMoves(row, col, isWhite, [[-1, 0], [1, 0], [0, -1], [0, 1]])
}

const getQueenMoves = (row, col, isWhite) => {
  return getSlidingMoves(row, col, isWhite, [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ])
}

const getSlidingMoves = (row, col, isWhite, directions) => {
  const moves = []

  for (const [dr, dc] of directions) {
    let newRow = row + dr
    let newCol = col + dc

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const index = newRow * 8 + newCol
      const targetPiece = squares.value[index]

      if (!targetPiece) {
        moves.push(index)
      } else {
        if ((targetPiece === targetPiece.toUpperCase()) !== isWhite) {
          moves.push(index)
        }
        break
      }

      newRow += dr
      newCol += dc
    }
  }

  return moves
}

const getKingMoves = (row, col, isWhite) => {
  const moves = []
  const kingMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  for (const [dr, dc] of kingMoves) {
    const newRow = row + dr
    const newCol = col + dc
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const index = newRow * 8 + newCol
      const targetPiece = squares.value[index]
      if (!targetPiece || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
        moves.push(index)
      }
    }
  }

  return moves
}
</script>

<style scoped>
.chess-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.chess-title {
  color: #424242;
  letter-spacing: 0.5px;
}

.v-btn {
  text-transform: none !important;
  font-weight: 500;
  letter-spacing: 0.25px;
}



.turn-indicator {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}


@media (max-width: 600px) {
  .chess-container {
    padding: 1rem !important;
  }
}
</style>
