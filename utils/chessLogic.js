// Piezas: mayúsculas = blancas, minúsculas = negras
// K/k = Rey, Q/q = Reina, R/r = Torre, B/b = Alfil, N/n = Caballo, P/p = Peón
export const initialPosition = [
  'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r', // Fila 8 (negras)
  'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', // Fila 7 (peones negros)
  '', '', '', '', '', '', '', '',         // Fila 6
  '', '', '', '', '', '', '', '',         // Fila 5
  '', '', '', '', '', '', '', '',         // Fila 4
  '', '', '', '', '', '', '', '',         // Fila 3
  'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', // Fila 2 (peones blancos)
  'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'  // Fila 1 (blancas)
]

export const pieceSymbols = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
}

export const notationToIndex = (notation) => {
  const file = notation.charCodeAt(0) - 97 // a->0
  const rank = 8 - parseInt(notation[1]) // 8->0
  return rank * 8 + file
}

export const indexToNotation = (index) => {
  const row = Math.floor(index / 8)
  const col = index % 8
  const file = String.fromCharCode(97 + col) // a-h
  const rank = 8 - row // 1-8
  return `${file}${rank}`
}

export const getPieceName = (p) => {
  switch(p.toLowerCase()) {
    case 'k': return 'Rey';
    case 'q': return 'Dama';
    case 'r': return 'Torre';
    case 'b': return 'Alfil';
    case 'n': return 'Caballo';
    case 'p': return 'Peón';
  }
  return ''
}

export const boardToFen = (squares, currentTurn, castlingRights, enPassantTarget, moveHistoryLength = 0) => {
  let fen = ''
  for (let row = 0; row < 8; row++) {
    let empty = 0
    for (let col = 0; col < 8; col++) {
      const piece = squares[row * 8 + col]
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
  
  fen += ` ${currentTurn.charAt(0)}`
  
  // Castling rights for FEN
  let rights = ''
  if (castlingRights.w.k) rights += 'K'
  if (castlingRights.w.q) rights += 'Q'
  if (castlingRights.b.k) rights += 'k'
  if (castlingRights.b.q) rights += 'q'
  
  // Validar si el EP es realmente capturable para evitar errores en APIs estrictas
  let epNotation = '-'
  if (enPassantTarget !== null) {
     const epIndex = enPassantTarget
     const epCol = epIndex % 8
     const attackRow = currentTurn === 'white' ? 3 : 4
     const pawnChar = currentTurn === 'white' ? 'P' : 'p'
     
     let canCapture = false
     if (epCol > 0 && squares[attackRow * 8 + (epCol - 1)] === pawnChar) canCapture = true
     if (epCol < 7 && squares[attackRow * 8 + (epCol + 1)] === pawnChar) canCapture = true
     
     if (canCapture) {
         epNotation = indexToNotation(epIndex)
     }
  }

  const halfMove = 0 
  const fullMove = Math.floor(moveHistoryLength / 2) + 1

  fen += ` ${rights || '-'} ${epNotation} ${halfMove} ${fullMove}` 
  return fen
}

export const isSquareAttacked = (targetIndex, byColor, board) => {
  const row = Math.floor(targetIndex / 8)
  const col = targetIndex % 8
  const isWhiteAttacker = byColor === 'white'

  // 1. Peones
  const pawnRow = isWhiteAttacker ? row + 1 : row - 1
  if (pawnRow >= 0 && pawnRow < 8) {
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
        break 
      }
      r += dr
      c += dc
    }
  }

  return false
}

export const isKingInCheck = (color, board) => {
  const kingChar = color === 'white' ? 'K' : 'k'
  const kingIndex = board.findIndex(p => p === kingChar)
  if (kingIndex === -1) return false 
  
  const opponentColor = color === 'white' ? 'black' : 'white'
  return isSquareAttacked(kingIndex, opponentColor, board)
}

