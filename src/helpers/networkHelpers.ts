import { IGraphqlRequestBody, IOperationDetails } from './graphqlHelpers'
import decodeQueryParam from './decodeQueryParam'
import { parse } from './safeJson'

export interface IHeader {
  name: string
  value?: string
}

export interface INetworkRequest {
  id: string
  status: number
  url: string
  time: number
  method: string
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
  }
  native: {
    webRequest: chrome.webRequest.WebRequestBodyDetails
    networkRequest?: chrome.devtools.network.Request
  }
}

/**
 * Ephemeral interface to allow us to build a network request
 * from the various events that fire. We'll ensure the request is complete
 * and populated before we output from the useNetworkMonitor hook.
 * */
export interface IIncompleteNetworkRequest
  extends Omit<INetworkRequest, 'request'> {
  request?: Partial<INetworkRequest['request']>
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
 */
export const isRequestComplete = (
  networkRequest: IIncompleteNetworkRequest
): networkRequest is INetworkRequest => {
  return (
    networkRequest.request !== undefined &&
    networkRequest.request.headers !== undefined &&
    networkRequest.request.body !== undefined
  )
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
    (header) => header.name === 'content-type'
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
  const result: Record<string, string> = {}

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

  if (!result.query) {
    throw new Error('Could not parse request body from multipart/form-data')
  }

  return {
    id: result.id,
    query: result.query,
    operationName: result.operationName,
    variables: result.variables ? JSON.parse(result.variables) : undefined,
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
      id: 'TODO',
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
      id: 'TODO',
      query: '',
      extensions: decodedExtensions ? JSON.parse(decodedExtensions) : undefined,
      variables: decodedVariables ? JSON.parse(decodedVariables) : undefined,
    }
  }

  throw new Error('Could not parse request body from URL')
}

const getRequestBodyFromWebRequestBodyDetails = (
  details: chrome.webRequest.WebRequestBodyDetails,
  headers: IHeader[]
): string | undefined => {
  if (details.method === 'GET') {
    const body = getRequestBodyFromUrl(details.url)
    return JSON.stringify(body)
  }

  const rawBody = details.requestBody?.raw?.[0]?.bytes
  const decoder = new TextDecoder('utf-8')
  const body = rawBody ? decoder.decode(rawBody) : undefined

  const boundary = getMultipartFormDataBoundary(headers)
  if (boundary && body) {
    const res = getRequestBodyFromMultipartFormData(boundary, body)
    return JSON.stringify(res)
  }

  return body
}

const getRequestBodyFromNetworkRequest = (
  details: chrome.devtools.network.Request
): string | undefined => {
  if (details.request.method === 'GET') {
    const body = getRequestBodyFromUrl(details.request.url)
    return JSON.stringify(body)
  }

  const body = details.request.postData?.text

  const boundary = getMultipartFormDataBoundary(details.request.headers)
  if (boundary && body) {
    const res = getRequestBodyFromMultipartFormData(boundary, body)
    return JSON.stringify(res)
  }

  return body
}

export const getRequestBody = <
  T extends
    | chrome.devtools.network.Request
    | chrome.webRequest.WebRequestBodyDetails
>(
  details: T,
  ...headers: T extends chrome.webRequest.WebRequestBodyDetails
    ? [IHeader[]]
    : []
): string | undefined => {
  try {
    if (isNetworkRequest(details)) {
      return getRequestBodyFromNetworkRequest(details)
    } else {
      return getRequestBodyFromWebRequestBodyDetails(
        details,
        headers as IHeader[]
      )
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
export const matchWebAndNetworkRequest = (
  networkRequest: chrome.devtools.network.Request,
  webRequest: chrome.webRequest.WebRequestBodyDetails,
  webRequestHeaders: IHeader[]
): boolean => {
  const webRequestBody = getRequestBodyFromWebRequestBodyDetails(
    webRequest,
    webRequestHeaders
  )
  const networkRequestBody = getRequestBodyFromNetworkRequest(networkRequest)

  const isMethodMatch = webRequest.method === networkRequest.request.method
  const isBodyMatch = webRequestBody === networkRequestBody
  const isUrlMatch = webRequest.url === networkRequest.request.url

  return isMethodMatch && isBodyMatch && isUrlMatch
}
