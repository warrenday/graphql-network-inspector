import { useCallback, useEffect, useRef, useState } from 'react'
import { IHeader } from '@/helpers/networkHelpers'
import * as safeJson from '@/helpers/safeJson'
import { isGraphqlQuery } from '../helpers/graphqlHelpers'
import { chromeProvider } from '../services/chromeProvider'

// ============================================================================
// Types
// ============================================================================

export interface IWebSocketMessageData {
  payload?: unknown
  query?: string
  variables?: Record<string, unknown>
  [key: string]: unknown
}

export interface IWebSocketMessage {
  type: string
  time: number
  data: IWebSocketMessageData
}

export interface IWebSocketNetworkRequest {
  id: string
  status: number
  url: string
  method: string
  messages: IWebSocketMessage[]
  request: { headers: IHeader[] }
  response: { headers: IHeader[] }
}

interface ITrackedConnection {
  id: string
  type: 'websocket' | 'sse'
  url: string
  method: string
  requestHeaders: IHeader[]
  responseHeaders: IHeader[]
  status: number
  messages: IWebSocketMessage[]
}

interface IUseWebSocketNetworkOptions {
  isEnabled: boolean
  urlFilter: string
}

// ============================================================================
// Message Data Types (for GraphQL payload detection)
// ============================================================================

interface IStandardMessageData {
  payload: { query?: string; data?: unknown }
}

interface IRailsChannelSendMessageData {
  command: string
  identifier: string
  data: string
}

interface IRailsChannelReceiveMessageData {
  identifier: string
  message: { data: Record<string, unknown> }
}

type MessageData =
  | IStandardMessageData
  | IRailsChannelSendMessageData
  | IRailsChannelReceiveMessageData

// ============================================================================
// Type Guards
// ============================================================================

const isStandardMessageData = (data: MessageData): data is IStandardMessageData =>
  'payload' in data

const isRailsChannelSendData = (data: MessageData): data is IRailsChannelSendMessageData =>
  'command' in data && 'identifier' in data && 'data' in data

const isRailsChannelReceiveData = (data: MessageData): data is IRailsChannelReceiveMessageData =>
  'identifier' in data && 'message' in data && !('command' in data)

// ============================================================================
// Helper Functions
// ============================================================================

const headersObjectToArray = (headers: Record<string, string> = {}): IHeader[] =>
  Object.entries(headers).map(([name, value]) => ({ name, value }))

const isGraphQLPayload = (type: string, data: MessageData): boolean => {
  if (isStandardMessageData(data)) {
    if (type === 'send') {
      return Boolean(data.payload?.query && isGraphqlQuery(data.payload.query))
    }
    return type === 'receive' && 'data' in data.payload
  }

  if (isRailsChannelSendData(data)) {
    try {
      return isGraphqlQuery(JSON.parse(data.data).query)
    } catch {
      return false
    }
  }

  if (isRailsChannelReceiveData(data)) {
    return Boolean(data.message)
  }

  return false
}

const formatMessageData = (data: MessageData): IWebSocketMessageData => {
  if (isStandardMessageData(data)) {
    return data as unknown as IWebSocketMessageData
  }

  if (isRailsChannelSendData(data)) {
    try {
      return {
        command: data.command,
        identifier: JSON.parse(data.identifier),
        data: JSON.parse(data.data),
      }
    } catch {
      return data as unknown as IWebSocketMessageData
    }
  }

  if (isRailsChannelReceiveData(data)) {
    try {
      return {
        identifier: JSON.parse(data.identifier),
        data: data.message,
      }
    } catch {
      return data as unknown as IWebSocketMessageData
    }
  }

  return data as unknown as IWebSocketMessageData
}

const createWebSocketConnection = (requestId: string, url: string): ITrackedConnection => ({
  id: requestId,
  type: 'websocket',
  url,
  method: 'WS',
  requestHeaders: [],
  responseHeaders: [],
  status: 101,
  messages: [],
})

const createSSEConnection = (
  requestId: string,
  url: string,
  method: string,
  headers: Record<string, string>
): ITrackedConnection => ({
  id: requestId,
  type: 'sse',
  url,
  method,
  requestHeaders: headersObjectToArray(headers),
  responseHeaders: [],
  status: 0,
  messages: [],
})

