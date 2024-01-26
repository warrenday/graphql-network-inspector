import { useCallback, useEffect, useState } from "react"
import { v4 as uuid } from "uuid"
import {
  IOperationDetails,
  IGraphqlRequestBody,
  parseGraphqlBody,
  getFirstGraphqlOperation,
} from "../helpers/graphqlHelpers"
import {
  onRequestFinished,
  onBeforeRequest,
  onBeforeSendHeaders,
  getHAR,
} from "../services/networkMonitor"
import {
  getRequestBody,
  matchWebAndNetworkRequest,
} from "../helpers/networkHelpers"

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

// Ephemeral interface to allow us to build a network request
// from the various events that fire. We'll ensure the request is complete
// and populated before we output from the useNetworkMonitor hook.
interface IIncompleteNetworkRequest extends Omit<INetworkRequest, "request"> {
  request?: Partial<INetworkRequest["request"]>
}

const isRequestComplete = (
  networkRequest: IIncompleteNetworkRequest
): networkRequest is INetworkRequest => {
  return (
    networkRequest.request !== undefined &&
    networkRequest.request.headers !== undefined &&
    networkRequest.request.body !== undefined
  )
}

export const useNetworkMonitor = (): [INetworkRequest[], () => void] => {
  const [webRequests, setWebRequests] = useState<IIncompleteNetworkRequest[]>(
    []
  )

  const handleBeforeRequest = useCallback(
    (details: chrome.webRequest.WebRequestBodyDetails) => {
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

      setWebRequests((webRequests) => {
        const newWebRequest: IIncompleteNetworkRequest = {
          id: details.requestId,
          status: 0,
          url: details.url,
          time: 0,
          method: details.method,
          request: {
            primaryOperation,
            body: graphqlRequestBody.map((requestBody) => ({
              ...requestBody,
              id: uuid(),
            })),
            bodySize: body ? body.length : 0,
          },
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
        return webRequests.map((webRequest) => {
          if (webRequest.id !== details.requestId) {
            return webRequest
          }

          return {
            ...webRequest,
            request: {
              ...webRequest.request,
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
        if ("getContent" in entry) {
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
