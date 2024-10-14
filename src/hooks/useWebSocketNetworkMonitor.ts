import { useCallback, useState } from "react"
import { getHAR } from "../services/networkMonitor"
import useInterval from "./useInterval"
import { IHeader } from "@/helpers/networkHelpers"
import * as safeJson from "@/helpers/safeJson"
import { isGraphqlQuery } from "../helpers/graphqlHelpers"

export interface IWebSocketMessage {
  /**
   * typically "receive" or "send"
   */
  type: string
  /**
   * Time request occured in milliseconds
   */
  time: number
  /**
   * Data sent or received
   */
  data: Record<string, any>
}

export interface IWebSocketNetworkRequest {
  id: string
  status: number
  url: string
  method: string
  messages: IWebSocketMessage[]
  request: {
    headers: IHeader[]
  }
  response: {
    headers: IHeader[]
  }
}

interface IWebSocketHAREntryMessage {
  data: string
  opcode: number
  time: number
  type: string
}

interface WebSocketHAREntry {
  _resourceType: "websocket"
  _webSocketMessages: IWebSocketHAREntryMessage[]
  request: {
    url: string
  }
}

const isWebSocketEntry = (entry: any): entry is WebSocketHAREntry => {
  return entry._resourceType === "websocket"
}

const isGraphQLWebsocketEntry = (entry: WebSocketHAREntry, urlFilter: string) => {
  return urlFilter ? entry.request.url.includes(urlFilter) : true
}

const isGraphQLPayload = (
  type: string,
  payload?: Record<string, any>
): payload is {} => {
  if (!payload) {
    return false
  }

  if (type === "send") {
    const hasQuery = "query" in payload
    return hasQuery && isGraphqlQuery(payload.query)
  }

  if (type === "receive") {
    return "data" in payload
  }

  return false
}

const prepareWebSocketRequests = (
  har: chrome.devtools.network.HARLog,
  options: { urlFilter: string }
): IWebSocketNetworkRequest[] => {
  return har.entries.flatMap((entry, i) => {
    if (isWebSocketEntry(entry) && isGraphQLWebsocketEntry(entry, options.urlFilter)) {
      const websocketEntry: IWebSocketNetworkRequest = {
        id: `subscription-${i}`,
        status: entry.response.status,
        url: entry.request.url,
        method: entry.request.method,
        messages: entry._webSocketMessages.flatMap(message => {
          const messageData =
            safeJson.parse<Record<string, any>>(message.data) || undefined

          const payload = messageData?.payload
          if (!messageData || !isGraphQLPayload(message.type, payload)) {
            return []
          }

          return {
            type: message.type,
            time: message.time,
            data: messageData,
          }
        }),
        request: {
          headers: entry.request.headers,
        },
        response: {
          headers: entry.response.headers,
        },
      }
      return websocketEntry
    } else {
      return []
    }
  })
}

interface IUseWebSocketNetworkOptions {
  isEnabled: boolean
  urlFilter: string
}

export const useWebSocketNetworkMonitor = (
  options: IUseWebSocketNetworkOptions = { isEnabled: true, urlFilter: '' }
) => {
  const [webSocketRequests, setWebSocketRequests] = useState<
    IWebSocketNetworkRequest[]
  >([])

  const clearWebSocketRequests = useCallback(() => {
    setWebSocketRequests([])
  }, [setWebSocketRequests])

  const fetchWebSocketRequests = useCallback(async () => {
    const har = await getHAR()
    const websocketRequests = prepareWebSocketRequests(har, { urlFilter: options.urlFilter })
    setWebSocketRequests(websocketRequests)
  }, [setWebSocketRequests, options.urlFilter])

  useInterval(fetchWebSocketRequests, 2000, { isRunning: options.isEnabled })

  return [webSocketRequests, clearWebSocketRequests] as const
}
