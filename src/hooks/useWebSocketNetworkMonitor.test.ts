import { renderHook } from '@testing-library/react-hooks'
import { DeepPartial } from 'utility-types'
import { useWebSocketNetworkMonitor } from './useWebSocketNetworkMonitor'
import { getHAR } from '../services/networkMonitor'

jest.mock('../services/networkMonitor')
const mockGetHAR = getHAR as jest.MockedFunction<any>

describe('useWebSocketNetworkMonitor', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('polls the HAR log and returns the websocket requests', async () => {
    mockGetHAR.mockResolvedValue({
      entries: [
        {
          // This is a normal request, not a websocket
          // should not appear in output
        },
        {
          _resourceType: 'websocket',
          request: {
            url: 'ws://localhost:4000/graphql',
            method: 'GET',
            headers: [
              { name: 'RequestHeader1', value: 'Value1' },
              { name: 'RequestHeader2', value: 'Value2' },
            ],
          },
          response: {
            status: 101,
            headers: [
              { name: 'ResponseHeader1', value: 'Value1' },
              { name: 'ResponseHeader2', value: 'Value2' },
            ],
          },
          _webSocketMessages: [
            {
              data: JSON.stringify({
                payload: {
                  data: { reviewAdded: { stars: 4, episode: 'NEWHOPE' } },
                },
              }),
              opcode: 1,
              time: 1234,
              type: 'receive',
            },
            {
              data: JSON.stringify({
                payload: {
                  data: { reviewAdded: { stars: 4, episode: 'NEWHOPE' } },
                },
              }),
              opcode: 1,
              time: 1234,
              type: 'receive',
            },
          ],
        },
      ],
    } as DeepPartial<chrome.devtools.network.HARLog>)

    const { result, waitForNextUpdate } = renderHook(() =>
      useWebSocketNetworkMonitor()
    )

    await waitForNextUpdate()

    expect(result.current[0]).toEqual([
      {
        id: 'subscription-1',
        status: 101,
        url: 'ws://localhost:4000/graphql',
        method: 'GET',
        request: {
          headers: [
            { name: 'RequestHeader1', value: 'Value1' },
            { name: 'RequestHeader2', value: 'Value2' },
          ],
        },
        response: {
          headers: [
            { name: 'ResponseHeader1', value: 'Value1' },
            { name: 'ResponseHeader2', value: 'Value2' },
          ],
        },
        messages: [
          {
            data: {
              payload: {
                data: {
                  reviewAdded: {
                    episode: 'NEWHOPE',
                    stars: 4,
                  },
                },
              },
            },
            time: 1234,
            type: 'receive',
          },
          {
            data: {
              payload: {
                data: {
                  reviewAdded: {
                    episode: 'NEWHOPE',
                    stars: 4,
                  },
                },
              },
            },
            time: 1234,
            type: 'receive',
          },
        ],
      },
    ])
  })

  it('only returns sent requests which contain a valid graphql query', async () => {
    mockGetHAR.mockResolvedValue({
      entries: [
        {
          _resourceType: 'websocket',
          request: {
            url: 'ws://localhost:4000/graphql',
            method: 'GET',
            headers: [
              { name: 'RequestHeader1', value: 'Value1' },
              { name: 'RequestHeader2', value: 'Value2' },
            ],
          },
          response: {
            status: 101,
            headers: [
              { name: 'ResponseHeader1', value: 'Value1' },
              { name: 'ResponseHeader2', value: 'Value2' },
            ],
          },
          _webSocketMessages: [
            {
              data: JSON.stringify({
                payload: {
                  query: 'invalid query',
                },
              }),
              opcode: 1,
              time: 1234,
              type: 'send',
            },
            {
              data: JSON.stringify({
                payload: {
                  query: 'query users { id }',
                },
              }),
              opcode: 1,
              time: 1234,
              type: 'send',
            },
          ],
        },
      ],
    } as DeepPartial<chrome.devtools.network.HARLog>)

    const { result, waitForNextUpdate } = renderHook(() =>
      useWebSocketNetworkMonitor()
    )

    await waitForNextUpdate()

    expect(result.current[0]).toEqual([
      {
        id: 'subscription-0',
        status: 101,
        url: 'ws://localhost:4000/graphql',
        method: 'GET',
        request: {
          headers: [
            { name: 'RequestHeader1', value: 'Value1' },
            { name: 'RequestHeader2', value: 'Value2' },
          ],
        },
        response: {
          headers: [
            { name: 'ResponseHeader1', value: 'Value1' },
            { name: 'ResponseHeader2', value: 'Value2' },
          ],
        },
        messages: [
          {
            data: {
              payload: {
                query: 'query users { id }',
              },
            },
            time: 1234,
            type: 'send',
          },
        ],
      },
    ])
  })

  it('accepts sent messages for rails channel', async () => {
    mockGetHAR.mockResolvedValue({
      entries: [
        {
          _resourceType: 'websocket',
          request: {
            url: 'ws://localhost:4000/graphql',
            method: 'GET',
            headers: [
              { name: 'RequestHeader1', value: 'Value1' },
              { name: 'RequestHeader2', value: 'Value2' },
            ],
          },
          response: {
            status: 101,
            headers: [
              { name: 'ResponseHeader1', value: 'Value1' },
              { name: 'ResponseHeader2', value: 'Value2' },
            ],
          },
          _webSocketMessages: [
            {
              data: JSON.stringify({
                command: 'message',
                identifier:
                  '{"channel":"GraphqlChannel","channelId":"1932245fcc6"}',
                data: JSON.stringify({
                  query: 'query users { id }',
                  variables: {},
                  operationName: 'Users',
                  action: 'execute',
                }),
              }),
              opcode: 1,
              time: 1234,
              type: 'send',
            },
          ],
        },
      ],
    } as DeepPartial<chrome.devtools.network.HARLog>)

    const { result, waitForNextUpdate } = renderHook(() =>
      useWebSocketNetworkMonitor()
    )

    await waitForNextUpdate()

    expect(result.current[0]).toEqual([
      {
        id: 'subscription-0',
        status: 101,
        url: 'ws://localhost:4000/graphql',
        method: 'GET',
        request: {
          headers: [
            { name: 'RequestHeader1', value: 'Value1' },
            { name: 'RequestHeader2', value: 'Value2' },
          ],
        },
        response: {
          headers: [
            { name: 'ResponseHeader1', value: 'Value1' },
            { name: 'ResponseHeader2', value: 'Value2' },
          ],
        },
        messages: [
          {
            data: {
              command: 'message',
              identifier: {
                channel: 'GraphqlChannel',
                channelId: '1932245fcc6',
              },
              data: {
                query: 'query users { id }',
                variables: {},
                operationName: 'Users',
                action: 'execute',
              },
            },
            time: 1234,
            type: 'send',
          },
        ],
      },
    ])
  })

  it('accepts received messages for rails channel', async () => {
    mockGetHAR.mockResolvedValue({
      entries: [
        {
          _resourceType: 'websocket',
          request: {
            url: 'ws://localhost:4000/graphql',
            method: 'GET',
            headers: [
              { name: 'RequestHeader1', value: 'Value1' },
              { name: 'RequestHeader2', value: 'Value2' },
            ],
          },
          response: {
            status: 101,
            headers: [
              { name: 'ResponseHeader1', value: 'Value1' },
              { name: 'ResponseHeader2', value: 'Value2' },
            ],
          },
          _webSocketMessages: [
            {
              data: JSON.stringify({
                identifier:
                  '{"channel":"GraphqlChannel","channelId":"1932245fcc6"}',
                message: {
                  data: { reviewAdded: { stars: 4, episode: 'CLONE_WARS' } },
                },
              }),
              time: 1234,
              type: 'received',
            },
          ],
        },
      ],
    } as DeepPartial<chrome.devtools.network.HARLog>)

    const { result, waitForNextUpdate } = renderHook(() =>
      useWebSocketNetworkMonitor()
    )

    await waitForNextUpdate()

    expect(result.current[0]).toEqual([
      {
        id: 'subscription-0',
        status: 101,
        url: 'ws://localhost:4000/graphql',
        method: 'GET',
        request: {
          headers: [
            { name: 'RequestHeader1', value: 'Value1' },
            { name: 'RequestHeader2', value: 'Value2' },
          ],
        },
        response: {
          headers: [
            { name: 'ResponseHeader1', value: 'Value1' },
            { name: 'ResponseHeader2', value: 'Value2' },
          ],
        },
        messages: [
          {
            data: {
              identifier: {
                channel: 'GraphqlChannel',
                channelId: '1932245fcc6',
              },
              data: { reviewAdded: { stars: 4, episode: 'CLONE_WARS' } },
            },
            time: 1234,
            type: 'received',
          },
        ],
      },
    ])
  })

  it('only returns messages from entries which filters by url term', async () => {
    mockGetHAR.mockResolvedValue({
      entries: [
        {
          _resourceType: 'websocket',
          request: {
            url: 'ws://localhost:4000/graphql',
            method: 'GET',
            headers: [],
          },
          response: {
            status: 101,
            headers: [],
          },
          _webSocketMessages: [],
        },
        // Ignored as url does not contain "graphql"
        {
          _resourceType: 'websocket',
          request: {
            url: 'ws://localhost:4000/some-other-url',
            method: 'GET',
            headers: [],
          },
          response: {
            status: 101,
            headers: [],
          },
          _webSocketMessages: [],
        },
      ],
    } as DeepPartial<chrome.devtools.network.HARLog>)

    const { result, waitForNextUpdate } = renderHook(() =>
      useWebSocketNetworkMonitor({
        isEnabled: true,
        urlFilter: 'some-other-url',
      })
    )

    await waitForNextUpdate()

    expect(result.current[0]).toEqual([
      {
        id: 'subscription-1',
        status: 101,
        url: 'ws://localhost:4000/some-other-url',
        method: 'GET',
        request: {
          headers: [],
        },
        response: {
          headers: [],
        },
        messages: [],
      },
    ])
  })

  it('does not poll the HAR log when "isEnabled" is false', async () => {
    mockGetHAR.mockResolvedValue({
      entries: [],
    })

    const { rerender, waitForNextUpdate } = renderHook(
      (props) => useWebSocketNetworkMonitor(props),
      { initialProps: { isEnabled: false, urlFilter: 'graphql' } }
    )

    expect(mockGetHAR).not.toHaveBeenCalled()

    rerender({ isEnabled: true, urlFilter: 'graphql' })
    await waitForNextUpdate()

    expect(mockGetHAR).toHaveBeenCalledTimes(1)
  })
})
