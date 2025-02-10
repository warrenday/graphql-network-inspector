/**
 * Formats request body with proper escaping and unicode handling
 * @param text - Raw request body text
 * @returns Formatted body string with proper escaping
 */
const formatBody = (text: string): string => {
  // Handle multipart form data
  if (text.includes('Content-Type: multipart/form-data')) {
    return text
      .split('\r\n')
      .map((line) => line.replace(/'/g, "'\\''"))
      .join('\\r\\n')
  }

  // Handle binary data using character codes
  const hasBinaryData = Array.from(text).some((char) => {
    const code = char.charCodeAt(0)
    return code <= 8 || (code >= 14 && code <= 31)
  })

  if (hasBinaryData) {
    return Buffer.from(text).toString('base64')
  }

  // Normal JSON handling
  try {
    const body = JSON.parse(text)
    return JSON.stringify(body).replace(
      /[^\x20-\x7E]/g,
      (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
    )
  } catch {
    return text
  }
}

/**
 * Generates a cURL command from a network request
 * Matches Chrome DevTools cURL format including:
 * - Header filtering (excludes pseudo headers)
 * - Unicode escaping
 * - Proper quoting and line continuation
 *
 * @example
 * ```typescript
 * const curl = await getNetworkCurl(request)
 * // curl 'https://api.example.com/graphql' \
 * //   -H 'content-type: application/json' \
 * //   --data-raw $'{"query":"query { test }"}'
 * ```
 */
import { ICompleteNetworkRequest } from './networkHelpers'

// Headers that Chrome DevTools excludes
const EXCLUDED_HEADERS = [
  ':authority',
  ':method',
  ':path',
  ':scheme',
  'content-length',
  'accept-encoding',
]

export const getNetworkCurl = async (
  request: ICompleteNetworkRequest
): Promise<string> => {
  // Use Chrome's network request data for cURL generation
  const chromeRequest = request.native.networkRequest
  if (!chromeRequest) {
    console.warn('No Chrome request data available')
    return ''
  }

  const parts: string[] = []

  // Start with curl and URL
  parts.push(`curl '${chromeRequest.request.url}'`)

  // Add headers, filtering out excluded ones
  chromeRequest.request.headers
    .filter((header) => !EXCLUDED_HEADERS.includes(header.name.toLowerCase()))
    .forEach((header) => {
      parts.push(`-H '${header.name}: ${header.value}'`)
    })

  // Add method if not GET
  if (chromeRequest.request.method !== 'GET') {
    parts.push(`-X ${chromeRequest.request.method}`)
  }

  // Add body with proper escaping
  if (chromeRequest.request.postData?.text) {
    const formattedBody = formatBody(chromeRequest.request.postData.text)
    parts.push(`--data-raw $'${formattedBody}'`)
  }

  return parts.join(' \\\n  ')
}
