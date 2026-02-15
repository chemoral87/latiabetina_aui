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
const analyzeAllMoves = ref(true) // Switch para controlar análisis

const castlingRights = ref({
  w: { k: true, q: true },
  b: { k: true, q: true }
})
const enPassantTarget = ref(null) // Índice de la casilla de captura al paso
const checkSquare = ref(null) // Índice del Rey en Jaque

// Estados para promoción
const showPromotionDialog = ref(false)
const pendingMove = ref(null)

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
  castlingRights.value = {
    w: { k: true, q: true },
    b: { k: true, q: true }
  }
  enPassantTarget.value = null
  checkSquare.value = null
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
  
  // Castling rights for FEN
  let rights = ''
  if (castlingRights.value.w.k) rights += 'K'
  if (castlingRights.value.w.q) rights += 'Q'
  if (castlingRights.value.b.q) rights += 'q'
  
  // Validar si el EP es realmente capturable para evitar errores en APIs estrictas
  let epNotation = '-'
  if (enPassantTarget.value !== null) {
     const epIndex = enPassantTarget.value
     const epCol = epIndex % 8
     // Si es turno blancas, los peones blancos están en fila 3 (Rank 5). Si negras, fila 4 (Rank 4).
     const attackRow = currentTurn.value === 'white' ? 3 : 4
     const pawnChar = currentTurn.value === 'white' ? 'P' : 'p'
     
     // Verificar vecinos en esa fila
     let canCapture = false
     // Izquierda
     if (epCol > 0 && squares.value[attackRow * 8 + (epCol - 1)] === pawnChar) canCapture = true
     // Derecha
     if (epCol < 7 && squares.value[attackRow * 8 + (epCol + 1)] === pawnChar) canCapture = true
     
     if (canCapture) {
         epNotation = indexToNotation(epIndex)
     }
  }

  // Contadores para FEN
  const halfMove = 0 // Simplificado (debería ser movimientos desde última captura/peón)
  const fullMove = Math.floor(moveHistory.value.length / 2) + 1

  fen += ` ${rights || '-'} ${epNotation} ${halfMove} ${fullMove}` 
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
  // Lógica de análisis condicional
  const playerColor = isRotated.value ? 'black' : 'white'
  const shouldAnalyze = analyzeAllMoves.value || (currentTurn.value === playerColor)

  if (!shouldAnalyze) {
    bestMoveStockfish.value = null
    bestMovesLichess.value = []
    loadingStockfish.value = false
    loadingLichess.value = false
    return
  }

  const fen = boardToFen()
  getStockfishMove(fen)
  getLichessMoves(fen)
}

const getPieceSymbol = (piece) => {
  return pieceSymbols[piece] || ''
}

const getPieceName = (p) => {
  switch(p) {
    case 'q': return 'Dama';
    case 'r': return 'Torre';
    case 'b': return 'Alfil';
    case 'n': return 'Caballo';
  }
  return ''
}

const canCastle = (isWhite, isShort) => {
  const color = isWhite ? 'w' : 'b'
  const side = isShort ? 'k' : 'q'
  
  if (!castlingRights.value[color][side]) return false

  const row = isWhite ? 7 : 0
  
  if (isShort) {
    if (squares.value[row * 8 + 5] || squares.value[row * 8 + 6]) return false
  } else if (squares.value[row * 8 + 1] || squares.value[row * 8 + 2] || squares.value[row * 8 + 3]) {
    return false
  }
  
  return true
}

