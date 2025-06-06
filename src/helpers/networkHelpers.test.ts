import { DeepPartial } from 'utility-types'
import {
  IHeader,
  getRequestBody,
  getRequestBodyFromMultipartFormData,
  getRequestBodyFromUrl,
  matchWebAndNetworkRequest,
  urlHasFileExtension,
} from './networkHelpers'
import dedent from 'dedent'

// Unable to test actual gzip decompression as the DecompressionStream is not available in JSDOM
// and the Response object from fetch is missing parts of the steam API
jest.mock('../helpers/gzip', () => ({
  __esModule: true,
  decompress: (val: chrome.webRequest.UploadData[]) => {
    return new Promise((resolve) => {
      resolve(val[0].bytes)
    })
  },
}))

describe('networkHelpers.getRequestBodyFromUrl', () => {
  it('throws an error when no query is found in the URL', () => {
    expect(() => {
      getRequestBodyFromUrl('http://example.com')
    }).toThrow('Could not parse request body from URL')
  })

  it('returns the request body from the URL', () => {
    // Produce a URL with query parameters
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    `
    const operationName = 'GetUser'
    const variables = {
      id: '1',
    }
    const baseUrl = 'https://your-graphql-endpoint.com/graphql'
    const params = new URLSearchParams({
      query,
      variables: JSON.stringify(variables),
      operationName,
    })
    const url = `${baseUrl}?${params.toString()}`

    const body = getRequestBodyFromUrl(url)
    expect(body).toMatchObject({
      query,
      operationName: 'GetUser',
      variables: {
        id: '1',
      },
    })
  })

  it('returns the request body from an encoded URL', () => {
    // Produce a URL with query parameters
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    `
    const operationName = 'GetUser'
    const variables = {
      id: '1',
    }
    const baseUrl = 'https://your-graphql-endpoint.com/graphql'
    // Encode the query parameters
    const params = new URLSearchParams({
      query: encodeURIComponent(query),
      variables: encodeURIComponent(JSON.stringify(variables)),
      operationName: encodeURIComponent(operationName),
    })
    const url = `${baseUrl}?${params.toString()}`

    const body = getRequestBodyFromUrl(url)
    expect(body).toMatchObject({
      query,
      operationName: 'GetUser',
      variables: {
        id: '1',
      },
    })
  })

  it('returns the request body for a persisted query', () => {
    const extensions = {
      persistedQuery: {
        sha256Hash: '12345',
      },
    }
    const variables = {
      id: '1',
    }
    const baseUrl = 'https://your-graphql-endpoint.com/graphql'
    // Encode the query parameters
    const params = new URLSearchParams({
      variables: encodeURIComponent(JSON.stringify(variables)),
      extensions: encodeURIComponent(JSON.stringify(extensions)),
    })
    const url = `${baseUrl}?${params.toString()}`

    const body = getRequestBodyFromUrl(url)
    expect(body).toMatchObject({
      query: '',
      variables: {
        id: '1',
      },
      extensions: {
        persistedQuery: {
          sha256Hash: '12345',
        },
      },
    })
  })

  it('returns the request body for a persisted query with operationName in query parameters', () => {
    const operationName = 'someGqlOperation'

    const extensions = {
      persistedQuery: {
        sha256Hash: '12345',
      },
    }
    const variables = {
      id: '1',
    }

    const baseUrl = 'https://your-graphql-endpoint.com/graphql'
    // Encode the query parameters
    const params = new URLSearchParams({
      operationName,
      variables: encodeURIComponent(JSON.stringify(variables)),
      extensions: encodeURIComponent(JSON.stringify(extensions)),
    })
    const url = `${baseUrl}?${params.toString()}`

    const body = getRequestBodyFromUrl(url)
    expect(body).toMatchObject({
      query: '',
      operationName: 'someGqlOperation',
      variables: {
        id: '1',
      },
      extensions: {
        persistedQuery: {
          sha256Hash: '12345',
        },
      },
    })
  })
})

