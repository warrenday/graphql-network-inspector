import { IHeader } from '@/helpers/networkHelpers'

/**
 * Data payload within a subscription message.
 * Supports standard GraphQL payloads and Rails ActionCable format.
 */
export interface ISubscriptionMessageData {
  payload?: unknown
  query?: string
  variables?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * A single message sent or received over a subscription connection.
 */
export interface ISubscriptionMessage {
  type: 'send' | 'receive'
  time: number
  data: ISubscriptionMessageData
}

/**
 * Represents a GraphQL subscription connection (WebSocket or SSE).
 */
export interface ISubscriptionRequest {
  id: string
  status: number
  url: string
  method: string
  messages: ISubscriptionMessage[]
  request: { headers: IHeader[] }
  response: { headers: IHeader[] }
}

/**
 * Internal tracking state for an active subscription connection.
 */
export interface ITrackedConnection {
  id: string
  type: 'websocket' | 'sse'
  url: string
  method: string
  requestHeaders: IHeader[]
  responseHeaders: IHeader[]
  status: number
  messages: ISubscriptionMessage[]
}

/**
 * Standard GraphQL subscription message format.
 */
export interface IStandardMessageData {
  payload: { query?: string; data?: unknown }
}

/**
 * Rails ActionCable send message format.
 */
export interface IRailsChannelSendMessageData {
  command: string
  identifier: string
  data: string
}

/**
 * Rails ActionCable receive message format.
 */
export interface IRailsChannelReceiveMessageData {
  identifier: string
  message: { data: Record<string, unknown> }
}

/**
 * Union of all supported message data formats.
 */
export type MessageData =
  | IStandardMessageData
  | IRailsChannelSendMessageData
  | IRailsChannelReceiveMessageData

