import * as jwt from "@/helpers/jwt"
import * as safeJson from "@/helpers/safeJson"
import { IHeader } from "@/helpers/networkHelpers"

const decodeHeaderValue = (headerValue: string) => {
  try {
    if (headerValue.startsWith("Bearer ")) {
      return jwt.decode(headerValue.substring("Bearer ".length))
    }

    return jwt.decode(headerValue)
  } catch (e) {
    return
  }
}

/**
 * Attempt to parse an auth header as a JWT
 * @param header
 * @returns
 */
const parseAuthHeader = (header: IHeader) => {
  if (!header.value) {
    return
  }

  const decodedValue = decodeHeaderValue(header.value)
  if (decodedValue) {
    return safeJson.stringify(decodedValue)
  }
}

export default parseAuthHeader
