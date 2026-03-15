export function calculateBestRateIndex(prices, votes) {
  const rates = prices.map((item, index) => {
    return { rate: item / votes[index], i: index }
  })
  rates.sort((a, b) => b.rate - a.rate)

  return rates[0].i
}

export function diffMinutesDepartures(departures, currentTime) {
  const [hh, mm] = currentTime.split(":").map(Number)
  const currentMinutes = hh * 60 + mm

  const departureInMinutes = departures.map((item) => {
    const [hh, mm] = item.split(":").map(Number)
    return hh * 60 + mm
  })

  if (departureInMinutes.filter((d) => d === 0) && currentMinutes === 0) {
    return -1
  }

  const lastDeparture = departureInMinutes.sort((a, b) => b - a).filter((d) => d < currentMinutes)[0]

  return currentMinutes - lastDeparture
}

export function minBricksNoWork(structure) {
  const n = structure.length
  if (n <= 1) return 0

  const calculateCost = (arr) => {
    let bricks = 0
    const currentArr = [...arr]

    for (let i = 1; i < n; i++) {
      // Rule: Current must be exactly 1 greater than previous
      const target = currentArr[i - 1] + 1
      if (currentArr[i] < target) {
        bricks += target - currentArr[i]
        currentArr[i] = target
      }
    }
    return bricks
  }

  // 1. Cost to make it strictly increasing: [1, 2, 3, 4...]
  const ascCost = calculateCost(structure)

  // 2. Cost to make it strictly decreasing: [...4, 3, 2, 1]
  // We do this by reversing the input, making it increasing, then reversing back.
  const descCost = calculateCost([...structure].reverse())

  return Math.min(ascCost, descCost)
}

export function minBricks2(structure) {
  let ascBricks = 0
  let descBricks = 0
  let i = 0
  let addBricks = false
  const structureCopy = [...structure]

  while ((addBricks === false && i === structureCopy.length - 2) || i < structureCopy.length - 1) {
    const diff = structureCopy[i + 1] - structureCopy[i] - 1
    if (diff > 0) {
      ascBricks += diff
      structureCopy[i] += diff
      addBricks = true
    } else if (diff < 0) {
      ascBricks += diff * -1
      structureCopy[i + 1] += diff * -1
      addBricks = true
    }

    if (addBricks && i === structureCopy.length - 2) {
      i = 0
      addBricks = false
    } else {
      i++
    }
  }

  structure.reverse()
  addBricks = false
  i = 0
  while ((addBricks === false && i === structure.length - 2) || i < structure.length - 1) {
    const diff = structure[i + 1] - structure[i] - 1
    if (diff > 0) {
      descBricks += diff
      structure[i] += diff
      addBricks = true
    } else if (diff < 0) {
      descBricks += diff * -1
      structure[i + 1] += diff * -1
      addBricks = true
    }

    if (addBricks && i === structure.length - 2) {
      i = 0
      addBricks = false
    } else {
      i++
    }
  }
  return ascBricks > descBricks ? descBricks : ascBricks
}

export function minBricks3(structure) {
  const calculateCost = (arr) => {
    let bricks = 0
    const currentArr = [...arr]

    const targetArray = []
    targetArray.push(currentArr[0])
    for (let i = 1; i < currentArr.length; i++) {
      bricks += targetArray[i - 1] + 1 - currentArr[i]
      targetArray.push(targetArray[i - 1] + 1)
    }
    const differences = currentArr.map((val, index) => targetArray[index] - val)
    const highestDifferent = Math.min(...differences)

    return bricks + highestDifferent * -1 * currentArr.length
  }

  const ascCost = calculateCost(structure)
  const descCost = calculateCost([...structure].reverse())

  return Math.min(ascCost, descCost)
}

export function minBricks(structure) {
  if (structure.length <= 1) return 0

  const getCost = (arr) => {
    // Normalize: What would the starting brick be if this element was the anchor?
    const normalized = arr.map((val, i) => val - i)

    // We must pick the maximum normalized value to ensure we only ADD bricks
    const startValue = Math.max(...normalized)

    // Sum the differences: (startValue + index) - originalValue
    return arr.reduce((sum, val, i) => sum + (startValue + i - val), 0)
  }

  const ascCost = getCost(structure)
  const descCost = getCost([...structure].reverse())

  return Math.min(ascCost, descCost)
}

export function maxbatteryCharges3(t, capacities, recharges) {
  const n = capacities.length
  // Pair capacities with their recharge requirements and track usage
  const batteries = capacities.map((cap, i) => ({
    cap,
    req: recharges[i],
    used: false,
  }))

  let totalCapacityReached = 0
  let batteryCount = 0

  while (totalCapacityReached < t) {
    // Find the best available battery:
    // It must not be used AND totalCapacityReached must be >= its recharge requirement
    let bestIdx = -1
    for (let i = 0; i < n; i++) {
      const b = batteries[i]
      if (!b.used && totalCapacityReached >= b.req) {
        if (bestIdx === -1 || b.cap > batteries[bestIdx].cap) {
          bestIdx = i
        }
      }
    }

    // If no battery is available to be picked, we failed
    if (bestIdx === -1) return -1

    // Use the battery
    const chosen = batteries[bestIdx]
    chosen.used = true
    totalCapacityReached += chosen.cap
    batteryCount++
  }

  return batteryCount
}

