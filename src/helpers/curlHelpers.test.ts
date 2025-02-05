import { getNetworkCurl } from './curlHelpers'
import { ICompleteNetworkRequest } from './networkHelpers'

const mockWebRequest: chrome.webRequest.WebRequestBodyDetails = {
  requestId: '123',
  url: 'https://api.example.com/graphql',
  method: 'GET',
  frameId: 0,
  parentFrameId: -1,
  tabId: -1,
  type: 'xmlhttprequest',
  timeStamp: new Date().getTime(),
  requestBody: null,
}

describe('getNetworkCurl', () => {
  it('should generate correct cURL command for GET request', async () => {
    const mockRequest: ICompleteNetworkRequest = {
      id: '123',
      url: 'https://api.example.com/graphql',
      method: 'GET',
      status: 200,
      time: new Date().getTime(),
      request: {
        primaryOperation: {
          operationName: 'TestQuery',
          operation: 'query',
        },
        headers: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Authorization', value: 'Bearer token123' },
        ],
        headersSize: 100,
        body: [],
        bodySize: 0,
      },
      native: {
        webRequest: mockWebRequest,
      },
    }

    const result = await getNetworkCurl(mockRequest)

    expect(result).toBe(
      'curl \\\n' +
        "  'https://api.example.com/graphql' \\\n" +
        '  -X GET \\\n' +
        "  -H 'Content-Type: application/json' \\\n" +
        "  -H 'Authorization: Bearer token123'"
    )
  })

  it('should generate correct cURL command for POST request with body', async () => {
    const mockRequest: ICompleteNetworkRequest = {
      id: '123',
      url: 'https://api.example.com/graphql',
      method: 'POST',
      status: 200,
      time: new Date().getTime(),
      request: {
        primaryOperation: {
          operationName: 'TestQuery',
          operation: 'query',
        },
        headers: [{ name: 'Content-Type', value: 'application/json' }],
        headersSize: 100,
        body: [
          {
            query: 'query { user { id name } }',
            variables: { userId: '123' },
          },
        ],
        bodySize: 0,
      },
      native: {
        webRequest: mockWebRequest,
      },
    }

    const result = await getNetworkCurl(mockRequest)

    expect(result).toBe(
      'curl \\\n' +
        "  'https://api.example.com/graphql' \\\n" +
        '  -X POST \\\n' +
        "  -H 'Content-Type: application/json' \\\n" +
        '  --data-raw \'{"query":"query { user { id name } }","variables":{"userId":"123"}}\''
    )
  })

  it('should handle requests without headers', async () => {
    const mockRequest: ICompleteNetworkRequest = {
      id: '123',
      url: 'https://api.example.com/graphql',
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

    const result = await getNetworkCurl(mockRequest)

    expect(result).toBe(
      'curl \\\n' + "  'https://api.example.com/graphql' \\\n" + '  -X GET'
    )
  })
})
