import { renderHook, act } from '@testing-library/react-hooks'
import { useCopyCurl } from '../useCopyCurl'
import { getChromeNetworkCurl } from '@/helpers/curlHelpers'
import useCopy from '../useCopy'
import { ICompleteNetworkRequest } from '@/helpers/networkHelpers'

// Mock dependencies
jest.mock('@/helpers/curlHelpers')
jest.mock('../useCopy')

const mockWebRequest: chrome.webRequest.WebRequestBodyDetails = {
  requestId: '123',
  url: 'https://example.com',
  method: 'GET',
  frameId: 0,
  parentFrameId: -1,
  tabId: -1,
  type: 'xmlhttprequest',
  timeStamp: new Date().getTime(),
  requestBody: null,
}

describe('useCopyCurl', () => {
  const mockCopy = jest.fn()
  const mockIsCopied = false

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCopy as jest.Mock).mockReturnValue({
      copy: mockCopy,
      isCopied: mockIsCopied,
    })
    ;(getChromeNetworkCurl as jest.Mock).mockResolvedValue('curl example.com')
  })

  it('should copy curl command when valid network request is provided', async () => {
    const { result } = renderHook(() => useCopyCurl())

    const mockNetworkRequest: ICompleteNetworkRequest = {
      id: '123',
      url: 'https://example.com',
      method: 'GET',
      status: 200,
      time: new Date().getTime(),
      request: {
        primaryOperation: {
          operationName: 'TestQuery',
          operation: 'query',
        },
        headers: [],
        headersSize: 100,
        body: [],
        bodySize: 0,
      },
      native: {
        webRequest: mockWebRequest,
      },
    }

    await act(async () => {
      await result.current.copyAsCurl(mockNetworkRequest)
    })

    expect(getChromeNetworkCurl).toHaveBeenCalledWith('123', mockNetworkRequest)
    expect(mockCopy).toHaveBeenCalledWith('curl example.com')
  })

  it('should handle null network request gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    const { result } = renderHook(() => useCopyCurl())

    await act(async () => {
      await result.current.copyAsCurl(null as any)
    })

    expect(consoleSpy).toHaveBeenCalledWith('No network request data available')
    expect(getChromeNetworkCurl).not.toHaveBeenCalled()
    expect(mockCopy).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should handle errors when generating curl command', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(getChromeNetworkCurl as jest.Mock).mockRejectedValue(
      new Error('Failed to generate')
    )

    const { result } = renderHook(() => useCopyCurl())

    const mockNetworkRequest: ICompleteNetworkRequest = {
      id: '123',
      url: 'https://example.com',
      method: 'GET',
      status: 200,
      time: new Date().getTime(),
      request: {
        primaryOperation: {
          operationName: 'TestQuery',
          operation: 'query',
        },
        headers: [],
        headersSize: 100,
        body: [],
        bodySize: 0,
      },
      native: {
        webRequest: mockWebRequest,
      },
    }

    await act(async () => {
      await result.current.copyAsCurl(mockNetworkRequest)
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to generate cURL command:',
      expect.any(Error)
    )
    expect(mockCopy).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should expose isCopied from useCopy hook', () => {
    const { result } = renderHook(() => useCopyCurl())
    expect(result.current.isCopied).toBe(mockIsCopied)
  })
})
