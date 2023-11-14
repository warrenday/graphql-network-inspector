import { useCallback, useEffect, useState } from "react"
import { v4 as uuid } from "uuid"
import {
  getPrimaryOperation,
  parseGraphqlRequest,
  IOperationDetails,
  IGraphqlRequestBody,
} from "../helpers/graphqlHelpers"
import { onRequestFinished, getHAR } from "../services/networkMonitor"

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
    body: IGraphqlRequestBody[]
    headersSize: number
    bodySize: number
  }
  response?: {
    headers?: IHeader[]
    body?: string
    headersSize: number
    bodySize: number
  }
}

export const useNetworkMonitor = () => {
  const [webRequests, setWebRequests] = useState<INetworkRequest[]>([])

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
            body: graphqlRequestBody.map((request) => ({
              id: uuid(),
              ...request,
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

  const clearWebRequests = () => {
    setWebRequests([])
  }

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
  }, [handleRequestFinished])

  useEffect(() => {
    return onRequestFinished(handleRequestFinished)
  }, [handleRequestFinished])

  return [webRequests, clearWebRequests] as const
}
