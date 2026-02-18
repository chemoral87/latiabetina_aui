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

            <!-- Switch de Análisis -->
            <v-switch
              v-model="analyzeAllMoves"
              :label="analyzeAllMoves ? 'Análisis: Continuo' : 'Análisis: Turno'"
              color="primary"
              hide-details
              class="ma-0 pa-0"
              dense
            ></v-switch>  

            <!-- Indicador de turno -->
            <ChessIndicator
              :current-turn="currentTurn"
            />
            
            <ChessBestMovesStockfish
              :move="bestMoveStockfish"
              :loading="loadingStockfish"
              class="mt-4"
            />
            <ChessBestMovesL0c
              title="Mejor Opción (L0c)"
              :moves="bestMovesL0c"
              :loading="loadingL0c"
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
              :check-square="checkSquare"
              @square-click="handleSquareClick"
            />
          </v-col>

          <!-- Historial de movimientos derecho -->
          <v-col cols="12" md="3" lg="3">
            <ChessHistory 
              :moves="moveHistory" 
              :current-move-index="currentMoveIndex"
              @move-selected="goToMove"
              @export-history="exportHistory"
              @import-history="importHistory"
            />
            

          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Diálogo de Promoción -->
    <v-dialog v-model="showPromotionDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6 justify-center">
          Elige una pieza
        </v-card-title>
        <v-card-text class="d-flex justify-space-around pa-4">
          <v-btn 
            v-for="piece in ['q', 'r', 'b', 'n']" 
            :key="piece"
            icon="mdi-chess-queen" 
            x-large
            @click="promotePawn(piece)"
            class="piece-btn"
            :title="getPieceName(piece)"
          >
            <span class="text-h3">{{ getPieceSymbol(pendingMove?.color === 'white' ? piece.toUpperCase() : piece) }}</span>
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  initialPosition, 
  pieceSymbols, 
  notationToIndex, 
  indexToNotation, 
  getPieceName, 
  boardToFen, 
  calculateValidMoves,
  isKingInCheck
} from '~/utils/chessLogic'

// Estado del tablero
const isRotated = ref(false)
const selectedSquare = ref(null)
const validMoves = ref([])
const currentTurn = ref('white') // 'white' o 'black'
// Estados para análisis
const bestMoveStockfish = ref(null)
const bestMovesL0c = ref([])
const bestMovesLichess = ref([])
const loadingStockfish = ref(false)
const loadingL0c = ref(false)
const loadingLichess = ref(false)
const analyzeAllMoves = ref(true) 
const lastAnalysisFen = ref('')

const castlingRights = ref({
  w: { k: true, q: true },
  b: { k: true, q: true }
})
const enPassantTarget = ref(null) 
const checkSquare = ref(null) 

// Estados para promoción
const showPromotionDialog = ref(false)
const pendingMove = ref(null)

// Historial de movimientos
const moveHistory = ref([])
const currentMoveIndex = ref(-1)
const boardHistory = ref([])

const squares = ref([...initialPosition])
boardHistory.value.push([...initialPosition])

const getPieceSymbol = (piece) => pieceSymbols[piece] || ''

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
  bestMoveStockfish.value = null
  bestMovesL0c.value = []
  bestMovesLichess.value = []
  lastAnalysisFen.value = ''
  castlingRights.value = {
    w: { k: true, q: true },
    b: { k: true, q: true }
  }
  enPassantTarget.value = null
  checkSquare.value = null
  
  getBestMoves()
}

const boardToFenLocal = () => {
  return boardToFen(
    squares.value, 
    currentTurn.value, 
    castlingRights.value, 
    enPassantTarget.value, 
    moveHistory.value.length
  )
}

