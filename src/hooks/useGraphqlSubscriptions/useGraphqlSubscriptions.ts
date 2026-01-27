import { useCallback, useEffect, useRef, useState } from 'react'
import { chromeProvider } from '@/services/chromeProvider'
import { useSSEListener } from './useSSEListener'
import { useWebSocketListener } from './useWebSocketListener'
import { ITrackedConnection, ISubscriptionRequest } from './types'
import { connectionToRequest } from './utils'

interface UseGraphqlSubscriptionsOptions {
  isEnabled: boolean
  urlFilter: string
}

/**
 * Monitors GraphQL subscription connections (WebSocket and SSE) using the
 * Chrome DevTools Protocol debugger API.
 *
 * Returns an array of subscription requests with their messages, and a
 * function to clear all tracked requests.
 *
 * @example
 * ```tsx
 * const [subscriptions, clearSubscriptions] = useGraphqlSubscriptions({
 *   isEnabled: true,
 *   urlFilter: 'graphql',
 * })
 * ```
 */
export const useGraphqlSubscriptions = (
  options: UseGraphqlSubscriptionsOptions = { isEnabled: true, urlFilter: '' }
) => {
  const [requests, setRequests] = useState<ISubscriptionRequest[]>([])
  const connectionsRef = useRef(new Map<string, ITrackedConnection>())
  const chrome = chromeProvider()

  const syncRequestsState = useCallback(() => {
    const filtered = Array.from(connectionsRef.current.values())
      .filter((conn) => {
        if (options.urlFilter && !conn.url.includes(options.urlFilter)) {
          return false
        }
        return conn.messages.length > 0
      })
      .map(connectionToRequest)

    setRequests(filtered)
  }, [options.urlFilter])

  // Attach Chrome debugger to enable network monitoring
  useEffect(() => {
    if (!options.isEnabled) return

    const tabId = chrome.devtools.inspectedWindow.tabId

    chrome.debugger.attach({ tabId }, '1.3', () => {
      chrome.debugger.sendCommand({ tabId }, 'Network.enable')
    })

    return () => {
      chrome.debugger.detach({ tabId })
    }
  }, [chrome, options.isEnabled])

  useWebSocketListener({
    isEnabled: options.isEnabled,
    connections: connectionsRef.current,
    onUpdate: syncRequestsState,
  })

  useSSEListener({
    isEnabled: options.isEnabled,
    connections: connectionsRef.current,
    onUpdate: syncRequestsState,
  })

  const clearRequests = useCallback(() => {
    connectionsRef.current.clear()
    setRequests([])
  }, [])

  return [requests, clearRequests] as const
}
