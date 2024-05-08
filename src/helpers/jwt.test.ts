import * as jwt from "./jwt"

describe("jwt.decodeJWT", () => {
  it("decodes a JWT token", () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

    const decoded = jwt.decode(token)

    expect(decoded).toEqual({
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022,
    })
  })

  it("fails to decode an invalid JWT token", () => {
    const token = "not-a-token"

    try {
      jwt.decode(token)
    } catch (error) {
      expect((error as Error).message).toBe("Invalid token")
    }
  })
})
