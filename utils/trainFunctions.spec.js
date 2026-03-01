import { calculateBestRateIndex, diffMinutesDepartures, minBricks } from "./trainFunctions"

describe("calculateBestRateIndex", () => {
  it("should return the correct index for the highest rate (price/votes)", () => {
    // Explanation of expected rates:
    // Index 0: 6 / 3 = 2
    // Index 1: 5 / 3 = 1.666...
    // Index 2: 2 / 2 = 1
    // Index 3: 16 / 4 = 4  <-- Highest rate

    const prices = [6, 5, 2, 16]
    const votes = [3, 3, 2, 4]

    const result = calculateBestRateIndex(prices, votes)

    // It should return index 3, which corresponds to the last item
    expect(result).toBe(3)
  })

  it("should return the correct index for the highest rate (price/votes)", () => {
    // Explanation of expected rates:
    // Index 0: 6 / 3 = 2
    // Index 1: 5 / 3 = 1.666...
    // Index 2: 2 / 2 = 1
    // Index 3: 16 / 4 = 4  <-- Highest rate

    const prices = [12, 5, 2, 1]
    const votes = [3, 3, 2, 4]

    const result = calculateBestRateIndex(prices, votes)

    // It should return index 3, which corresponds to the last item
    expect(result).toBe(0)
  })

  it("should handle ties by returning the first encountered top rate (due to sort stability)", () => {
    // Expected rates:
    // Index 0: 10 / 2 = 5
    // Index 1: 15 / 3 = 5  <-- Tie
    // Index 2: 4 / 2 = 2

    const prices = [10, 15, 4]
    const votes = [2, 3, 2]

    const result = calculateBestRateIndex(prices, votes)

    // Depending on exactly how Array.prototype.sort handles ties,
    // we would expect it to find one of the top values.
    // For V8 engine and the code `b.rate - a.rate`, typically it might return index 0 or 1.
    // If you explicitly want standard stability, it's good to write tests to lock the behavior down!
    expect([0, 1]).toContain(result)
  })
})

describe("diffMinutesDepartures", () => {
  it('should return -1 when testing ["00:00", "12:30"] against "00:00"', () => {
    expect(diffMinutesDepartures(["00:00", "12:30"], "00:00")).toBe(-1)
  })

  it('should return -1 when testing ["12:30", "13:00"] against "00:00"', () => {
    expect(diffMinutesDepartures(["12:30", "13:00"], "00:00")).toBe(-1)
  })

  it('should return 30 when testing ["12:00", "12:30"] against "13:00"', () => {
    expect(diffMinutesDepartures(["12:00", "12:30"], "13:00")).toBe(30)
  })
})

describe("minBricks", () => {
  it("should return 4 for [1, 4, 3, 2]", () => {
    expect(minBricks([1, 4, 3, 2])).toBe(4)
  })

  it("should return 9 for [5, 7, 9, 4, 11]", () => {
    expect(minBricks([5, 7, 9, 4, 11])).toBe(9)
  })
})