const connectionToRequest = (conn: ITrackedConnection): IWebSocketNetworkRequest => ({
  id: conn.id,
  status: conn.status,
  url: conn.url,
  method: conn.method,
  messages: conn.messages,
  request: { headers: conn.requestHeaders },
  response: { headers: conn.responseHeaders },
})

// ============================================================================
// Hook
// ============================================================================

export const useWebSocketNetworkMonitor = (
  options: IUseWebSocketNetworkOptions = { isEnabled: true, urlFilter: '' }
) => {
  const [requests, setRequests] = useState<IWebSocketNetworkRequest[]>([])
  const connectionsRef = useRef(new Map<string, ITrackedConnection>())
  const chrome = chromeProvider()

  useEffect(() => {
    if (!options.isEnabled) return

    const tabId = chrome.devtools.inspectedWindow.tabId
    const connections = connectionsRef.current

    const updateConnection = (
      requestId: string,
      updater: (conn: ITrackedConnection) => ITrackedConnection
    ) => {
      const existing = connections.get(requestId)
      if (!existing) return

      const updated = updater(existing)
      connections.set(requestId, updated)
    }

    const syncRequestsState = () => {
      const filtered = Array.from(connections.values())
        .filter((conn) => {
          if (options.urlFilter && !conn.url.includes(options.urlFilter)) {
            return false
          }
          return conn.messages.length > 0
        })
        .map(connectionToRequest)

      setRequests(filtered)
    }

    const addMessage = (requestId: string, type: 'send' | 'receive', rawData: string) => {
      const conn = connections.get(requestId)
      if (!conn) return

      const parsed = safeJson.parse(rawData) as MessageData | undefined
      if (!parsed || !isGraphQLPayload(type, parsed)) return

      updateConnection(requestId, (c) => ({
        ...c,
        messages: [...c.messages, { type, time: Date.now(), data: formatMessageData(parsed) }],
      }))

      syncRequestsState()
    }

    // Event handlers mapped by method name
    const eventHandlers: Record<string, (params: any) => void> = {
      'Network.webSocketCreated': (params) => {
        connections.set(params.requestId, createWebSocketConnection(params.requestId, params.url))
      },

      'Network.webSocketHandshakeResponseReceived': (params) => {
        updateConnection(params.requestId, (conn) => ({
          ...conn,
          status: params.response?.status ?? 101,
          responseHeaders: headersObjectToArray(params.response?.headers),
          requestHeaders: headersObjectToArray(params.response?.requestHeaders),
        }))
      },

      'Network.webSocketFrameSent': (params) => {
        const payload = params.response?.payloadData
        if (payload) addMessage(params.requestId, 'send', payload)
      },

      'Network.webSocketFrameReceived': (params) => {
        const payload = params.response?.payloadData
        if (payload) addMessage(params.requestId, 'receive', payload)
      },

      'Network.webSocketClosed': () => {
        // Keep connection data for history
      },

      'Network.requestWillBeSent': (params) => {
        const acceptHeader = params.request?.headers?.['Accept'] ?? ''
        const isSSE = acceptHeader.includes('text/event-stream')

        if (isSSE) {
          connections.set(
            params.requestId,
            createSSEConnection(
              params.requestId,
              params.request.url,
              params.request.method ?? 'GET',
              params.request.headers
            )
          )
        }
      },

      'Network.responseReceived': (params) => {
        const conn = connections.get(params.requestId)
        if (conn?.type !== 'sse') return

        updateConnection(params.requestId, (c) => ({
          ...c,
          status: params.response?.status ?? 200,
          responseHeaders: headersObjectToArray(params.response?.headers),
        }))
      },

      'Network.eventSourceMessageReceived': (params) => {
        if (params.data) addMessage(params.requestId, 'receive', params.data)
      },
    }

    const handleDebuggerEvent = (_source: unknown, method: string, params: unknown) => {
      eventHandlers[method]?.(params)
    }

    chrome.debugger.attach({ tabId }, '1.3', () => {
      chrome.debugger.sendCommand({ tabId }, 'Network.enable')
    })

    chrome.debugger.onEvent.addListener(handleDebuggerEvent)

    return () => {
      chrome.debugger.onEvent.removeListener(handleDebuggerEvent)
      chrome.debugger.detach({ tabId })
    }
  }, [chrome, options.isEnabled, options.urlFilter])

  const clearRequests = useCallback(() => {
    connectionsRef.current.clear()
    setRequests([])
  }, [])

  return [requests, clearRequests] as const
}
