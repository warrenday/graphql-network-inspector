import { IGraphqlRequestBody, IOperationDetails } from './graphqlHelpers'
import decodeQueryParam from './decodeQueryParam'
import { parse } from './safeJson'
import { decompress, CompressionType } from './gzip'

export interface IHeader {
  name: string
  value?: string
}

export interface IResponseChunk {
  body: string
  timestamp: number
  isIncremental: boolean
}

export interface ICompleteNetworkRequest {
  id: string
  url: string
  method: string
  status: number
  time: number
  request: {
    primaryOperation: IOperationDetails
    headers: IHeader[]
    headersSize: number
    body: IGraphqlRequestBody[]
    bodySize: number
  }
  response?: {
    headers: IHeader[]
    headersSize: number
    body: string
    bodySize: number
    chunks?: IResponseChunk[]  // For incremental responses
    isStreaming?: boolean
  }
  native: {
    networkRequest?: chrome.devtools.network.Request
    webRequest?: chrome.webRequest.WebRequestBodyDetails
  }
}

/**
 * Ephemeral interface to allow us to build a network request
 * from the various events that fire. We'll ensure the request is complete
 * and populated before we output from the useNetworkMonitor hook.
 * */
export interface IIncompleteNetworkRequest
  extends Omit<ICompleteNetworkRequest, 'request'> {
  request?: Partial<ICompleteNetworkRequest['request']>
}

/**
 * Check if a url ends with a file extension
 *
 * @param url the url to check
 * @returns true if the url ends with a file extension (e.g. .js, .css, .png)
 */
export const urlHasFileExtension = (url: string): boolean => {
  // Try to parse the url as a URL object
  try {
    const urlObject = new URL(url)
    if (urlObject.pathname.includes('.')) {
      return true
    } else {
      return false
    }
  } catch (e) {
    // noop
  }

  // If parsing fails, just check the last part of the url
  const urlParts = url.split('/')
  const lastPart = urlParts[urlParts.length - 1]
  return lastPart.includes('.')
}

/**
 * Determine if the details object is a network request
 * or a web request.
 *
 * This is necessary because the two apis have different
 * structures, we use each api to detect the start and end
 * of a request.
 *
 * @param details the details object to check
 * @returns true if the object is a network request
 */
const isNetworkRequest = (
  details:
    | chrome.devtools.network.Request
    | chrome.webRequest.WebRequestBodyDetails
): details is chrome.devtools.network.Request => {
  return 'response' in details
}

/**
 * Determine if a request payload is complete
 * by checking all required fields are present.
 *
 * The request is built up from two events, so we need
 * to confirm when all data is ready.
 *
 * This only checks the request part, it does not check
 * if the response is complete.
 */
export const isRequestComplete = (
  networkRequest: IIncompleteNetworkRequest
): networkRequest is ICompleteNetworkRequest => {
  return (
    networkRequest.request !== undefined &&
    networkRequest.request.headers !== undefined &&
    networkRequest.request.body !== undefined
  )
}

/**
 * Detect the compression type based on the content-encoding header.
 *
 * @param headers all request headers
 * @returns the compression type if detected
 */
const detectCompressionType = (
  headers: IHeader[]
): CompressionType | undefined => {
  const contentEncodingHeader = headers.find(
    (header) => header.name.toLowerCase() === 'content-encoding'
  )

  if (!contentEncodingHeader) {
    return
  }

  if (contentEncodingHeader.value === 'gzip') {
    return 'gzip'
  }

  if (contentEncodingHeader.value === 'deflate') {
    return 'deflate'
  }
}

/**
 * Decode the raw request body into a string
 */
const decodeRawBody = async (
  raw: chrome.webRequest.UploadData[] | string,
  compressionType?: CompressionType
): Promise<string> => {
  // If the body is compressed, decompress it
  if (compressionType) {
    return decompress(raw, compressionType).then((res) => {
      const decoder = new TextDecoder('utf-8')
      return decoder.decode(res)
    })
  }

  if (typeof raw === 'string') {
    // If we have a plain string, just return it, it is already
    // decoded
    return raw
  } else {
    // Decode the raw bytes into a string
    const decoder = new TextDecoder('utf-8')
    return raw.map((data) => decoder.decode(data.bytes)).join('')
  }
}

/**
 * Get the boundary value from the content-type header
 * of a multipart/form-data request.
 *
 * @param headers the headers to check
 * @returns the boundary value
 */
const getMultipartFormDataBoundary = (
  headers: IHeader[]
): string | undefined => {
  const contentType = headers.find(
    (header) => header.name.toLowerCase() === 'content-type'
  )?.value
  if (!contentType) {
    return
  }

  const boundary = contentType.split('boundary=')[1]
  const isMultipart = contentType.includes('multipart/form-data')
  if (!isMultipart || typeof boundary !== 'string') {
    return
  }

  return boundary
}

