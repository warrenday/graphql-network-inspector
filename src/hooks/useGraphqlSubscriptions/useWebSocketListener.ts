import { useEffect } from 'react'
import * as safeJson from '@/helpers/safeJson'
import { chromeProvider } from '@/services/chromeProvider'
import { ITrackedConnection, ISubscriptionMessage, MessageData } from './types'
import { isGraphQLPayload, formatMessageData, headersToArray } from './utils'

/**
 * Creates initial connection state for a new WebSocket.
 */
const createConnection = (requestId: string, url: string): ITrackedConnection => ({
  id: requestId,
  type: 'websocket',
  url,
  method: 'WS',
  requestHeaders: [],
  responseHeaders: [],
  status: 101,
  messages: [],
  lastActivityTime: Date.now(),
})

interface UseWebSocketListenerOptions {
  isEnabled: boolean
  connections: Map<string, ITrackedConnection>
  onUpdate: () => void
}

/**
 * Listens for WebSocket events from the Chrome debugger and tracks
 * GraphQL subscription messages.
 *
 * Handles the following Chrome DevTools Protocol events:
 * - Network.webSocketCreated
 * - Network.webSocketHandshakeResponseReceived
 * - Network.webSocketFrameSent
 * - Network.webSocketFrameReceived
 */
export const useWebSocketListener = ({
  isEnabled,
  connections,
  onUpdate,
}: UseWebSocketListenerOptions) => {
  const chrome = chromeProvider()

  useEffect(() => {
    if (!isEnabled) return

    const addMessage = (
      requestId: string,
      direction: 'send' | 'receive',
      rawData: string
    ) => {
      const conn = connections.get(requestId)
      if (!conn || conn.type !== 'websocket') return

      const parsed = safeJson.parse(rawData) as MessageData | undefined
      if (!parsed || !isGraphQLPayload(direction, parsed)) return

      const message: ISubscriptionMessage = {
        type: direction,
        time: Date.now(),
        data: formatMessageData(parsed),
      }

      connections.set(requestId, {
        ...conn,
        messages: [...conn.messages, message],
        lastActivityTime: Date.now(),
      })

      onUpdate()
    }

    const handleEvent = (_source: unknown, method: string, params: unknown) => {
      const p = params as Record<string, unknown>

      switch (method) {
        case 'Network.webSocketCreated': {
          const { requestId, url } = p as { requestId: string; url: string }
          connections.set(requestId, createConnection(requestId, url))
          break
        }

        case 'Network.webSocketHandshakeResponseReceived': {
          const { requestId, response } = p as {
            requestId: string
            response?: {
              status?: number
              headers?: Record<string, string>
              requestHeaders?: Record<string, string>
            }
          }
          const conn = connections.get(requestId)
          if (!conn || conn.type !== 'websocket') break

          connections.set(requestId, {
            ...conn,
            status: response?.status ?? 101,
            responseHeaders: headersToArray(response?.headers),
            requestHeaders: headersToArray(response?.requestHeaders),
            lastActivityTime: Date.now(),
          })
          break
        }

        case 'Network.webSocketFrameSent': {
          const { requestId, response } = p as {
            requestId: string
            response?: { payloadData?: string }
          }
          if (response?.payloadData) {
            addMessage(requestId, 'send', response.payloadData)
          }
          break
        }

        case 'Network.webSocketFrameReceived': {
          const { requestId, response } = p as {
            requestId: string
            response?: { payloadData?: string }
          }
          if (response?.payloadData) {
            addMessage(requestId, 'receive', response.payloadData)
          }
          break
        }

        case 'Network.webSocketClosed': {
          const { requestId } = p as { requestId: string }
          const conn = connections.get(requestId)
          if (conn && conn.type === 'websocket') {
            connections.set(requestId, {
              ...conn,
              isClosed: true,
              lastActivityTime: Date.now(),
            })
          }
          break
        }
      }
    }

    chrome.debugger.onEvent.addListener(handleEvent)

    return () => {
      chrome.debugger.onEvent.removeListener(handleEvent)
    }
  }, [chrome, isEnabled, connections, onUpdate])
}
