import { useCallback, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
  parseGraphqlBody,
  getFirstGraphqlOperation,
} from '../helpers/graphqlHelpers'
import {
  onRequestFinished,
  onBeforeRequest,
  onBeforeSendHeaders,
  getHAR,
} from '../services/networkMonitor'
import {
  IIncompleteNetworkRequest,
  INetworkRequest,
  getRequestBody,
  isRequestComplete,
  matchWebAndNetworkRequest,
} from '../helpers/networkHelpers'

/**
 * Validate that a network request is a valid graphql request
 * by checking the request body for a valid graphql operation
 *
 */
const validateNetworkRequest = (details: chrome.devtools.network.Request) => {
  const body = getRequestBody(details)
  if (!body) {
    return false
  }

  const graphqlRequestBody = parseGraphqlBody(body)
  if (!graphqlRequestBody) {
    return false
  }

  const primaryOperation = getFirstGraphqlOperation(graphqlRequestBody)
  if (!primaryOperation) {
    return false
  }

  return true
}

/**
 * Produce a section of the full INetworkRequest object
 * from the details and responseBody of a chrome.devtools.network.Request
 *
 * @param details
 * @param responseBody the response body of the request.getContent callback
 */
const processNetworkRequest = (
  details: chrome.devtools.network.Request,
  responseBody: string
) => {
  return {
    status: details.response.status,
    url: details.request.url,
    time: details.time === -1 || !details.time ? 0 : details.time,
    method: details.request.method,
    response: {
      headers: details.response.headers,
      headersSize: details.response.headersSize,
      body: responseBody,
      bodySize:
        details.response.bodySize === -1
          ? details.response._transferSize || 0
          : details.response.bodySize,
    },
  }
}

export const useNetworkMonitor = (): [INetworkRequest[], () => void] => {
  const [webRequests, setWebRequests] = useState<IIncompleteNetworkRequest[]>(
    []
  )

  const handleBeforeRequest = useCallback(
    (details: chrome.webRequest.WebRequestBodyDetails) => {
      setWebRequests((webRequests) => {
        const newWebRequest: IIncompleteNetworkRequest = {
          id: details.requestId,
          status: -1,
          url: details.url,
          time: 0,
          method: details.method,
          native: {
            webRequest: details,
          },
        }

        return webRequests.concat(newWebRequest)
      })
    },
    [setWebRequests]
  )

  const handleBeforeSendHeaders = useCallback(
    (details: chrome.webRequest.WebRequestHeadersDetails) => {
      setWebRequests((webRequests) => {
        return webRequests.flatMap((webRequest) => {
          // Don't overwrite the request if it's already complete
          if (webRequest.response) {
            return webRequest
          }

          // We only want to update the request which matches on id.
          if (webRequest.id !== details.requestId) {
            return webRequest
          }

          // Now we have both the headers and the body from the webRequest api
          // we can determine if this is a graphql request.
          //
          // If it is not, we return an empty array so flatMap will remove it.
          const body = getRequestBody(
            webRequest.native.webRequest,
            details.requestHeaders || []
          )
          if (!body) {
            return []
          }

          const graphqlRequestBody = parseGraphqlBody(body)
          if (!graphqlRequestBody) {
            return []
          }

          const primaryOperation = getFirstGraphqlOperation(graphqlRequestBody)
          if (!primaryOperation) {
            return []
          }

          return {
            ...webRequest,
            request: {
              primaryOperation,
              body: graphqlRequestBody.map((requestBody) => ({
                ...requestBody,
                id: uuid(),
              })),
              bodySize: body ? body.length : 0,
              headers: details.requestHeaders,
              headersSize: (details.requestHeaders || []).reduce(
                (acc, header) =>
                  acc + header.name.length + (header.value?.length || 0),
                0
              ),
            },
          }
        })
      })
    },
    [setWebRequests]
  )

  const handleRequestFinished = useCallback(
    (details: chrome.devtools.network.Request) => {
      if (!validateNetworkRequest(details)) {
        return
      }

      details.getContent((responseBody) => {
        setWebRequests((webRequests) => {
          return webRequests.map((webRequest) => {
            // Don't overwrite the request if it's already complete
            if (webRequest.response) {
              return webRequest
            }

            const isMatch = matchWebAndNetworkRequest(
              details,
              webRequest.native?.webRequest,
              webRequest.request?.headers || []
            )
            if (!isMatch) {
              return webRequest
            }

            return {
              ...webRequest,
              id: webRequest.id,
              ...processNetworkRequest(details, responseBody),
            }
          })
        })
      })
    },
    [setWebRequests]
  )

  const handleHAREntries = useCallback(
    async (entries: chrome.devtools.network.Request[]) => {
      const validEntries = entries.filter((details) => {
        return 'getContent' in details && validateNetworkRequest(details)
      })

      const entriesWithContent = await Promise.all(
        validEntries.map((details) => {
          return new Promise<INetworkRequest>((resolve) => {
            details.getContent((responseBody) => {
              const body = getRequestBody(details)
              if (!body) {
                return
              }

              const graphqlRequestBody = parseGraphqlBody(body)
              if (!graphqlRequestBody) {
                return
              }

              const primaryOperation =
                getFirstGraphqlOperation(graphqlRequestBody)
              if (!primaryOperation) {
                return
              }

              resolve({
                id: uuid(),
                ...processNetworkRequest(details, responseBody),
                request: {
                  primaryOperation,
                  body: graphqlRequestBody.map((requestBody) => ({
                    ...requestBody,
                    id: uuid(),
                  })),
                  bodySize: body ? body.length : 0,
                  headers: details.request.headers,
                  headersSize: details.request.headersSize,
                },
                native: {
                  webRequest: {} as any,
                },
              })
            })
          })
        })
      )

      setWebRequests(entriesWithContent)
    },
    [setWebRequests]
  )

  const clearWebRequests = useCallback(() => {
    setWebRequests([])
  }, [setWebRequests])

  // Collect historic network data in case any events fired before we started listening
  useEffect(() => {
    const fetchHistoricWebRequests = async () => {
      const HARLog = await getHAR()
      handleHAREntries(HARLog.entries as chrome.devtools.network.Request[])
    }

    clearWebRequests()
    fetchHistoricWebRequests()
  }, [handleHAREntries, clearWebRequests])

  // Setup listeners for network data
  useEffect(() => {
    return onBeforeRequest(handleBeforeRequest)
  }, [handleBeforeRequest])

  useEffect(() => {
    return onBeforeSendHeaders(handleBeforeSendHeaders)
  }, [handleBeforeSendHeaders])

  useEffect(() => {
    return onRequestFinished(handleRequestFinished)
  }, [handleRequestFinished])

  // Only return complete networkRequests.
  const completeWebRequests = webRequests.filter(isRequestComplete)

  // @ts-ignore
  return [completeWebRequests, clearWebRequests] as const
}
