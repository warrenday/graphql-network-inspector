import parseAuthHeader from "./parseAuthHeader"

describe("parseAuthHeader", () => {
  it("parses a bearer token header", () => {
    const header = {
      name: "Authorization",
      value:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    }

    const result = parseAuthHeader(header)
    expect(result).toEqual(
      '{"sub":"1234567890","name":"John Doe","iat":1516239022}'
    )
  })

  it("parses a non-bearer token header", () => {
    const header = {
      name: "Authorization",
      value:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    }

    const result = parseAuthHeader(header)
    expect(result).toEqual(
      '{"sub":"1234567890","name":"John Doe","iat":1516239022}'
    )
  })

  it("returns undefined if the header value is empty", () => {
    const header = {
      name: "Authorization",
    }

    const result = parseAuthHeader(header)
    expect(result).toBeUndefined()
  })

  it("returns undefined if the header value is not a valid JWT", () => {
    const header = {
      name: "Authorization",
      value: "invalid",
    }

    const result = parseAuthHeader(header)
    expect(result).toBeUndefined()
  })
})
