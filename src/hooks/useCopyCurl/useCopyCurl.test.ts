import { renderHook, act } from '@testing-library/react-hooks'
import { getNetworkCurl } from '@/helpers/curlHelpers'
import useCopy from '../useCopy'
import { useCopyCurl } from './useCopyCurl'

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
})