const updateCastlingRights = (from, to) => {
  const piece = squares.value[to] // Ya movida
  const isWhite = (piece === piece.toUpperCase())
  const color = isWhite ? 'w' : 'b'
  const row = isWhite ? 7 : 0
  
  // Si se mueve el rey
  if (piece.toLowerCase() === 'k') {
    castlingRights.value[color].k = false
    castlingRights.value[color].q = false
  }
  
  // Si se mueve una torre
  if (piece.toLowerCase() === 'r') {
    if (from === row * 8 + 0) castlingRights.value[color].q = false
    if (from === row * 8 + 7) castlingRights.value[color].k = false
  }
  
  // Si una torre es capturada
  const oppColor = isWhite ? 'b' : 'w'
  const oppRow = isWhite ? 0 : 7
  if (to === oppRow * 8 + 0) castlingRights.value[oppColor].q = false
  if (to === oppRow * 8 + 7) castlingRights.value[oppColor].k = false
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

  // Enroque
  if (row === (isWhite ? 7 : 0) && col === 4) {
    // Corto
    if (canCastle(isWhite, true)) moves.push(row * 8 + 6)
    // Largo
    if (canCastle(isWhite, false)) moves.push(row * 8 + 2)
  }

  return moves
}

const handleSquareClick = (index) => {
  // Si hay una casilla seleccionada y clickeamos en un movimiento válido
  if (selectedSquare.value !== null && validMoves.value.includes(index)) {
    const piece = squares.value[selectedSquare.value]
    const isPawn = piece.toLowerCase() === 'p'
    const row = Math.floor(index / 8)
    
    // Verificar Promoción
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

const promotePawn = (pieceType) => {
  if (!pendingMove.value) return
  
  const { from, to, color } = pendingMove.value
  // La pieza será mayúscula si es blanca, minúscula si es negra
  const promotionPiece = color === 'white' ? pieceType.toUpperCase() : pieceType.toLowerCase()
  
  executeMove(from, to, promotionPiece)
  
  showPromotionDialog.value = false
  pendingMove.value = null
}

const executeMove = (from, to, promotionPiece = null) => {
    const piece = squares.value[from]
    const fromNotation = indexToNotation(from)
    const toNotation = indexToNotation(to)
    
    // Si hay promoción, usamos la pieza promocionada para el tablero, 
    // pero para la notación quizás queremos indicar la promoción (e.g. e8=Q)
    let moveNotation = `${getPieceSymbol(piece)}${fromNotation}-${toNotation}`
    if (promotionPiece) {
      moveNotation += `=${promotionPiece.toUpperCase()}`
    }
    
    // Manejar captura al paso
    if (piece.toLowerCase() === 'p' && to === enPassantTarget.value) {
       const isWhite = piece === 'P'
       const capturePos = to - (isWhite ? -8 : 8)
       squares.value[capturePos] = ''
    }

    // Mover la pieza (o la promocionada)
    squares.value[to] = promotionPiece || squares.value[from]
    squares.value[from] = ''
    
    // Si hubo promoción, la pieza 'piece' ahora referencia a lo que había antes (Pawn), que es correcto para la lógica de enroque/EP inicial.
    // Pero si queremos lógica post-movimiento, 'squares.value[to]' tiene la nueva pieza.

    // Manejar enroque (Mover torre logic...)
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
    
    // Actualizar derechos de enroque
    updateCastlingRights(from, to)

    // Actualizar En Passant Target
    const isDoublePawnPush = piece.toLowerCase() === 'p' && Math.abs(to - from) === 16
    enPassantTarget.value = isDoublePawnPush ? (to + from) / 2 : null
    
    // Guardar en el historial
    // Si estamos en medio del historial, eliminar movimientos futuros
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
    
    // Cambiar turno
    currentTurn.value = currentTurn.value === 'white' ? 'black' : 'white'
    
    selectedSquare.value = null
    validMoves.value = []
    
    // Obtener mejores movimientos
    getBestMoves()

    // Verificar Jaque al finalizar turno
    const kingColor = currentTurn.value
    if (isKingInCheck(kingColor, squares.value)) {
      const kingIndex = squares.value.findIndex(p => p === (kingColor === 'white' ? 'K' : 'k'))
      checkSquare.value = kingIndex
    } else {
      checkSquare.value = null
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

  // Enroque visual logic
  if (row === (isWhite ? 7 : 0) && col === 4) {
    if (canCastle(isWhite, true)) moves.push(row * 8 + 6)
    if (canCastle(isWhite, false)) moves.push(row * 8 + 2)
  }

  // Filtrar movimientos que dejan al rey en jaque
  return moves.filter(moveIndex => {
    // Simular movimiento
    const nextBoard = [...squares.value]
    nextBoard[moveIndex] = nextBoard[index]
    nextBoard[index] = ''
    
    // Si es enroque, mover torre también (simplificado para validación básica)
    // El enroque requiere validación especial (camino no atacado), pero 
    // isKingInCheck lo cubrirá parcialmente si el destino está atacado.
    // La regla real dice que no puedes pasar por jaque.
    // Para simplificar, asumimos que si el rey termina safe, ok. (Faltaría validar casilla de paso).
    
    return !isKingInCheck(isWhite ? 'white' : 'black', nextBoard)
  })
}

// Lógica de Jaque
const isKingInCheck = (color, board) => {
  const kingChar = color === 'white' ? 'K' : 'k'
  const kingIndex = board.findIndex(p => p === kingChar)
  if (kingIndex === -1) return false // No hay rey (raro)
  
  const opponentColor = color === 'white' ? 'black' : 'white'
  return isSquareAttacked(kingIndex, opponentColor, board)
}

const isSquareAttacked = (targetIndex, byColor, board) => {
  const row = Math.floor(targetIndex / 8)
  const col = targetIndex % 8
  const isWhiteAttacker = byColor === 'white'

  // 1. Peones
  const pawnRow = isWhiteAttacker ? row + 1 : row - 1
  if (pawnRow >= 0 && pawnRow < 8) {
    // Diagonales desde las que un peón atacaría a esta casilla
    const pawnChar = isWhiteAttacker ? 'P' : 'p'
    if (col > 0 && board[pawnRow * 8 + (col - 1)] === pawnChar) return true
    if (col < 7 && board[pawnRow * 8 + (col + 1)] === pawnChar) return true
  }

  // 2. Caballos
  const knightChar = isWhiteAttacker ? 'N' : 'n'
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]
  for (const [dr, dc] of knightMoves) {
    const r = row + dr
    const c = col + dc
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (board[r * 8 + c] === knightChar) return true
    }
  }

  // 3. Rey (Adyacente)
  const kingChar = isWhiteAttacker ? 'K' : 'k'
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < 8 && c >= 0 && c < 8 && !(r === row && c === col)) {
        if (board[r * 8 + c] === kingChar) return true
      }
    }
  }

  // 4. Sliding Pieces (R, B, Q)
  const rookChar = isWhiteAttacker ? 'R' : 'r'
  const bishopChar = isWhiteAttacker ? 'B' : 'b'
  const queenChar = isWhiteAttacker ? 'Q' : 'q'
  
  const directions = [
    { dr: -1, dc: 0, pieces: [rookChar, queenChar] },
    { dr: 1, dc: 0, pieces: [rookChar, queenChar] },
    { dr: 0, dc: -1, pieces: [rookChar, queenChar] },
    { dr: 0, dc: 1, pieces: [rookChar, queenChar] },
    { dr: -1, dc: -1, pieces: [bishopChar, queenChar] },
    { dr: -1, dc: 1, pieces: [bishopChar, queenChar] },
    { dr: 1, dc: -1, pieces: [bishopChar, queenChar] },
    { dr: 1, dc: 1, pieces: [bishopChar, queenChar] }
  ]

  for (const { dr, dc, pieces } of directions) {
    let r = row + dr
    let c = col + dc
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = board[r * 8 + c]
      if (p) {
        if (pieces.includes(p)) return true
        break // Bloqueado por otra pieza
      }
      r += dr
      c += dc
    }
  }

  return false
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

  // Captura al paso
  if (enPassantTarget.value !== null) {
    const epRow = Math.floor(enPassantTarget.value / 8)
    const epCol = enPassantTarget.value % 8
    // Si la casilla EP está en la fila destino (row + direction) y columna adyacente
    if (epRow === row + direction && Math.abs(epCol - col) === 1) {
       moves.push(enPassantTarget.value)
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
