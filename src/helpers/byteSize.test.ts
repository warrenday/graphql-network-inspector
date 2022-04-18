import { byteSize } from "./byteSize"

describe("byteSize", () => {
  it("converts bytes to megabytes", () => {
    const tests = [
      [100000, 0.1],
      [1000000, 1],
      [10000000, 10],
      [15500000, 15.5],
    ]

    tests.forEach(([input, output]) => {
      expect(byteSize(input)).toBe(output)
    })
  })
})
