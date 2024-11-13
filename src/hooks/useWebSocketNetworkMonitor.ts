import { useCallback, useState } from 'react'
import { getHAR } from '../services/networkMonitor'
import useInterval from './useInterval'
import { IHeader } from '@/helpers/networkHelpers'
import * as safeJson from '@/helpers/safeJson'
import { isGraphqlQuery } from '../helpers/graphqlHelpers'

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
  _resourceType: 'websocket'
  _webSocketMessages: IWebSocketHAREntryMessage[]
  request: {
    url: string
  }
}

const isWebSocketEntry = (entry: any): entry is WebSocketHAREntry => {
  return entry._resourceType === 'websocket'
}

const isGraphQLWebsocketEntry = (
  entry: WebSocketHAREntry,
  urlFilter: string
) => {
  return urlFilter ? entry.request.url.includes(urlFilter) : true
}

interface IMessageData {
  payload: {
    query: string
  }
}

interface IRailsChannelSendMessageData {
  command: string
  identifier: string
  data: string
}

interface IRailsChannelReceiveMessageData {
  identifier: string
  message: {
    data: Record<string, any>
  }
}

type MessageData =
  | IMessageData
  | IRailsChannelSendMessageData
  | IRailsChannelReceiveMessageData

const isGraphQLPayload = (
  type: string,
  messageData?: MessageData
): Record<string, any> | boolean => {
  if (!messageData) {
    return false
  }

  if ('payload' in messageData) {
    if (type === 'send') {
      const hasQuery = 'query' in messageData.payload
      if (hasQuery && isGraphqlQuery(messageData.payload.query)) {
        return messageData.payload
      }
    }

    if (type === 'receive' && 'data' in messageData.payload) {
      return messageData.payload
    }
  }

  if (isIRailsChannelSendMessageData(messageData)) {
    return isGraphqlQuery(JSON.parse(messageData.data).query)
  }

  if (isIRailsChannelReceiveMessageData(messageData)) {
    return !!messageData.message.data
  }

  return false
}

const prepareWebSocketRequests = (
  har: chrome.devtools.network.HARLog,
  options: { urlFilter: string }
): IWebSocketNetworkRequest[] => {
  return har.entries.flatMap((entry, i) => {
    if (
      isWebSocketEntry(entry) &&
      isGraphQLWebsocketEntry(entry, options.urlFilter)
    ) {
      const websocketEntry: IWebSocketNetworkRequest = {
        id: `subscription-${i}`,
        status: entry.response.status,
        url: entry.request.url,
        method: entry.request.method,
        messages: entry._webSocketMessages.flatMap((message) => {
          const messageData = safeJson.parse(message.data) as
            | MessageData
            | undefined

          if (!messageData || !isGraphQLPayload(message.type, messageData)) {
            return []
          }

          return {
            type: message.type,
            time: message.time,
            data: formatMessageData(messageData, message.type),
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

const formatMessageData = (messageData: MessageData, type: string) => {
  if (isIMessageData(messageData)) {
    return messageData
  }

  if (isIRailsChannelSendMessageData(messageData)) {
    return {
      command: messageData.command,
      identifier: JSON.parse(messageData.identifier),
      data: JSON.parse(messageData.data),
    }
  }

  if (isIRailsChannelReceiveMessageData(messageData)) {
    return {
      identifier: JSON.parse(messageData.identifier),
      data: messageData.message.data,
    }
  }

  return messageData
}

function isIMessageData(data: MessageData): data is IMessageData {
  return 'payload' in data
}

function isIRailsChannelSendMessageData(
  data: MessageData
): data is IRailsChannelSendMessageData {
  return 'command' in data && 'identifier' in data && 'data' in data
}

function isIRailsChannelReceiveMessageData(
  data: MessageData
): data is IRailsChannelReceiveMessageData {
  return 'identifier' in data && 'message' in data && !('command' in data)
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
    const websocketRequests = prepareWebSocketRequests(har, {
      urlFilter: options.urlFilter,
    })
    setWebSocketRequests(websocketRequests)
  }, [setWebSocketRequests, options.urlFilter])

  useInterval(fetchWebSocketRequests, 2000, { isRunning: options.isEnabled })

  return [webSocketRequests, clearWebSocketRequests] as const
}
