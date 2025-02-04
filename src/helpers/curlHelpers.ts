import { ICompleteNetworkRequest, IHeader } from './networkHelpers'

interface ICurlOptions {
  compressed?: boolean
  method?: string
  includeContentType?: boolean
}

/**
 * Safely escapes string values for use in cURL commands
 * @param value - The string value to escape
 * @returns The escaped string
 */
const escapeCurlValue = (value: string | undefined): string => {
  if (!value) return ''
  return value.replace(/'/g, "'\\''")
}

/**
 * Formats a single header for use in a cURL command
 * @param header - The header object containing name and value
 * @returns Formatted header string for cURL
 */
const formatHeader = (header: IHeader): string => {
  const escapedValue = escapeCurlValue(header.value)
  return `-H '${header.name}: ${escapedValue}'`
}

/**
 * Formats the request body for use in a cURL command
 * @param body - The request body to format
 * @returns Formatted and escaped JSON string
 */
const formatRequestBody = (body: unknown): string => {
  const stringified = JSON.stringify(body)
  return escapeCurlValue(stringified)
}

/**
 * Generates a cURL command from a network request
 * @param request - The network request to convert to cURL
 * @param options - Optional configuration for the cURL command
 * @returns Formatted cURL command string
 */
export const generateCurlCommand = (
  request: ICompleteNetworkRequest,
  options: ICurlOptions = {}
): string => {
  const {
    compressed = true,
    method = request.method || 'POST',
    includeContentType = true,
  } = options

  // Build headers array
  const headers = request.request.headers.map(formatHeader)

  // Add content-type if needed
  if (
    includeContentType &&
    !headers.some((h) => h.toLowerCase().includes('content-type:'))
  ) {
    headers.push(`-H 'Content-Type: application/json'`)
  }

  // Format the body
  const body =
    request.request.body.length === 1
      ? request.request.body[0]
      : request.request.body

  // Build the cURL command parts
  const parts = [
    'curl',
    `'${escapeCurlValue(request.url)}'`,
    `-X ${method}`,
    ...headers,
  ]

  // Add body for POST/PUT methods
  if (['POST', 'PUT'].includes(method.toUpperCase())) {
    parts.push(`--data-raw '${formatRequestBody(body)}'`)
  }

  // Add compression flag if needed
  if (compressed) {
    parts.push('--compressed')
  }

  return parts.join(' \\\n  ')
}
