import { renderHook, act } from '@testing-library/react-hooks'
import { getNetworkCurl } from '@/helpers/curlHelpers'
import useCopy from '../useCopy'
import { useCopyCurl } from './useCopyCurl'
import { ICompleteNetworkRequest } from '@/helpers/networkHelpers'

// Mock dependencies
jest.mock('@/helpers/curlHelpers')
jest.mock('../useCopy')

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
    headersSize: 0,
    body: [],
    bodySize: 0,
  },
  native: {
    networkRequest: {
      request: {
        url: 'https://example.com',
        method: 'GET',
        headers: [],
      },
      getContent: () => {},
      startedDateTime: new Date(),
      time: 0,
      response: {},
      _resourceType: 'fetch',
      cache: {},
      timings: {},
    } as unknown as chrome.devtools.network.Request,
  },
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
    ;(getNetworkCurl as jest.Mock).mockResolvedValue('curl example.com')
  })

  it('should handle null network request gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
    const { result } = renderHook(() => useCopyCurl())

    await act(async () => {
      await result.current.copyAsCurl(null as any)
    })

    expect(consoleSpy).toHaveBeenCalledWith('No network request data available')
    expect(getNetworkCurl).not.toHaveBeenCalled()
    expect(mockCopy).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should expose isCopied from useCopy hook', () => {
    const { result } = renderHook(() => useCopyCurl())
    expect(result.current.isCopied).toBe(mockIsCopied)
  })

  it('should copy curl command when network request is provided', async () => {
    const { result } = renderHook(() => useCopyCurl())

    await act(async () => {
      await result.current.copyAsCurl(mockNetworkRequest)
    })

    expect(getNetworkCurl).toHaveBeenCalledWith(mockNetworkRequest)
    expect(mockCopy).toHaveBeenCalledWith('curl example.com')
  })
})