describe('networkHelpers.matchWebAndNetworkRequest', () => {
  it('matches a web request with a network request', async () => {
    const body = JSON.stringify({
      query: 'query { user }',
    })

    const webRequest: DeepPartial<chrome.webRequest.WebRequestBodyDetails> = {
      url: 'http://example.com',
      method: 'POST',
      requestBody: {
        raw: [{ bytes: new TextEncoder().encode(body) }],
      },
    }
    const webRequestHeaders: IHeader[] = []
    const networkRequest: DeepPartial<chrome.devtools.network.Request> = {
      request: {
        url: 'http://example.com',
        method: 'POST',
        postData: {
          text: body,
        },
        headers: [],
      },
    }

    const match = await matchWebAndNetworkRequest(
      networkRequest as any,
      webRequest as any,
      webRequestHeaders
    )
    expect(match).toBe(true)
  })

  it('does not match request with different URLs', async () => {
    const body = JSON.stringify({
      query: 'query { user }',
    })

    const webRequest: DeepPartial<chrome.webRequest.WebRequestBodyDetails> = {
      url: 'http://example1.com',
      method: 'POST',
      requestBody: {
        raw: [{ bytes: new TextEncoder().encode(body) }],
      },
    }
    const webRequestHeaders: IHeader[] = []
    const networkRequest: DeepPartial<chrome.devtools.network.Request> = {
      request: {
        url: 'http://example2.com',
        method: 'POST',
        postData: {
          text: body,
        },
        headers: [],
      },
    }

    const match = await matchWebAndNetworkRequest(
      networkRequest as any,
      webRequest as any,
      webRequestHeaders
    )
    expect(match).toBe(false)
  })

  it('does not match requests with different methods', async () => {
    const body = JSON.stringify({
      query: 'query { user }',
    })

    const webRequest: DeepPartial<chrome.webRequest.WebRequestBodyDetails> = {
      url: 'http://example1.com?query=query%20%7B%20user%20%7D',
      method: 'GET',
      requestBody: {
        raw: [{ bytes: new TextEncoder().encode(body) }],
      },
    }
    const webRequestHeaders: IHeader[] = []
    const networkRequest: DeepPartial<chrome.devtools.network.Request> = {
      request: {
        url: 'http://example1.com?query=query%20%7B%20user%20%7D',
        method: 'POST',
        postData: {
          text: body,
        },
        headers: [],
      },
    }

    const match = await matchWebAndNetworkRequest(
      networkRequest as any,
      webRequest as any,
      webRequestHeaders
    )
    expect(match).toBe(false)
  })

  it('does not match requests with different bodies', async () => {
    const webRequest: DeepPartial<chrome.webRequest.WebRequestBodyDetails> = {
      url: 'http://example1.com',
      method: 'POST',
      requestBody: {
        raw: [
          {
            bytes: new TextEncoder().encode(
              JSON.stringify({
                query: 'query { user }',
              })
            ),
          },
        ],
      },
    }
    const webRequestHeaders: IHeader[] = []
    const networkRequest: DeepPartial<chrome.devtools.network.Request> = {
      request: {
        url: 'http://example1.com',
        method: 'POST',
        postData: {
          text: JSON.stringify({
            query: 'query { account }',
          }),
        },
        headers: [],
      },
    }

    const match = await matchWebAndNetworkRequest(
      networkRequest as any,
      webRequest as any,
      webRequestHeaders
    )
    expect(match).toBe(false)
  })
})