const boardHints = computed(() => {
  const hints = []

  if (bestMovesLichess.value) {
    bestMovesLichess.value.forEach(move => {
      hints.push({
        from: notationToIndex(move.lan.substring(0, 2)),
        to: notationToIndex(move.lan.substring(2, 4)),
        color: '#4caf50', 
        xOffset: 0,
        radius: 30,
        arrowScale: 0.7
      })
    })
  }
  
  if (bestMoveStockfish.value) {
    const lan = bestMoveStockfish.value.lan || bestMoveStockfish.value.move
    if (lan && lan.length >= 4) {
      hints.push({
        from: notationToIndex(lan.substring(0, 2)),
        to: notationToIndex(lan.substring(2, 4)),
        color: '#ff5252', 
        xOffset: -12,
        radius: 30,
        arrowScale: 0.7
      })
    }
  }

  if (bestMovesL0c.value) {
    bestMovesL0c.value.forEach(move => {
      hints.push({
        from: notationToIndex(move.lan.substring(0, 2)),
        to: notationToIndex(move.lan.substring(2, 4)),
        color: '#2196f3', 
        xOffset: 12,
        radius: 30,
        arrowScale: 0.7
      })
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
    
    if (response.ok && fen === lastAnalysisFen.value) {
      const data = await response.json()
      bestMoveStockfish.value = Array.isArray(data) ? data[0] : data
    }
  } catch (error) {
    console.error('Stockfish API Error:', error)
  } finally {
    loadingStockfish.value = false
  }
}

const getL0cMove = async (fen) => {
  loadingL0c.value = true
  bestMovesL0c.value = []
  
  try {
    const response = await fetch(`http://127.0.0.1:2002/best-move?fen=${encodeURIComponent(fen)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
    
    if (response.ok && fen === lastAnalysisFen.value) {
      const data = await response.json()
      if (data.status === 'success' && data.best_moves && fen === lastAnalysisFen.value) {
        const mappedMoves = data.best_moves.map(m => {
          const moveLan = m.move
          const from = moveLan.substring(0, 2)
          const to = moveLan.substring(2, 4)
          const index = notationToIndex(from)
          const piece = squares.value[index]
          const pieceLetter = (piece && piece.toUpperCase() !== 'P') ? piece.toUpperCase() : ''
          const san = `${pieceLetter}${to}`
          
          return {
            san,
            lan: moveLan,
            eval: parseInt(m.score) || 0,
            depth: m.depth
          }
        })

        mappedMoves.sort((a, b) => b.eval - a.eval)
        bestMovesL0c.value = mappedMoves
      }
    }
  } catch (error) {
    console.error('L0c API Error:', error)
  } finally {
    loadingL0c.value = false
  }
}

const getLichessMoves = async (fen) => {
  loadingLichess.value = true
  bestMovesLichess.value = []
  
  try {
    const lichessRes = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=2`)
    if (lichessRes.ok && fen === lastAnalysisFen.value) {
      const data = await lichessRes.json()
      if (data.pvs && data.pvs.length > 0 && fen === lastAnalysisFen.value) {
        bestMovesLichess.value = data.pvs.map(pv => {
           const moves = pv.moves.split(' ')
           const bestMoveLan = moves[0]
           const continuation = moves.slice(1)
           
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
  const playerColor = isRotated.value ? 'black' : 'white'
  const shouldAnalyze = analyzeAllMoves.value || (currentTurn.value === playerColor)

  bestMoveStockfish.value = null
  bestMovesL0c.value = []
  bestMovesLichess.value = []
  lastAnalysisFen.value = ''
  
  if (!shouldAnalyze) {
    loadingStockfish.value = false
    loadingL0c.value = false
    loadingLichess.value = false
    return
  }

  const fen = boardToFenLocal()
  lastAnalysisFen.value = fen
  getStockfishMove(fen)
  getL0cMove(fen)
  getLichessMoves(fen)
}

const updateCastlingRights = (from, to) => {
  const piece = squares.value[to] 
  const isWhite = (piece === piece.toUpperCase())
  const color = isWhite ? 'w' : 'b'
  const row = isWhite ? 7 : 0
  
  if (piece.toLowerCase() === 'k') {
    castlingRights.value[color].k = false
    castlingRights.value[color].q = false
  }
  
  if (piece.toLowerCase() === 'r') {
    if (from === row * 8 + 0) castlingRights.value[color].q = false
    if (from === row * 8 + 7) castlingRights.value[color].k = false
  }
  
  const oppColor = isWhite ? 'b' : 'w'
  const oppRow = isWhite ? 0 : 7
  if (to === oppRow * 8 + 0) castlingRights.value[oppColor].q = false
  if (to === oppRow * 8 + 7) castlingRights.value[oppColor].k = false
}

const handleSquareClick = (index) => {
  if (selectedSquare.value !== null && validMoves.value.includes(index)) {
    const piece = squares.value[selectedSquare.value]
    const isPawn = piece.toLowerCase() === 'p'
    const row = Math.floor(index / 8)
    
    if (isPawn && (row === 0 || row === 7)) {
      pendingMove.value = { 
        from: selectedSquare.value, 
        to: index,
        color: piece === 'P' ? 'white' : 'black'
      }
      showPromotionDialog.value = true
      return
    }

    executeMove(selectedSquare.value, index)
  } else if (squares.value[index]) {
    const piece = squares.value[index]
    const isWhitePiece = piece === piece.toUpperCase()
    const isCorrectTurn = (isWhitePiece && currentTurn.value === 'white') || 
                          (!isWhitePiece && currentTurn.value === 'black')
    
    if (!isCorrectTurn) return
    
    selectedSquare.value = index
    validMoves.value = calculateValidMoves(index, squares.value, castlingRights.value, enPassantTarget.value)
  } else {
    selectedSquare.value = null
    validMoves.value = []
  }
}

const promotePawn = (pieceType) => {
  if (!pendingMove.value) return
  const { from, to, color } = pendingMove.value
  const promotionPiece = color === 'white' ? pieceType.toUpperCase() : pieceType.toLowerCase()
  executeMove(from, to, promotionPiece)
  showPromotionDialog.value = false
  pendingMove.value = null
}

const executeMove = (from, to, promotionPiece = null) => {
    const piece = squares.value[from]
    const fromNotation = indexToNotation(from)
    const toNotation = indexToNotation(to)
    
    let moveNotation = `${getPieceSymbol(piece)}${fromNotation}-${toNotation}`
    if (promotionPiece) {
      moveNotation += `=${promotionPiece.toUpperCase()}`
    }
    
    if (piece.toLowerCase() === 'p' && to === enPassantTarget.value) {
       const isWhite = piece === 'P'
       const capturePos = to - (isWhite ? -8 : 8)
       squares.value[capturePos] = ''
    }

    squares.value[to] = promotionPiece || squares.value[from]
    squares.value[from] = ''
    
    if (piece.toLowerCase() === 'k' && Math.abs(to - from) === 2) {
      const row = Math.floor(to / 8)
      if (to > from) { // Corto
        const rookFrom = row * 8 + 7
        const rookTo = row * 8 + 5
        squares.value[rookTo] = squares.value[rookFrom]
        squares.value[rookFrom] = ''
      } else { // Largo
        const rookFrom = row * 8 + 0
        const rookTo = row * 8 + 3
        squares.value[rookTo] = squares.value[rookFrom]
        squares.value[rookFrom] = ''
      }
    }
    
    updateCastlingRights(from, to)

    const isDoublePawnPush = piece.toLowerCase() === 'p' && Math.abs(to - from) === 16
    enPassantTarget.value = isDoublePawnPush ? (to + from) / 2 : null
    
    if (currentMoveIndex.value < moveHistory.value.length - 1) {
      moveHistory.value = moveHistory.value.slice(0, currentMoveIndex.value + 1)
      boardHistory.value = boardHistory.value.slice(0, currentMoveIndex.value + 2)
    }
    
    moveHistory.value.push({
      notation: moveNotation,
      from,
      to
    })
    boardHistory.value.push([...squares.value])
    currentMoveIndex.value = moveHistory.value.length - 1
    
    currentTurn.value = currentTurn.value === 'white' ? 'black' : 'white'
    
    selectedSquare.value = null
    validMoves.value = []
    
    getBestMoves()

    const kingColor = currentTurn.value
    if (isKingInCheck(kingColor, squares.value)) {
      const kingIndex = squares.value.findIndex(p => p === (kingColor === 'white' ? 'K' : 'k'))
      checkSquare.value = kingIndex
    } else {
      checkSquare.value = null
    }
}

const goToMove = (moveIndex) => {
  currentMoveIndex.value = moveIndex
  squares.value = [...boardHistory.value[moveIndex + 1]]
  selectedSquare.value = null
  validMoves.value = []
  currentTurn.value = (moveIndex + 1) % 2 === 0 ? 'white' : 'black'
}

const exportHistory = () => {
  const data = {
    moveHistory: moveHistory.value,
    boardHistory: boardHistory.value,
    currentMoveIndex: currentMoveIndex.value,
    squares: squares.value,
    currentTurn: currentTurn.value,
    castlingRights: castlingRights.value,
    enPassantTarget: enPassantTarget.value,
    checkSquare: checkSquare.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `partida_ajedrez_${new Date().getTime()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importHistory = (data) => {
  try {
    moveHistory.value = data.moveHistory || []
    boardHistory.value = data.boardHistory || [[...initialPosition]]
    currentMoveIndex.value = data.currentMoveIndex ?? -1
    squares.value = data.squares || [...initialPosition]
    currentTurn.value = data.currentTurn || 'white'
    castlingRights.value = data.castlingRights || {
      w: { k: true, q: true },
      b: { k: true, q: true }
    }
    enPassantTarget.value = data.enPassantTarget ?? null
    checkSquare.value = data.checkSquare ?? null
    
    selectedSquare.value = null
    validMoves.value = []
    
    getBestMoves()
  } catch (err) {
    console.error('Error al restaurar partida:', err)
  }
}

watch([isRotated, analyzeAllMoves], () => {
  getBestMoves()
})
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
