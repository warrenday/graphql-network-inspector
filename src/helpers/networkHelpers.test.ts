import { DeepPartial } from 'utility-types'
import { TextEncoder } from 'util'
import {
  IHeader,
  getRequestBodyFromUrl,
  matchWebAndNetworkRequest,
} from './networkHelpers'

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
})

describe('networkHelpers.matchWebAndNetworkRequest', () => {
  it('matches a web request with a network request', () => {
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

    const match = matchWebAndNetworkRequest(
      networkRequest as any,
      webRequest as any,
      webRequestHeaders
    )
    expect(match).toBe(true)
  })

  it('does not match request with different URLs', () => {
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

    const match = matchWebAndNetworkRequest(
      networkRequest as any,
      webRequest as any,
      webRequestHeaders
    )
    expect(match).toBe(false)
  })

  it('does not match requests with different methods', () => {
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

    const match = matchWebAndNetworkRequest(
      networkRequest as any,
      webRequest as any,
      webRequestHeaders
    )
    expect(match).toBe(false)
  })

  it('does not match requests with different bodies', () => {
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

    const match = matchWebAndNetworkRequest(
      networkRequest as any,
      webRequest as any,
      webRequestHeaders
    )
    expect(match).toBe(false)
  })

  it('does not match requests with different headers', () => {
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
    const webRequestHeaders: IHeader[] = [
      {
        name: 'Authorization',
        value: '123',
      },
      {
        name: 'Content-Type',
        value: 'application/json',
      },
    ]
    const networkRequest: DeepPartial<chrome.devtools.network.Request> = {
      request: {
        url: 'http://example.com',
        method: 'POST',
        postData: {
          text: body,
        },
        headers: [
          {
            name: 'Authorization',
            value: '123',
          },
          {
            name: 'Content-Type',
            value: 'application/graphql',
          },
        ],
      },
    }

    const match = matchWebAndNetworkRequest(
      networkRequest as any,
      webRequest as any,
      webRequestHeaders
    )
    expect(match).toBe(false)
  })
})