/**
 * Parse a multipart/form-data request payload
 * and return a map of the form data.
 *
 * Here is an example form data payload:
 *
 * ```text
 * -----------------------------7da24f2e50046
 * Content-Disposition: form-data; name="operations"
 *
 * {"query":"mutation($file: Upload!) { uploadFile(file: $file) { id } }","variables":{"file":null}}
 * -----------------------------7da24f2e50046
 * Content-Disposition: form-data; name="map"
 *
 * {"0":["variables.file"]}
 * -----------------------------7da24f2e50046
 * ```
 *
 * @param boundary boundary value of the multipart/form-data content-type header
 * @param formDataString the form data request payload
 * @returns
 */
export const getRequestBodyFromMultipartFormData = (
  boundary: string,
  formDataString: string
): IGraphqlRequestBody => {
  // Split on the form boundary
  const parts = formDataString.split(boundary)
  const result: Record<string, any> = {}

  // Process each part
  for (const part of parts) {
    // Trim and remove trailing dashes
    const trimmedPart = part.trim().replace(/-+$/, '')

    // Ignore empty parts
    if (trimmedPart === '' || trimmedPart === '--') {
      continue
    }

    // Extract the header and body
    const [header, ...bodyParts] = trimmedPart.split('\n')
    const body = bodyParts.join('\n').trim()

    // Extract the name from the header
    const nameMatch = header.match(/name="([^"]*)"/)
    if (!nameMatch) {
      continue
    }

    const name = nameMatch[1]
    try {
      result[name] = JSON.parse(body.replace(/\n/g, ''))
    } catch (e) {
      // noop
    }
  }

  if (!result.operations.query) {
    throw new Error('Could not parse request body from multipart/form-data')
  }

  return {
    query: result.operations.query,
    operationName: result.operations.operationName,
    variables: result.operations.variables,
  }
}

/**
 * For requests sent via GET, the request body is encoded in the URL.
 * This function will parse the URL and return the request body as
 * if it were a POST request.
 *
 * Keeping a consistent interface for the request body allows us to
 * treat all requests the same way.
 *
 * @param url the URL to parse
 * @returns the request body
 */
export const getRequestBodyFromUrl = (url: string): IGraphqlRequestBody => {
  const urlObj = new URL(url)
  const query = urlObj.searchParams.get('query')
  const variables = urlObj.searchParams.get('variables')
  const operationName = urlObj.searchParams.get('operationName')
  const extensions = urlObj.searchParams.get('extensions')

  const decodedQuery = query ? decodeQueryParam(query) : undefined
  const decodedVariables = variables ? decodeQueryParam(variables) : undefined
  const decodedOperationName = operationName
    ? decodeQueryParam(operationName)
    : undefined
  const decodedExtensions = extensions
    ? decodeQueryParam(extensions)
    : undefined

  if (decodedQuery) {
    return {
      query: decodedQuery,
      operationName: decodedOperationName,
      variables: decodedVariables ? JSON.parse(decodedVariables) : undefined,
    }
  }

  // If not query found, check for persisted query
  const persistedQuery = parse<{ persistedQuery: boolean }>(
    decodedExtensions
  )?.persistedQuery
  if (persistedQuery) {
    return {
      query: '',
      operationName: operationName ?? '',
      extensions: decodedExtensions ? JSON.parse(decodedExtensions) : undefined,
      variables: decodedVariables ? JSON.parse(decodedVariables) : undefined,
    }
  }

  throw new Error('Could not parse request body from URL')
}

const getRequestBodyFromWebRequestBodyDetails = async (
  details: chrome.webRequest.WebRequestBodyDetails | null,
  headers: IHeader[]
): Promise<string | undefined> => {
  if (!details) return undefined

  if (details.method === 'GET') {
    const body = getRequestBodyFromUrl(details.url)
    return JSON.stringify(body)
  }

  const compressionType = detectCompressionType(headers)
  const body = await decodeRawBody(
    details.requestBody?.raw || [],
    compressionType
  )
  const boundary = getMultipartFormDataBoundary(headers)

  if (boundary && body) {
    const res = getRequestBodyFromMultipartFormData(boundary, body)
    return JSON.stringify(res)
  }

  return body
}

const getRequestBodyFromNetworkRequest = async (
  details: chrome.devtools.network.Request
): Promise<string | undefined> => {
  if (details.request.method === 'GET') {
    const body = getRequestBodyFromUrl(details.request.url)
    return JSON.stringify(body)
  }

  const compressionType = detectCompressionType(details.request.headers)
  const body = await decodeRawBody(
    details.request.postData?.text || '',
    compressionType
  )

  const boundary = getMultipartFormDataBoundary(details.request.headers)
  if (boundary && body) {
    const res = getRequestBodyFromMultipartFormData(boundary, body)
    return JSON.stringify(res)
  }

  return body
}

export const getRequestBody = async <
  T extends
    | chrome.devtools.network.Request
    | chrome.webRequest.WebRequestBodyDetails
    | undefined