export const getPawnMoves = (row, col, isWhite, squares, enPassantTarget) => {
  const moves = []
  const direction = isWhite ? -1 : 1
  const startRow = isWhite ? 6 : 1

  // Movimiento hacia adelante
  const forwardIndex = (row + direction) * 8 + col
  if (row + direction >= 0 && row + direction < 8 && !squares[forwardIndex]) {
    moves.push(forwardIndex)

    if (row === startRow) {
      const doubleIndex = (row + 2 * direction) * 8 + col
      if (!squares[doubleIndex]) {
        moves.push(doubleIndex)
      }
    }
  }

  // Capturas diagonales
  for (const dc of [-1, 1]) {
    const newCol = col + dc
    if (newCol >= 0 && newCol < 8 && row + direction >= 0 && row + direction < 8) {
      const captureIndex = (row + direction) * 8 + newCol
      const targetPiece = squares[captureIndex]
      if (targetPiece && (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
        moves.push(captureIndex)
      }
    }
  }

  // Captura al paso
  if (enPassantTarget !== null) {
    const epRow = Math.floor(enPassantTarget / 8)
    const epCol = enPassantTarget % 8
    if (epRow === row + direction && Math.abs(epCol - col) === 1) {
       moves.push(enPassantTarget)
    }
  }
  return moves
}

export const getKnightMoves = (row, col, isWhite, squares) => {
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
      const targetPiece = squares[index]
      if (!targetPiece || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
        moves.push(index)
      }
    }
  }
  return moves
}

export const getBishopMoves = (row, col, isWhite, squares) => {
  const moves = []
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  for (const [dr, dc] of directions) {
    let r = row + dr
    let c = col + dc
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const index = r * 8 + c
      const targetPiece = squares[index]
      if (!targetPiece) {
        moves.push(index)
      } else {
        if ((targetPiece === targetPiece.toUpperCase()) !== isWhite) {
          moves.push(index)
        }
        break
      }
      r += dr
      c += dc
    }
  }
  return moves
}

export const getRookMoves = (row, col, isWhite, squares) => {
  const moves = []
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  for (const [dr, dc] of directions) {
    let r = row + dr
    let c = col + dc
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const index = r * 8 + c
      const targetPiece = squares[index]
      if (!targetPiece) {
        moves.push(index)
      } else {
        if ((targetPiece === targetPiece.toUpperCase()) !== isWhite) {
          moves.push(index)
        }
        break
      }
      r += dr
      c += dc
    }
  }
  return moves
}

export const getQueenMoves = (row, col, isWhite, squares) => {
  return [...getBishopMoves(row, col, isWhite, squares), ...getRookMoves(row, col, isWhite, squares)]
}

export const canCastle = (isWhite, isShort, squares, castlingRights) => {
  const color = isWhite ? 'w' : 'b'
  const side = isShort ? 'k' : 'q'
  
  if (!castlingRights[color][side]) return false

  const row = isWhite ? 7 : 0
  
  if (isShort) {
    if (squares[row * 8 + 5] || squares[row * 8 + 6]) return false
  } else if (squares[row * 8 + 1] || squares[row * 8 + 2] || squares[row * 8 + 3]) {
    return false
  }
  
  return true
}

export const getKingMoves = (row, col, isWhite, squares, castlingRights) => {
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
      const targetPiece = squares[index]
      if (!targetPiece || (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
        moves.push(index)
      }
    }
  }

  // Enroque (Solo lógica de casilla vacía/derechos, validación de jaque se hace en calculateValidMoves)
  if (row === (isWhite ? 7 : 0) && col === 4) {
    if (canCastle(isWhite, true, squares, castlingRights)) moves.push(row * 8 + 6)
    if (canCastle(isWhite, false, squares, castlingRights)) moves.push(row * 8 + 2)
  }

  return moves
}

export const calculateValidMoves = (index, squares, castlingRights, enPassantTarget) => {
  const piece = squares[index]
  if (!piece) return []

  const moves = []
  const row = Math.floor(index / 8)
  const col = index % 8
  const isWhite = piece === piece.toUpperCase()

  switch (piece.toUpperCase()) {
    case 'P': moves.push(...getPawnMoves(row, col, isWhite, squares, enPassantTarget)); break
    case 'N': moves.push(...getKnightMoves(row, col, isWhite, squares)); break
    case 'B': moves.push(...getBishopMoves(row, col, isWhite, squares)); break
    case 'R': moves.push(...getRookMoves(row, col, isWhite, squares)); break
    case 'Q': moves.push(...getQueenMoves(row, col, isWhite, squares)); break
    case 'K': moves.push(...getKingMoves(row, col, isWhite, squares, castlingRights)); break
  }

  return moves.filter(moveIndex => {
    const nextBoard = [...squares]
    nextBoard[moveIndex] = nextBoard[index]
    nextBoard[index] = ''
    return !isKingInCheck(isWhite ? 'white' : 'black', nextBoard)
  })
}
