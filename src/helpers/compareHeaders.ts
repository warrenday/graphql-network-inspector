import type { IHeader } from './networkHelpers'

/**
 * Compare all headers and ensure an exact match
 * @param headers
 * @param expectedHeaders
 */
const compareHeaders = (
  headers: IHeader[],
  expectedHeaders: IHeader[]
): boolean => {
  if (headers.length !== expectedHeaders.length) {
    return false
  }

  for (let i = 0; i < headers.length; i++) {
    if (headers[i].name !== expectedHeaders[i].name) {
      return false
    }

    if (headers[i].value !== expectedHeaders[i].value) {
      return false
    }
  }

  return true
}

export default compareHeaders
