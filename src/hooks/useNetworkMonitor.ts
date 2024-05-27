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

          if (webRequest.id !== details.requestId) {
            return webRequest
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
      const body = getRequestBody(details)
      if (!body) {
        return
      }

      const graphqlRequestBody = parseGraphqlBody(body)
      if (!graphqlRequestBody) {
        return
      }

      const primaryOperation = getFirstGraphqlOperation(graphqlRequestBody)
      if (!primaryOperation) {
        return
      }

      details.getContent((responseBody) => {
        setWebRequests((webRequests) => {
          return webRequests.map((webRequest) => {
            const isMatch = matchWebAndNetworkRequest(
              webRequest.native?.webRequest,
              details
            )
            if (!isMatch) {
              return webRequest
            }

            return {
              ...webRequest,
              id: webRequest.id,
              status: details.response.status,
              url: details.request.url,
              time: details.time === -1 || !details.time ? 0 : details.time,
              method: details.request.method,
              response: {
                headers: details.response.headers,
                headersSize: details.response.headersSize,
                bodySize:
                  details.response.bodySize === -1
                    ? details.response._transferSize || 0
                    : details.response.bodySize,
                body: responseBody,
              },
            }
          })
        })
      })
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
      for (const entry of HARLog.entries) {
        if ('getContent' in entry) {
          handleRequestFinished(entry as chrome.devtools.network.Request)
        }
      }
    }

    clearWebRequests()
    fetchHistoricWebRequests()
  }, [handleRequestFinished, clearWebRequests])

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
