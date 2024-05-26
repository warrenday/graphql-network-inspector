import {
  getRequestBodyFromUrl,
  matchWebAndNetworkRequest,
} from './networkHelpers'

describe('networkHelpers.getRequestBodyFromUrl', () => {
  it('throws an error when no query is found in the URL', () => {
    expect(() => {
      getRequestBodyFromUrl('http://example.com')
    }).toThrow('No query found in URL')
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
      query: 'query User($id: String!) { user(id: $id) { name } }',
      operationName: 'MyQuery',
      variables: {
        id: '1',
      },
    })
  })
})

describe('networkHelpers.matchWebAndNetworkRequest', () => {
  it('matches a web request with a network request', () => {
    const webRequest = {
      url: 'http://example.com',
      method: 'GET',
    }
    const networkRequest = {
      request: {
        url: 'http://example.com',
        method: 'GET',
      },
    }

    const match = matchWebAndNetworkRequest(webRequest, networkRequest)
    expect(match).toBe(true)
  })

  it('does not match request with different URLs', () => {
    const webRequest = {
      url: 'http://example.com',
      method: 'GET',
    }
    const networkRequest = {
      request: {
        url: 'http://example.com/other',
        method: 'GET',
      },
    }

    const match = matchWebAndNetworkRequest(webRequest, networkRequest)
    expect(match).toBe(false)
  })

  it('does not match requests with different methods', () => {
    const webRequest = {
      url: 'http://example.com',
      method: 'GET',
    }
    const networkRequest = {
      request: {
        url: 'http://example.com',
        method: 'POST',
      },
    }

    const match = matchWebAndNetworkRequest(webRequest, networkRequest)
    expect(match).toBe(false)
  })

  it('does not match requests with different bodies', () => {
    const webRequest = {
      url: 'http://example.com',
      method: 'GET',
    }
    const networkRequest = {
      request: {
        url: 'http://example.com',
        method: 'GET',
        body: 'body',
      },
    }

    const match = matchWebAndNetworkRequest(webRequest, networkRequest)
    expect(match).toBe(false)
  })

  it('does not match requests with different headers', () => {
    const webRequest = {
      url: 'http://example.com',
      method: 'GET',
    }
    const networkRequest = {
      request: {
        url: 'http://example.com',
        method: 'GET',
        headers: 'headers',
      },
    }

    const match = matchWebAndNetworkRequest(webRequest, networkRequest)
    expect(match).toBe(false)
  })
})
