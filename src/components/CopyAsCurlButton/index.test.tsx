import { render, fireEvent } from "@testing-library/react"
import { CopyAsCurlButton } from "./"
import { useCopyCurl } from "@/hooks/useCopyCurl/useCopyCurl"

jest.mock("@/hooks/useCopyCurl/useCopyCurl")

describe("CopyAsCurlButton", () => {
  const mockCopyAsCurl = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCopyCurl as jest.Mock).mockReturnValue({
      copyAsCurl: mockCopyAsCurl,
      isCopied: false
    })
  })

  it("renders with correct label", () => {
    const { getByTestId } = render(<CopyAsCurlButton />)
    expect(getByTestId("copy-button")).toHaveTextContent("Copy as cURL")
  })

  it("calls copyAsCurl when clicked with network request", () => {
    const mockRequest = {
      id: '123',
      url: 'https://example.com',
      method: 'GET',
      status: 200,
      time: new Date().getTime(),
      request: {
        primaryOperation: {
          operationName: 'TestQuery',
          operation: 'query'
        },
        headers: [],
        headersSize: 100,
        body: [],
        bodySize: 0
      },
      native: {
        webRequest: {
          requestId: '123',
          url: 'https://example.com',
          method: 'GET',
          frameId: 0,
          parentFrameId: -1,
          tabId: -1,
          type: 'xmlhttprequest',
          timeStamp: new Date().getTime(),
          requestBody: null
        }
      }
    }
    const { getByTestId } = render(<CopyAsCurlButton networkRequest={mockRequest} />)
    
    fireEvent.click(getByTestId("copy-button"))
    expect(mockCopyAsCurl).toHaveBeenCalledWith(mockRequest)
  })

  it("doesn't call copyAsCurl when clicked without network request", () => {
    const { getByTestId } = render(<CopyAsCurlButton />)
    
    fireEvent.click(getByTestId("copy-button"))
    expect(mockCopyAsCurl).not.toHaveBeenCalled()
  })
}) 