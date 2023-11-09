import { useCallback, useState } from "react"
import { getHAR } from "../services/networkMonitor"
import useLoop from "./useLoop"
import { Header } from "./useNetworkMonitor"
import * as safeJson from "@/helpers/safeJson"

export interface WebSocketMessage {
  type: string
  time: number
  data: object
}

export interface WebSocketNetworkRequest {
  id: string
  status: number
  url: string
  method: string
  messages: WebSocketMessage[]
  request: {
    headers: Header[]
  }
  response: {
    headers: Header[]
  }
}

interface WebSocketHAREntryMessage {
  data: string
  opcode: number
  time: number
  type: string
}

interface WebSocketHAREntry {
  _resourceType: "websocket"
  _webSocketMessages: WebSocketHAREntryMessage[]
}

const isWebSocketEntry = (entry: any): entry is WebSocketHAREntry => {
  return entry._resourceType === "websocket"
}

const prepareWebSocketRequests = (
  har: chrome.devtools.network.HARLog
): WebSocketNetworkRequest[] => {
  return har.entries.flatMap((entry, i) => {
    if (isWebSocketEntry(entry)) {
      const websocketEntry: WebSocketNetworkRequest = {
        id: "subscription",
        status: entry.response.status,
        url: entry.request.url,
        method: entry.request.method,
        // Reverse messages to get newest first
        messages: entry._webSocketMessages.reverse().flatMap((message) => {
          const data = safeJson.parse<{
            type: string
            payload: {}
          }>(message.data)
          if (!data || data.type !== "data") {
            return []
          }

          return {
            type: message.type,
            time: message.time,
            data: data.payload,
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

export const useWebSocketNetworkMonitor = () => {
  const [webSocketRequests, setWebSocketRequests] = useState<
    WebSocketNetworkRequest[]
  >([])

  const clearWebSocketRequests = useCallback(() => {
    setWebSocketRequests([])
  }, [setWebSocketRequests])

  useLoop(
    useCallback(async () => {
      const har = await getHAR()
      const websocketRequests = prepareWebSocketRequests(har)
      setWebSocketRequests(websocketRequests)
    }, [setWebSocketRequests]),
    1000
  )

  return [webSocketRequests, clearWebSocketRequests] as const
}