export function maxbatteryCharges(t, capacity, recharges) {
  let currRecharges = [...recharges]
  let batteryCount = 0
  while (t > 0) {
    const rechargeIndex = currRecharges.map((r, i) => (r === recharges[i] ? i : -1)).filter((i) => i !== -1)[0]
    if (rechargeIndex === undefined) break

    t = t - capacity[rechargeIndex]
    if (t < 0) break
    currRecharges[rechargeIndex] = 0
    batteryCount++
    currRecharges = currRecharges.map((r, i) => {
      if (i === rechargeIndex) {
        return r // Keep original
      }
      if (r + capacity[rechargeIndex] > recharges[i]) {
        return recharges[i]
      } else {
        return r + capacity[rechargeIndex]
      }
    })
  }
  if (t > 0) return -1
  return batteryCount
}

export function maxbatteryCharges2(t, capacity, recharges) {
  // Sort capacity costs ascending to greedily pick the cheapest charges first
  const sorted = [...capacity].sort((a, b) => a - b)
  let count = 0
  let remaining = t

  for (const cost of sorted) {
    if (remaining >= cost) {
      remaining -= cost
      count++
    } else {
      break
    }
  }

  return count
}

export function decodePassword(password, keys) {
  let countDecode = 0
  for (let i = 0; i < keys.length - 1; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      if (keys[i].toString() + keys[j].toString() === password.toString()) countDecode++
      if (keys[j].toString() + keys[i].toString() === password.toString()) countDecode++
    }
  }
  return countDecode
}

export function tetrisOriginal(n, m, pieces) {
  const shapes = {
    a: [[1]],
    b: [
      [1, 1],
      [1, 1],
    ],
    c: [
      [1, 1],
      [1, 0],
    ],
    d: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    e: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  }

  const array = Array.from({ length: n }, () => Array(m).fill(0))

  function canPlacePiece(piece, x, y) {
    for (let i = 0; i < piece.length; i++) {
      for (let j = 0; j < piece[i].length; j++) {
        if (piece[i][j] === 1 && (x + i >= n || y + j >= m || array[x + i][y + j] !== 0)) {
          return false
        }
      }
    }
    return true
  }

  function placePiece(piece, x, y, ix) {
    for (let i = 0; i < piece.length; i++) {
      for (let j = 0; j < piece[i].length; j++) {
        if (piece[i][j] === 1) {
          array[x + i][y + j] = ix
        }
      }
    }
  }

  pieces.forEach((piece, ix) => {
    const figure = shapes[piece]

    let placed = false

    for (let i = 0; i <= n - figure.length + 1; i++) {
      for (let j = 0; j <= m - figure[0].length + 1; j++) {
        if (canPlacePiece(figure, i, j) && !placed) {
          placePiece(figure, i, j, ix + 1)
          placed = true
          // const arrayCopy = [...array]
        }
      }
    }
  })

  return array
}

export function tetrisGemini(n, m, pieces) {
  // Initialize grid with 0s
  const grid = Array.from({ length: n }, () => Array(m).fill(0))

  function canPlace(shape, row, col) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const targetRow = row + r
          const targetCol = col + c

          // Check boundaries and collision
          if (targetRow >= n || targetCol >= m || grid[targetRow][targetCol] !== 0) {
            return false
          }
        }
      }
    }
    return true
  }

  function place(shape, row, col, id) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          grid[row + r][col + c] = id
        }
      }
    }
  }

  pieces.forEach((type, index) => {
    const shape = SHAPES[type]
    const pieceId = index + 1
    let placed = false

    // Iterate through the grid to find the first available spot
    for (let r = 0; r <= n - shape.length; r++) {
      for (let c = 0; c <= m - shape[0].length; c++) {
        if (canPlace(shape, r, c)) {
          place(shape, r, c, pieceId)
          placed = true
          break // Exit inner loop
        }
      }
      if (placed) break // Exit outer loop
    }
  })

  return grid
}

const SHAPES = {
  a: [[1]],
  b: [
    [1, 1],
    [1, 1],
  ],
  c: [
    [1, 1],
    [1, 0],
  ],
  d: [
    [1, 0],
    [1, 1],
    [1, 0],
  ],
  e: [
    [0, 1, 0],
    [1, 1, 1],
  ],
}

export function tetris(n, m, pieces) {
  // Initialize grid with 0s
  const grid = Array.from({ length: n }, () => Array(m).fill(0))

  /**
   * Attempts to place a shape at (row, col) with the given id.
   * Returns true and mutates the grid on success; returns false and leaves the grid unchanged on failure.
   */
  function tryPlace(shape, row, col, id) {
    const cells = []

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 1) continue

        const targetRow = row + r
        const targetCol = col + c

        // Check boundaries and collision
        if (targetRow >= n || targetCol >= m || grid[targetRow][targetCol] !== 0) {
          return false
        }

        cells.push([targetRow, targetCol])
      }
    }

    // All cells are valid — commit the placement
    for (const [r, c] of cells) {
      grid[r][c] = id
    }

    return true
  }

  pieces.forEach((type, index) => {
    const shape = SHAPES[type]
    const pieceId = index + 1
    let placed = false

    // Iterate through the grid to find the first available spot
    for (let r = 0; r <= n - shape.length; r++) {
      for (let c = 0; c <= m - shape[0].length; c++) {
        if (tryPlace(shape, r, c, pieceId)) {
          placed = true
          break
        }
      }
      if (placed) break
    }
  })

  return grid
}
