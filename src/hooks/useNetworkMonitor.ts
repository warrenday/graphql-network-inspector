import { useCallback, useEffect, useState } from "react"
import { v4 as uuid } from "uuid"
import {
  getPrimaryOperation,
  parseGraphqlRequest,
  IOperationDetails,
  IGraphqlRequestBody,
} from "../helpers/graphqlHelpers"
import {
  onRequestFinished,
  onBeforeRequest,
  onBeforeSendHeaders,
  getHAR,
} from "../services/networkMonitor"
import mergeBy from "mergeby"

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
}

// Ephemeral interface to allow us to build a network request
// from the various events that fire. We'll ensure the request is complete
// and populated before we output from the useNetworkMonitor hook.
interface IIncompleteNetworkRequest extends Omit<INetworkRequest, "request"> {
  request?: Partial<INetworkRequest["request"]>
}

const isComplete = (
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
      const rawBody = details.requestBody?.raw?.[0]?.bytes
      const decoder = new TextDecoder("utf-8")
      const body = rawBody ? decoder.decode(rawBody) : undefined
      // TODO i think there is different encoding if it is a form data request
      // so we need to test and handle.

      const primaryOperation = getPrimaryOperation(details)
      if (!primaryOperation) {
        return
      }

      const graphqlRequestBody = parseGraphqlRequest(details)
      if (!graphqlRequestBody) {
        return
      }

      setWebRequests((webRequests) => {
        const matchingWebRequestIndex = webRequests.findIndex(
          (webRequest) => webRequest.id === details.requestId
        )

        // id: details.requestId,
        // status: 0,
        // url: details.url,
        // time: 0,
        // method: details.method,

        const newWebRequest: Partial<IIncompleteNetworkRequest> = {
          request: {
            primaryOperation,
            body: graphqlRequestBody.map((requestBody) => ({
              id: uuid(),
              ...requestBody,
            })),
            bodySize: body ? body.length : 0,
          },
        }

        if (matchingWebRequestIndex) {
          return webRequests.map((webRequest, index) => {
            if (index !== matchingWebRequestIndex) {
              return webRequest
            }
            return {
              ...webRequest,
              request: {
                ...webRequest.request,
                newWebRequest,
              },
            }
          })
        } else {
          return webRequests.concat(newWebRequest)
        }
      })
    },
    [setWebRequests]
  )

  const handleBeforeSendHeaders = useCallback(
    (details: chrome.webRequest.WebRequestHeadersDetails) => {
      setWebRequests((webRequests) => {
        return mergeBy(
          webRequests,
          {
            id: details.requestId,
            request: {
              headers: details.requestHeaders,
              headersSize: (details.requestHeaders || []).reduce(
                (acc, header) =>
                  acc + header.name.length + (header.value?.length || 0),
                0
              ),
            },
          },
          "id",
          true
        )
      })
    },
    [setWebRequests]
  )

  const handleRequestFinished = useCallback(
    (details: chrome.devtools.network.Request) => {
      const primaryOperation = getPrimaryOperation(details)

      if (!primaryOperation) {
        return
      }

      const requestId = uuid()
      const graphqlRequestBody = parseGraphqlRequest(details)

      if (!graphqlRequestBody) {
        return
      }

      setWebRequests((webRequests) =>
        webRequests.concat({
          id: requestId,
          status: details.response.status,
          url: details.request.url,
          time: details.time === -1 || !details.time ? 0 : details.time,
          method: details.request.method,
          request: {
            primaryOperation,
            headers: details.request.headers,
            body: graphqlRequestBody.map((requestBody) => ({
              id: uuid(),
              ...requestBody,
            })),
            headersSize: details.request.headersSize,
            bodySize: details.request.bodySize,
          },
          response: {
            headers: details.response.headers,
            headersSize: details.response.headersSize,
            bodySize:
              details.response.bodySize === -1
                ? details.response._transferSize || 0
                : details.response.bodySize,
          },
        })
      )

      details.getContent((responseBody) => {
        setWebRequests((webRequests) => {
          return webRequests.map((webRequest) => {
            if (webRequest.id !== requestId) {
              return webRequest
            }
            return {
              ...webRequest,
              response: {
                ...webRequest.response,
                body: responseBody || "",
              },
            } as INetworkRequest
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
  const completeWebRequests = webRequests.filter(isComplete)

  return [completeWebRequests, clearWebRequests] as const
}
