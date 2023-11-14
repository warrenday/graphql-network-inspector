import { renderHook } from "@testing-library/react-hooks"
import { useWebSocketNetworkMonitor } from "./useWebSocketNetworkMonitor"
import { getHAR } from "../services/networkMonitor"
import { DeepPartial } from "../types"

jest.mock("../services/networkMonitor")
const mockGetHAR = getHAR as jest.MockedFunction<any>

describe("useWebSocketNetworkMonitor", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("polls the HAR log and returns the websocket requests", async () => {
    mockGetHAR.mockResolvedValue({
      entries: [
        {
          // This is a normal request, not a websocket
          // should not appear in output
        },
        {
          _resourceType: "websocket",
          request: {
            url: "ws://localhost:4000/graphql",
            method: "GET",
            headers: [
              { name: "RequestHeader1", value: "Value1" },
              { name: "RequestHeader2", value: "Value2" },
            ],
          },
          response: {
            status: 101,
            headers: [
              { name: "ResponseHeader1", value: "Value1" },
              { name: "ResponseHeader2", value: "Value2" },
            ],
          },
          _webSocketMessages: [
            {
              data: JSON.stringify({
                type: "data",
                payload: {
                  data: { reviewAdded: { stars: 4, episode: "NEWHOPE" } },
                },
              }),
              opcode: 1,
              time: 1099.4580000406131,
              type: "send",
            },
            {
              data: JSON.stringify({
                type: "data",
                payload: {
                  data: { reviewAdded: { stars: 4, episode: "NEWHOPE" } },
                },
              }),
              opcode: 1,
              time: 1099.4580000406131,
              type: "send",
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
        id: "subscription-1",
        status: 101,
        url: "ws://localhost:4000/graphql",
        method: "GET",
        request: {
          headers: [
            { name: "RequestHeader1", value: "Value1" },
            { name: "RequestHeader2", value: "Value2" },
          ],
        },
        response: {
          headers: [
            { name: "ResponseHeader1", value: "Value1" },
            { name: "ResponseHeader2", value: "Value2" },
          ],
        },
        messages: [
          {
            data: {
              data: {
                reviewAdded: {
                  episode: "NEWHOPE",
                  stars: 4,
                },
              },
            },
            time: 1099.4580000406131,
            type: "send",
          },
          {
            data: {
              data: {
                reviewAdded: {
                  episode: "NEWHOPE",
                  stars: 4,
                },
              },
            },
            time: 1099.4580000406131,
            type: "send",
          },
        ],
      },
    ])
  })

  it('does not poll the HAR log when "isEnabled" is false', async () => {
    mockGetHAR.mockResolvedValue({
      entries: [],
    })

    const { rerender, waitForNextUpdate } = renderHook(
      (props) => useWebSocketNetworkMonitor(props),
      { initialProps: { isEnabled: false } }
    )

    expect(mockGetHAR).not.toHaveBeenCalled()

    rerender({ isEnabled: true })
    await waitForNextUpdate()

    expect(mockGetHAR).toHaveBeenCalledTimes(1)
  })
})
