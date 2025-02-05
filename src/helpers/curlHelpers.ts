/**
 * Gets cURL command for a network request
 * @param request - The complete network request data
 * @returns Promise that resolves to the cURL command string
 */

import { ICompleteNetworkRequest } from './networkHelpers'

export const getNetworkCurl = async (
  request: ICompleteNetworkRequest
): Promise<string> => {
  const chromeRequest = request.native.networkRequest
  if (!chromeRequest) {
    console.warn('No Chrome request data available')
    return ''
  }

  const parts: string[] = []

  // Start with curl and URL
  parts.push(`curl '${chromeRequest.request.url}'`)

  // Add headers exactly as Chrome provides them
  chromeRequest.request.headers.forEach((header) => {
    parts.push(`-H '${header.name}: ${header.value}'`)
  })

  // Add method if not GET
  if (chromeRequest.request.method !== 'GET') {
    parts.push(`-X ${chromeRequest.request.method}`)
  }

  // Add body with proper escaping like Chrome
  if (chromeRequest.request.postData?.text) {
    try {
      // Parse and re-stringify to normalize the JSON
      const body = JSON.parse(chromeRequest.request.postData.text)
      const formattedBody = JSON.stringify(body)
        .replace(/'/g, "\\'")
        .replace(/\n/g, '') // Remove all newlines
      parts.push(`--data-raw $'${formattedBody}'`)
    } catch {
      // If not valid JSON, use raw text
      const formattedBody = chromeRequest.request.postData.text
        .replace(/'/g, "\\'")
        .replace(/\n/g, '') // Remove all newlines
      parts.push(`--data-raw $'${formattedBody}'`)
    }
  }

  // Join with proper spacing and line continuation
  return parts.join(' \\\n  ') // 2 spaces like Chrome
}
