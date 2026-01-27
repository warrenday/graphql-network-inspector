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
  const mockRequest = (overrides = {}): ICompleteNetworkRequest => ({
    id: '123',
    url: 'https://api.example.com/graphql',
    method: 'POST',
    status: 200,
    time: Date.now(),
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
          url: 'https://api.example.com/graphql',
          method: 'POST',
          headers: [
            { name: 'content-type', value: 'application/json' },
            { name: ':authority', value: 'api.example.com' },
            { name: 'authorization', value: 'Bearer token123' },
          ],
          postData: {
            text: JSON.stringify({
              query: 'query { test }',
              variables: {},
            }),
          },
        },
      } as chrome.devtools.network.Request,
    },
    ...overrides,
  })

  it('handles basic POST request', async () => {
    const curl = await getNetworkCurl(mockRequest())
    expect(curl).toContain("curl 'https://api.example.com/graphql'")
    expect(curl).toContain("-H 'content-type: application/json'")
    expect(curl).toContain("-H 'authorization: Bearer token123'")
    expect(curl).toContain('--data-raw')
  })

  it('excludes pseudo headers', async () => {
    const req = mockRequest({
      native: {
        networkRequest: {
          request: {
            headers: [
              { name: ':authority', value: 'api.example.com' },
              { name: 'content-type', value: 'application/json' },
            ],
          },
        },
      },
    })
    const curl = await getNetworkCurl(req)
    expect(curl).not.toContain(':authority')
    expect(curl).toContain('content-type')
  })

  it('handles unicode characters in body', async () => {
    const req = mockRequest({
      native: {
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
            method: 'POST',
            headers: [{ name: 'content-type', value: 'application/json' }],
            postData: {
              text: JSON.stringify({ query: 'query { test! }' }),
            },
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
    })
    const curl = await getNetworkCurl(req)
    expect(curl).toBe(
      "curl 'https://api.example.com/graphql' \\\n" +
        "  -H 'content-type: application/json' \\\n" +
        '  -X POST \\\n' +
        '  --data-raw \'{"query":"query { test! }"}\''
    )
  })

  it('should generate correct cURL command for GraphQL request', async () => {
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
        headers: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Authorization', value: 'Bearer token123' },
        ],
        headersSize: 100,
        body: [],
        bodySize: 0,
      },
      native: {
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
            method: 'POST',
            headers: [
              { name: 'Content-Type', value: 'application/json' },
              { name: 'Authorization', value: 'Bearer token123' },
            ],
            postData: {
              text: JSON.stringify({
                query: 'query TestQuery { test }',
                variables: {},
              }),
            },
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

    const result = await getNetworkCurl(mockRequest)
    expect(result).toBe(
      "curl 'https://api.example.com/graphql' \\\n" +
        "  -H 'Content-Type: application/json' \\\n" +
        "  -H 'Authorization: Bearer token123' \\\n" +
        '  -X POST \\\n' +
        '  --data-raw \'{"query":"query TestQuery { test }","variables":{}}\''
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
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
            method: 'POST',
            headers: [
              { name: 'content-type', value: 'application/json' },
              { name: ':authority', value: 'api.example.com' },
              { name: 'authorization', value: 'Bearer token123' },
            ],
            postData: {
              text: JSON.stringify({
                query: 'query { user { id name } }',
                variables: { userId: '123' },
              }),
            },
          },
        } as chrome.devtools.network.Request,
      },
    }

    const result = await getNetworkCurl(mockRequest)
    expect(result).toBe(
      "curl 'https://api.example.com/graphql' \\\n" +
        "  -H 'content-type: application/json' \\\n" +
        "  -H 'authorization: Bearer token123' \\\n" +
        '  -X POST \\\n' +
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
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
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

    const result = await getNetworkCurl(mockRequest)
    expect(result).toBe("curl 'https://api.example.com/graphql'")
  })

  it('should generate correct cURL command for POST request', async () => {
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
        headers: [],
        headersSize: 0,
        body: [],
        bodySize: 0,
      },
      native: {
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
            method: 'POST',
            headers: [
              { name: 'content-type', value: 'application/json' },
              { name: ':authority', value: 'api.example.com' },
              { name: 'authorization', value: 'Bearer token123' },
            ],
            postData: {
              text: JSON.stringify({
                query: 'query { test }',
                variables: {},
              }),
            },
          },
        } as chrome.devtools.network.Request,
      },
    }

    const result = await getNetworkCurl(mockRequest)
    expect(result).toBe(
      "curl 'https://api.example.com/graphql' \\\n" +
        "  -H 'content-type: application/json' \\\n" +
        "  -H 'authorization: Bearer token123' \\\n" +
        '  -X POST \\\n' +
        '  --data-raw \'{"query":"query { test }","variables":{}}\''
    )
  })

  it('should handle special characters in header values', async () => {
    const req = mockRequest({
      native: {
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
            method: 'POST',
            headers: [
              { name: 'content-type', value: 'application/json' },
              { name: 'x-custom', value: "value with 'quotes' and \"double\"" },
            ],
            postData: {
              text: '{}',
            },
          },
        } as chrome.devtools.network.Request,
      },
    })
    const curl = await getNetworkCurl(req)
    expect(curl).toContain("-H 'x-custom: value with 'quotes' and \"double\"'")
  })

  it('should return empty string when no Chrome request data', async () => {
    const req = mockRequest({
      native: {
        networkRequest: undefined,
      },
    })
    const curl = await getNetworkCurl(req)
    expect(curl).toBe('')
  })

  it('should handle URL with query parameters', async () => {
    const req = mockRequest({
      native: {
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql?foo=bar&baz=qux',
            method: 'GET',
            headers: [],
          },
        } as unknown as chrome.devtools.network.Request,
      },
    })
    const curl = await getNetworkCurl(req)
    expect(curl).toBe("curl 'https://api.example.com/graphql?foo=bar&baz=qux'")
  })

  it('should handle body with newlines', async () => {
    const req = mockRequest({
      native: {
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
            method: 'POST',
            headers: [{ name: 'content-type', value: 'application/json' }],
            postData: {
              text: JSON.stringify({
                query: `query {
                  user {
                    id
                  }
                }`,
              }),
            },
          },
        } as chrome.devtools.network.Request,
      },
    })
    const curl = await getNetworkCurl(req)
    expect(curl).toContain('--data-raw')
    // Newlines should be preserved in JSON
    expect(curl).toContain('\\n')
  })

  it('should exclude content-length header', async () => {
    const req = mockRequest({
      native: {
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
            method: 'POST',
            headers: [
              { name: 'content-type', value: 'application/json' },
              { name: 'content-length', value: '100' },
            ],
            postData: {
              text: '{}',
            },
          },
        } as chrome.devtools.network.Request,
      },
    })
    const curl = await getNetworkCurl(req)
    expect(curl).not.toContain('content-length')
  })

  it('should exclude accept-encoding header', async () => {
    const req = mockRequest({
      native: {
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
            method: 'POST',
            headers: [
              { name: 'content-type', value: 'application/json' },
              { name: 'accept-encoding', value: 'gzip, deflate, br' },
            ],
            postData: {
              text: '{}',
            },
          },
        } as chrome.devtools.network.Request,
      },
    })
    const curl = await getNetworkCurl(req)
    expect(curl).not.toContain('accept-encoding')
  })

  it('should handle empty postData', async () => {
    const req = mockRequest({
      native: {
        networkRequest: {
          request: {
            url: 'https://api.example.com/graphql',
            method: 'POST',
            headers: [{ name: 'content-type', value: 'application/json' }],
            postData: undefined,
          },
        } as chrome.devtools.network.Request,
      },
    })
    const curl = await getNetworkCurl(req)
    expect(curl).not.toContain('--data-raw')
  })
})