describe('networkHelpers.getRequestBodyFromMultipartFormData', () => {
  it('returns a graphql request payload from a multipart form data request', () => {
    const boundary = '----WebKitFormBoundaryfEJbArX25kAvAsQX'
    const formDataString =
      '------WebKitFormBoundaryfEJbArX25kAvAsQX\r\nContent-Disposition: form-data; name="operations"\r\n\r\n{"operationName":"singleUpload","variables":{"file":null},"query":"mutation singleUpload($file: Upload!) {\\n  singleUpload(file: $file) {\\n    id\\n    __typename\\n  }\\n}"}\r\n------WebKitFormBoundaryfEJbArX25kAvAsQX\r\nContent-Disposition: form-data; name="map"\r\n\r\n{"1":["variables.file"]}\r\n------WebKitFormBoundaryfEJbArX25kAvAsQX\r\nContent-Disposition: form-data; name="1"; filename="test.txt"\r\nContent-Type: text/plain\r\n\r\ntest\r\n------WebKitFormBoundaryfEJbArX25kAvAsQX--\r\n'

    const result = getRequestBodyFromMultipartFormData(boundary, formDataString)

    expect(result).toMatchObject({
      query: dedent`mutation singleUpload($file: Upload!) {
        singleUpload(file: $file) {
          id
          __typename
        }
      }`,
      operationName: 'singleUpload',
      variables: {
        file: null,
      },
    })
  })
})

describe('networkHelpers.getRequestBody', () => {
  it('returns request body from a multipart form data request', async () => {
    const details: Partial<chrome.webRequest.WebRequestBodyDetails> = {
      requestBody: {
        raw: [
          {
            bytes: new TextEncoder().encode(
              '------WebKitFormBoundaryfEJbArX25kAvAsQX\r\nContent-Disposition: form-data; name="operations"\r\n\r\n{"operationName":"singleUpload","variables":{"file":null},"query":"mutation singleUpload($file: Upload!) {\\n  singleUpload(file: $file) {\\n    id\\n    __typename\\n  }\\n}"}\r\n------WebKitFormBoundaryfEJbArX25kAvAsQX\r\nContent-Disposition: form-data; name="map"\r\n\r\n{"1":["variables.file"]}\r\n------WebKitFormBoundaryfEJbArX25kAvAsQX\r\nContent-Disposition: form-data; name="1"; filename="test.txt"\r\nContent-Type: text/plain\r\n\r\ntest\r\n------WebKitFormBoundaryfEJbArX25kAvAsQX--\r\n'
            ),
          },
        ],
      },
    }

    const headers: IHeader[] = [
      {
        name: 'content-type',
        value:
          'multipart/form-data; boundary=----WebKitFormBoundaryfEJbArX25kAvAsQX',
      },
    ]

    const result = await getRequestBody(details as any, headers)

    expect(result).toEqual(
      JSON.stringify({
        query: dedent`mutation singleUpload($file: Upload!) {
        singleUpload(file: $file) {
          id
          __typename
        }
      }`,
        operationName: 'singleUpload',
        variables: {
          file: null,
        },
      })
    )
  })

  it('returns request body from a compressed request', async () => {
    const details: Partial<chrome.webRequest.WebRequestBodyDetails> = {
      requestBody: {
        raw: [
          {
            bytes: new TextEncoder().encode(
              JSON.stringify({
                query: 'query { user }',
              })
            ),
          },
        ],
      },
    }

    const headers: IHeader[] = [
      {
        name: 'content-type',
        value: 'application/json',
      },
      {
        name: 'content-encoding',
        value: 'deflate',
      },
    ]

    const result = await getRequestBody(details as any, headers)

    expect(result).toEqual(
      JSON.stringify({
        query: 'query { user }',
      })
    )
  })
})

describe('networkHelpers.urlHasFileExtension', () => {
  it('returns true if the url ends with a file extension', () => {
    expect(urlHasFileExtension('http://example.com/test.js')).toBe(true)
    expect(urlHasFileExtension('http://example.com/style.css')).toBe(true)
    expect(urlHasFileExtension('http://example.com/file.png?query=test')).toBe(
      true
    )
  })

  it('returns false if the url does not end with a file extension', () => {
    expect(urlHasFileExtension('http://example.com/test')).toBe(false)
    expect(urlHasFileExtension('http://test.example.com')).toBe(false)
    expect(urlHasFileExtension('http://test.example.com/test')).toBe(false)
  })

  it('returns false for query params containing dots', () => {
    expect(urlHasFileExtension('http://example.com/test?query=query.ts')).toBe(
      false
    )
  })
})
