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
    console.log(structureCopy[i], structureCopy[i + 1], " :", i, " ", addBricks)
    const diff = structureCopy[i + 1] - structureCopy[i] - 1
    if (diff > 0) {
      console.log("add bricks", diff)
      ascBricks += diff
      structureCopy[i] += diff
      addBricks = true
    } else if (diff < 0) {
      console.log("add bricks", diff)
      ascBricks += diff * -1
      structureCopy[i + 1] += diff * -1
      addBricks = true
    }

    if (addBricks && i === structureCopy.length - 2) {
      i = 0
      addBricks = false
      console.log("reset", i)
    } else {
      i++
    }
  }

  structure.reverse()
  addBricks = false
  i = 0
  while ((addBricks === false && i === structure.length - 2) || i < structure.length - 1) {
    console.log(structure[i], structure[i + 1], " :", i, " ", addBricks)
    const diff = structure[i + 1] - structure[i] - 1
    if (diff > 0) {
      console.log("add bricks", diff)
      descBricks += diff
      structure[i] += diff
      addBricks = true
    } else if (diff < 0) {
      console.log("add bricks", diff)
      descBricks += diff * -1
      structure[i + 1] += diff * -1
      addBricks = true
    }

    console.log(structure)
    if (addBricks && i === structure.length - 2) {
      i = 0
      addBricks = false
      console.log("reset", i)
    } else {
      i++
    }
  }
  console.log(ascBricks, structureCopy, descBricks, structure)
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
    console.log("normalized", normalized)

    // We must pick the maximum normalized value to ensure we only ADD bricks
    const startValue = Math.max(...normalized)
    console.log("startValue", startValue)

    // Sum the differences: (startValue + index) - originalValue
    console.log(arr)
    return arr.reduce((sum, val, i) => sum + (startValue + i - val), 0)
  }

  const ascCost = getCost(structure)
  const descCost = getCost([...structure].reverse())
  console.log(ascCost, descCost)
  return Math.min(ascCost, descCost)
}

export function batteryCharges() {}
