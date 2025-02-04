/**
 * Gets cURL command for a network request using Chrome's DevTools API
 * @param requestId - The ID of the network request
 * @param request - The complete network request data
 * @returns Promise that resolves to the cURL command string
 */

import { ICompleteNetworkRequest } from './networkHelpers'

export const getChromeNetworkCurl = async (
  requestId: string,
  request: ICompleteNetworkRequest
): Promise<string> => {
  // Build cURL command from request data
  const parts = ['curl']

  // Add URL
  parts.push(`'${request.url}'`)

  // Add method
  parts.push(`-X ${request.method}`)

  // Add headers
  request.request.headers.forEach((header) => {
    parts.push(`-H '${header.name}: ${header.value}'`)
  })

  // Add body
  if (request.request.body.length > 0) {
    parts.push(`--data-raw '${JSON.stringify(request.request.body[0])}'`)
  }

  return parts.join(' \\\n  ')
}
