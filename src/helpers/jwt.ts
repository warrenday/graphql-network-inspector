/**
 * Decode a JWT
 * @param token the JWT token
 * @returns the decoded JWT data
 */
const decode = (token: string) => {
  try {
    const base64Url = token.split(".")[1] // Get the payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/") // Convert to base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join("")
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export { decode }
