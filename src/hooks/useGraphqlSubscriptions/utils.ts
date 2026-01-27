import { IHeader } from '@/helpers/networkHelpers'
import { isGraphqlQuery } from '@/helpers/graphqlHelpers'
import {
  ITrackedConnection,
  ISubscriptionRequest,
  ISubscriptionMessageData,
  IStandardMessageData,
  IRailsChannelSendMessageData,
  IRailsChannelReceiveMessageData,
  MessageData,
} from './types'

// =============================================================================
// Type Guards
// =============================================================================

export const isStandardMessageData = (
  data: MessageData
): data is IStandardMessageData => 'payload' in data

export const isRailsChannelSendData = (
  data: MessageData
): data is IRailsChannelSendMessageData =>
  'command' in data && 'identifier' in data && 'data' in data

export const isRailsChannelReceiveData = (
  data: MessageData
): data is IRailsChannelReceiveMessageData =>
  'identifier' in data && 'message' in data && !('command' in data)

// =============================================================================
// Header Utilities
// =============================================================================

/**
 * Converts a headers object to an array of {name, value} pairs.
 */
export const headersToArray = (
  headers: Record<string, string> = {}
): IHeader[] => Object.entries(headers).map(([name, value]) => ({ name, value }))

// =============================================================================
// GraphQL Payload Detection
// =============================================================================

/**
 * Determines if a message contains a valid GraphQL payload.
 *
 * For 'send' messages: checks if payload contains a valid GraphQL query
 * For 'receive' messages: checks if payload contains data
 *
 * Supports standard GraphQL-WS format and Rails ActionCable format.
 */
export const isGraphQLPayload = (
  direction: 'send' | 'receive',
  data: MessageData
): boolean => {
  if (isStandardMessageData(data)) {
    if (direction === 'send') {
      return Boolean(data.payload?.query && isGraphqlQuery(data.payload.query))
    }
    return direction === 'receive' && 'data' in data.payload
  }

  if (isRailsChannelSendData(data)) {
    try {
      const parsed = JSON.parse(data.data)
      return isGraphqlQuery(parsed.query)
    } catch {
      return false
    }
  }

  if (isRailsChannelReceiveData(data)) {
    return Boolean(data.message)
  }

  return false
}

// =============================================================================
// Message Formatting
// =============================================================================

/**
 * Normalizes message data into a consistent format for display.
 * Handles JSON parsing for Rails ActionCable format.
 */
export const formatMessageData = (data: MessageData): ISubscriptionMessageData => {
  if (isStandardMessageData(data)) {
    return data as unknown as ISubscriptionMessageData
  }

  if (isRailsChannelSendData(data)) {
    try {
      return {
        command: data.command,
        identifier: JSON.parse(data.identifier),
        data: JSON.parse(data.data),
      }
    } catch {
      return data as unknown as ISubscriptionMessageData
    }
  }

  if (isRailsChannelReceiveData(data)) {
    try {
      return {
        identifier: JSON.parse(data.identifier),
        data: data.message,
      }
    } catch {
      return data as unknown as ISubscriptionMessageData
    }
  }

  return data as unknown as ISubscriptionMessageData
}

// =============================================================================
// Connection Conversion
// =============================================================================

/**
 * Converts internal connection state to the public request format.
 */
export const connectionToRequest = (
  conn: ITrackedConnection
): ISubscriptionRequest => ({
  id: conn.id,
  status: conn.status,
  url: conn.url,
  method: conn.method,
  messages: conn.messages,
  request: { headers: conn.requestHeaders },
  response: { headers: conn.responseHeaders },
})
