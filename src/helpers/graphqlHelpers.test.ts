import { getErrorMessages } from "./graphqlHelpers"

describe("GraphQL Helpers", () => {
  describe("getErrorMessages", () => {
    it("Returns null for invalid JSON", () => {
      const errorMessages = getErrorMessages("{'invalid JSON'}")
      expect(errorMessages).toEqual(null)
    })

    it("Returns null when no body", () => {
      const errorMessages = getErrorMessages(undefined)
      expect(errorMessages).toEqual(null)
    })

    it("Returns empty array when no errors", () => {
      const errorMessages = getErrorMessages(
        JSON.stringify({
          data: [],
        })
      )
      expect(errorMessages).toEqual([])
    })

    it("Parses multiple error messages correctly", () => {
      const errorMessages = getErrorMessages(
        JSON.stringify({
          errors: [{ message: "First Error" }, { message: "Second Error" }],
        })
      )
      expect(errorMessages).toEqual(["First Error", "Second Error"])
    })
  })
})
