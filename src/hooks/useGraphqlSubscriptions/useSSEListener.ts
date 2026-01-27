import { useEffect } from 'react'
import * as safeJson from '@/helpers/safeJson'
import { chromeProvider } from '@/services/chromeProvider'
import { ITrackedConnection, ISubscriptionMessage, MessageData } from './types'
import { isGraphQLPayload, formatMessageData, headersToArray } from './utils'

/**
 * Creates initial connection state for a new SSE connection.
 */
const createConnection = (
  requestId: string,
  url: string,
  method: string,
  headers: Record<string, string>
): ITrackedConnection => ({
  id: requestId,
  type: 'sse',
  url,
  method,
  requestHeaders: headersToArray(headers),
  responseHeaders: [],
  status: 0,
  messages: [],
})

/**
 * Checks if a request is an SSE request based on the Accept header.
 */
const isSSERequest = (headers: Record<string, string> = {}): boolean => {
  const acceptHeader = headers['Accept'] || headers['accept'] || ''
  return acceptHeader.includes('text/event-stream')
}

interface UseSSEListenerOptions {
  isEnabled: boolean
  connections: Map<string, ITrackedConnection>
  onUpdate: () => void
}

/**
 * Listens for Server-Sent Events (SSE) from the Chrome debugger and tracks
 * GraphQL subscription messages.
 *
 * SSE connections are detected by the `Accept: text/event-stream` header.
 *
 * Handles the following Chrome DevTools Protocol events:
 * - Network.requestWillBeSent (to detect SSE requests)
 * - Network.responseReceived (to capture response headers)
 * - Network.eventSourceMessageReceived (to capture SSE messages)
 */
export const useSSEListener = ({
  isEnabled,
  connections,
  onUpdate,
}: UseSSEListenerOptions) => {
  const chrome = chromeProvider()

  useEffect(() => {
    if (!isEnabled) return

    const addMessage = (requestId: string, rawData: string) => {
      const conn = connections.get(requestId)
      if (!conn || conn.type !== 'sse') return

      const parsed = safeJson.parse(rawData) as MessageData | undefined
      if (!parsed || !isGraphQLPayload('receive', parsed)) return

      const message: ISubscriptionMessage = {
        type: 'receive',
        time: Date.now(),
        data: formatMessageData(parsed),
      }

      connections.set(requestId, {
        ...conn,
        messages: [...conn.messages, message],
      })

      onUpdate()
    }

    const handleEvent = (_source: unknown, method: string, params: unknown) => {
      const p = params as Record<string, unknown>

      switch (method) {
        case 'Network.requestWillBeSent': {
          const { requestId, request } = p as {
            requestId: string
            request: {
              url: string
              method?: string
              headers?: Record<string, string>
            }
          }
          if (!isSSERequest(request.headers)) break

          connections.set(
            requestId,
            createConnection(
              requestId,
              request.url,
              request.method ?? 'GET',
              request.headers ?? {}
            )
          )
          break
        }

        case 'Network.responseReceived': {
          const { requestId, response } = p as {
            requestId: string
            response?: { status?: number; headers?: Record<string, string> }
          }
          const conn = connections.get(requestId)
          if (!conn || conn.type !== 'sse') break

          connections.set(requestId, {
            ...conn,
            status: response?.status ?? 200,
            responseHeaders: headersToArray(response?.headers),
          })
          break
        }

        case 'Network.eventSourceMessageReceived': {
          const { requestId, data } = p as {
            requestId: string
            data?: string
          }
          if (data) {
            addMessage(requestId, data)
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