>(
  details: T,
  ...headers: T extends chrome.webRequest.WebRequestBodyDetails
    ? [IHeader[]]
    : []
): Promise<string | undefined> => {
  if (!details) return undefined

  try {
    if (isNetworkRequest(details)) {
      return getRequestBodyFromNetworkRequest(details)
    } else {
      return getRequestBodyFromWebRequestBodyDetails(details, headers[0] || [])
    }
  } catch (e) {
    return undefined
  }
}

/**
 * In order to detect when a request is both starting and ending we
 * need to use different apis. The webRequest api is used to detect when
 * a request is starting and the network api is used to detect when a request
 * is ending. This function will match the two requests together.
 *
 * We do this by comparing various fields such as method, url, and body since
 * no stable id is available to us.
 *
 */
export const matchWebAndNetworkRequest = async (
  details: chrome.devtools.network.Request,
  webRequest: chrome.webRequest.WebRequestBodyDetails | null,
  headers: IHeader[]
): Promise<boolean> => {
  try {
    const webRequestBody = await getRequestBodyFromWebRequestBodyDetails(
      webRequest,
      headers
    )
    const networkRequestBody = await getRequestBodyFromNetworkRequest(details)

    const isMethodMatch = details.request.method === webRequest?.method
    const isBodyMatch = webRequestBody === networkRequestBody
    const isUrlMatch = details.request.url === webRequest?.url

    return isMethodMatch && isBodyMatch && isUrlMatch
  } catch (e) {
    return false
  }
}

/**
 * Check if a response is multipart/mixed (used for @defer/@stream).
 *
 * GraphQL servers use multipart/mixed content type to stream incremental
 * responses for @defer and @stream directives. Each part contains a JSON
 * payload that should be merged into the final response.
 *
 * @param headers - Array of response headers to check
 * @returns true if the Content-Type header indicates multipart/mixed
 */
export const isMultipartMixedResponse = (headers: IHeader[]): boolean => {
  const contentType = headers.find(
    (header) => header.name.toLowerCase() === 'content-type'
  )?.value
  return contentType?.includes('multipart/mixed') || false
}

/**
 * Extract the boundary from a multipart/mixed content-type header.
 *
 * The boundary is used to separate individual parts in a multipart response.
 * It can be quoted or unquoted in the Content-Type header.
 *
 * @example
 * // Content-Type: multipart/mixed; boundary="graphql"
 * getMultipartMixedBoundary(headers) // returns "graphql"
 *
 * @param headers - Array of response headers
 * @returns The boundary string, or undefined if not found
 */
export const getMultipartMixedBoundary = (
  headers: IHeader[]
): string | undefined => {
  const contentType = headers.find(
    (header) => header.name.toLowerCase() === 'content-type'
  )?.value

  if (!contentType || !contentType.includes('multipart/mixed')) {
    return undefined
  }

  const boundaryMatch = contentType.match(/boundary="?([^";,]+)"?/)
  return boundaryMatch ? boundaryMatch[1] : undefined
}

/**
 * Parse a multipart/mixed response body into individual chunks.
 *
 * This function handles the multipart/mixed format used by GraphQL servers
 * implementing @defer and @stream directives (as per the GraphQL-over-HTTP spec).
 *
 * Each part in the multipart response contains:
 * 1. MIME headers (typically Content-Type: application/json)
 * 2. A blank line separator
 * 3. The JSON payload body
 *
 * The first chunk is the initial response, and subsequent chunks are
 * incremental updates that should be merged into the initial response.
 *
 * @example
 * // Example multipart body:
 * // --graphql
 * // Content-Type: application/json
 * //
 * // {"data":{"user":{"id":"1"}},"hasNext":true}
 * // --graphql
 * // Content-Type: application/json
 * //
 * // {"incremental":[{"data":{"name":"John"},"path":["user"]}],"hasNext":false}
 * // --graphql--
 *
 * @param body - The raw multipart response body string
 * @param boundary - The boundary string from the Content-Type header
 * @returns Array of parsed response chunks
 */
export const parseMultipartMixedResponse = (
  body: string,
  boundary: string
): IResponseChunk[] => {
  const chunks: IResponseChunk[] = []
  const delimiter = `--${boundary}`

  // Split by boundary and process each part
  const parts = body.split(delimiter)

  for (const part of parts) {
    // Skip empty parts and closing boundary
    if (!part.trim() || part.trim() === '--') {
      continue
    }

    // Normalize line endings to \n
    const normalizedPart = part.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    // Find the double newline that separates headers from body
    const headerBodySeparator = '\n\n'
    const separatorIndex = normalizedPart.indexOf(headerBodySeparator)

    if (separatorIndex !== -1) {
      // Extract everything after the separator (the JSON body)
      const chunkBody = normalizedPart.substring(separatorIndex + headerBodySeparator.length).trim()

      if (chunkBody) {
        chunks.push({
          body: chunkBody,
          timestamp: Date.now(), // Placeholder timestamp (not displayed)
          isIncremental: chunks.length > 0, // First chunk is initial, rest are incremental
        })
      }
    }
  }

  return chunks
}
