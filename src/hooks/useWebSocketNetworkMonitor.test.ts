import { renderHook, act } from '@testing-library/react-hooks'
import { useWebSocketNetworkMonitor } from './useWebSocketNetworkMonitor'
import {
  emitDebuggerEvent,
  clearDebuggerListeners,
} from '../mocks/mock-chrome'

describe('useWebSocketNetworkMonitor', () => {
  beforeEach(() => {
    clearDebuggerListeners()
  })

  const emitWebSocketCreated = (requestId: string, url: string) => {
    emitDebuggerEvent({ tabId: 1 }, 'Network.webSocketCreated', {
      requestId,
      url,
    })
  }

  const emitWebSocketHandshake = (
    requestId: string,
    headers: Record<string, string> = {},
    requestHeaders: Record<string, string> = {}
  ) => {
    emitDebuggerEvent({ tabId: 1 }, 'Network.webSocketHandshakeResponseReceived', {
      requestId,
      response: {
        status: 101,
        headers,
        requestHeaders,
      },
    })
  }

  const emitWebSocketFrameSent = (requestId: string, payloadData: string) => {
    emitDebuggerEvent({ tabId: 1 }, 'Network.webSocketFrameSent', {
      requestId,
      response: { payloadData },
    })
  }

  const emitWebSocketFrameReceived = (requestId: string, payloadData: string) => {
    emitDebuggerEvent({ tabId: 1 }, 'Network.webSocketFrameReceived', {
      requestId,
      response: { payloadData },
    })
  }

  const emitSSERequest = (
    requestId: string,
    url: string,
    method = 'POST',
    headers: Record<string, string> = {}
  ) => {
    emitDebuggerEvent({ tabId: 1 }, 'Network.requestWillBeSent', {
      requestId,
      request: {
        url,
        method,
        headers: { ...headers, Accept: 'text/event-stream' },
      },
    })
  }

  const emitSSEResponse = (
    requestId: string,
    status = 200,
    headers: Record<string, string> = {}
  ) => {
    emitDebuggerEvent({ tabId: 1 }, 'Network.responseReceived', {
      requestId,
      response: { status, headers },
    })
  }

  const emitSSEMessage = (requestId: string, data: string) => {
    emitDebuggerEvent({ tabId: 1 }, 'Network.eventSourceMessageReceived', {
      requestId,
      data,
    })
  }

  it('captures WebSocket connections and received messages', async () => {
    const { result } = renderHook(() => useWebSocketNetworkMonitor())

    act(() => {
      emitWebSocketCreated('req-1', 'ws://localhost:4000/graphql')
      emitWebSocketHandshake(
        'req-1',
        { 'Upgrade': 'websocket' },
        { 'Origin': 'http://localhost:3000' }
      )
      emitWebSocketFrameReceived(
        'req-1',
        JSON.stringify({
          payload: {
            data: { reviewAdded: { stars: 4, episode: 'NEWHOPE' } },
          },
        })
      )
    })

    expect(result.current[0]).toHaveLength(1)
    expect(result.current[0][0]).toMatchObject({
      id: 'req-1',
      status: 101,
      url: 'ws://localhost:4000/graphql',
      method: 'WS',
      messages: [
        {
          type: 'receive',
          data: {
            payload: {
              data: { reviewAdded: { stars: 4, episode: 'NEWHOPE' } },
            },
          },
        },
      ],
    })
  })

  it('only captures sent messages with valid GraphQL queries', async () => {
    const { result } = renderHook(() => useWebSocketNetworkMonitor())

    act(() => {
      emitWebSocketCreated('req-1', 'ws://localhost:4000/graphql')
      emitWebSocketHandshake('req-1')

      // Invalid query - should be ignored
      emitWebSocketFrameSent(
        'req-1',
        JSON.stringify({ payload: { query: 'invalid query' } })
      )

      // Valid query - should be captured
      emitWebSocketFrameSent(
        'req-1',
        JSON.stringify({ payload: { query: 'query users { id }' } })
      )
    })

    expect(result.current[0]).toHaveLength(1)
    expect(result.current[0][0].messages).toHaveLength(1)
    expect(result.current[0][0].messages[0]).toMatchObject({
      type: 'send',
      data: { payload: { query: 'query users { id }' } },
    })
  })

  it('accepts sent messages for Rails ActionCable channel', async () => {
    const { result } = renderHook(() => useWebSocketNetworkMonitor())

    act(() => {
      emitWebSocketCreated('req-1', 'ws://localhost:4000/graphql')
      emitWebSocketHandshake('req-1')
      emitWebSocketFrameSent(
        'req-1',
        JSON.stringify({
          command: 'message',
          identifier: '{"channel":"GraphqlChannel","channelId":"1932245fcc6"}',
          data: JSON.stringify({
            query: 'query users { id }',
            variables: {},
            operationName: 'Users',
            action: 'execute',
          }),
        })
      )
    })

    expect(result.current[0]).toHaveLength(1)
    expect(result.current[0][0].messages[0]).toMatchObject({
      type: 'send',
      data: {
        command: 'message',
        identifier: { channel: 'GraphqlChannel', channelId: '1932245fcc6' },
        data: {
          query: 'query users { id }',
          variables: {},
          operationName: 'Users',
          action: 'execute',
        },
      },
    })
  })

  it('accepts received messages for Rails ActionCable channel', async () => {
    const { result } = renderHook(() => useWebSocketNetworkMonitor())

    act(() => {
      emitWebSocketCreated('req-1', 'ws://localhost:4000/graphql')
      emitWebSocketHandshake('req-1')
      emitWebSocketFrameReceived(
        'req-1',
        JSON.stringify({
          identifier: '{"channel":"GraphqlChannel","channelId":"1932245fcc6"}',
          message: { reviewAdded: { stars: 4, episode: 'CLONE_WARS' } },
        })
      )
    })

    expect(result.current[0]).toHaveLength(1)
    expect(result.current[0][0].messages[0]).toMatchObject({
      type: 'receive',
      data: {
        identifier: { channel: 'GraphqlChannel', channelId: '1932245fcc6' },
        data: { reviewAdded: { stars: 4, episode: 'CLONE_WARS' } },
      },
    })
  })

  it('filters connections by URL when urlFilter is provided', async () => {
    const { result } = renderHook(() =>
      useWebSocketNetworkMonitor({ isEnabled: true, urlFilter: 'other-url' })
    )

    act(() => {
      // This connection should be filtered out
      emitWebSocketCreated('req-1', 'ws://localhost:4000/graphql')
      emitWebSocketHandshake('req-1')
      emitWebSocketFrameReceived(
        'req-1',
        JSON.stringify({ payload: { data: { test: 1 } } })
      )

      // This connection should be included
      emitWebSocketCreated('req-2', 'ws://localhost:4000/other-url')
      emitWebSocketHandshake('req-2')
      emitWebSocketFrameReceived(
        'req-2',
        JSON.stringify({ payload: { data: { test: 2 } } })
      )
    })

    expect(result.current[0]).toHaveLength(1)
    expect(result.current[0][0].url).toBe('ws://localhost:4000/other-url')
  })

  it('does not capture events when isEnabled is false', async () => {
    const { result, rerender } = renderHook(
      (props) => useWebSocketNetworkMonitor(props),
      { initialProps: { isEnabled: false, urlFilter: '' } }
    )

    act(() => {
      emitWebSocketCreated('req-1', 'ws://localhost:4000/graphql')
      emitWebSocketHandshake('req-1')
      emitWebSocketFrameReceived(
        'req-1',
        JSON.stringify({ payload: { data: { test: 1 } } })
      )
    })

    expect(result.current[0]).toHaveLength(0)

    // Enable monitoring
    rerender({ isEnabled: true, urlFilter: '' })

    act(() => {
      emitWebSocketCreated('req-2', 'ws://localhost:4000/graphql')
      emitWebSocketHandshake('req-2')
      emitWebSocketFrameReceived(
        'req-2',
        JSON.stringify({ payload: { data: { test: 2 } } })
      )
    })

    expect(result.current[0]).toHaveLength(1)
  })

  it('captures SSE connections and messages', async () => {
    const { result } = renderHook(() => useWebSocketNetworkMonitor())

    act(() => {
      emitSSERequest('req-1', 'http://localhost:3000/api/graphql', 'POST')
      emitSSEResponse('req-1', 200, { 'Content-Type': 'text/event-stream' })
      emitSSEMessage(
        'req-1',
        JSON.stringify({ payload: { data: { userCreated: { id: '123' } } } })
      )
    })

    expect(result.current[0]).toHaveLength(1)
    expect(result.current[0][0]).toMatchObject({
      id: 'req-1',
      url: 'http://localhost:3000/api/graphql',
      method: 'POST',
      status: 200,
      messages: [
        {
          type: 'receive',
          data: { payload: { data: { userCreated: { id: '123' } } } },
        },
      ],
    })
  })

  it('clears all requests when clearRequests is called', async () => {
    const { result } = renderHook(() => useWebSocketNetworkMonitor())

    act(() => {
      emitWebSocketCreated('req-1', 'ws://localhost:4000/graphql')
      emitWebSocketHandshake('req-1')
      emitWebSocketFrameReceived(
        'req-1',
        JSON.stringify({ payload: { data: { test: 1 } } })
      )
    })

    expect(result.current[0]).toHaveLength(1)

    act(() => {
      result.current[1]() // Call clearRequests
    })

    expect(result.current[0]).toHaveLength(0)
  })

  it('captures headers from WebSocket handshake', async () => {
    const { result } = renderHook(() => useWebSocketNetworkMonitor())

    act(() => {
      emitWebSocketCreated('req-1', 'ws://localhost:4000/graphql')
      emitWebSocketHandshake(
        'req-1',
        { 'Sec-WebSocket-Accept': 'abc123', 'Connection': 'Upgrade' },
        { 'Origin': 'http://localhost:3000', 'Sec-WebSocket-Key': 'xyz789' }
      )
      emitWebSocketFrameReceived(
        'req-1',
        JSON.stringify({ payload: { data: { test: 1 } } })
      )
    })

    expect(result.current[0][0].request.headers).toEqual([
      { name: 'Origin', value: 'http://localhost:3000' },
      { name: 'Sec-WebSocket-Key', value: 'xyz789' },
    ])
    expect(result.current[0][0].response.headers).toEqual([
      { name: 'Sec-WebSocket-Accept', value: 'abc123' },
      { name: 'Connection', value: 'Upgrade' },
    ])
  })
})
