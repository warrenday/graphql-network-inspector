import { getSearchResults, ISearchResult } from './searchService'
import { ICompleteNetworkRequest } from '@/helpers/networkHelpers'

const createMockRequest = (overrides: Partial<ICompleteNetworkRequest> = {}): ICompleteNetworkRequest => ({
  id: '1',
  url: 'https://api.example.com/graphql',
  method: 'POST',
  status: 200,
  time: 100,
  request: {
    primaryOperation: {
      operationName: 'GetUser',
      operation: 'query',
    },
    headers: [
      { name: 'content-type', value: 'application/json' },
      { name: 'authorization', value: 'Bearer token123' },
    ],
    headersSize: 50,
    body: [
      {
        query: 'query GetUser { user { id name email } }',
        variables: { userId: '123' },
      },
    ],
    bodySize: 100,
  },
  response: {
    headers: [{ name: 'content-type', value: 'application/json' }],
    headersSize: 30,
    body: JSON.stringify({ data: { user: { id: '123', name: 'John', email: 'john@example.com' } } }),
    bodySize: 80,
  },
  native: {
    networkRequest: {} as chrome.devtools.network.Request,
    webRequest: {} as chrome.webRequest.WebRequestBodyDetails,
  },
  ...overrides,
})

describe('searchService', () => {
  describe('getSearchResults', () => {
    it('returns empty array for empty query', () => {
      const requests = [createMockRequest()]
      const results = getSearchResults('', requests)
      expect(results).toEqual([])
    })

    it('returns empty array for whitespace-only query', () => {
      const requests = [createMockRequest()]
      const results = getSearchResults('   ', requests)
      expect(results).toEqual([])
    })

    it('matches request body content', () => {
      const requests = [createMockRequest()]
      const results = getSearchResults('GetUser', requests)
      expect(results).toHaveLength(1)
      expect(results[0].matches.request).toBe(true)
    })

    it('matches response body content', () => {
      const requests = [createMockRequest()]
      const results = getSearchResults('john@example.com', requests)
      expect(results).toHaveLength(1)
      expect(results[0].matches.response).toBe(true)
    })

    it('matches header content', () => {
      const requests = [createMockRequest()]
      const results = getSearchResults('Bearer token123', requests)
      expect(results).toHaveLength(1)
      expect(results[0].matches.headers).toBe(true)
    })

    it('is case insensitive', () => {
      const requests = [createMockRequest()]
      const results = getSearchResults('GETUSER', requests)
      expect(results).toHaveLength(1)
      expect(results[0].matches.request).toBe(true)
    })

    it('handles special regex characters in search query', () => {
      const request = createMockRequest({
        response: {
          headers: [],
          headersSize: 0,
          body: 'test [bracket] and (paren) with $dollar',
          bodySize: 40,
        },
      })
      const results = getSearchResults('[bracket]', [request])
      expect(results).toHaveLength(1)
      expect(results[0].matches.response).toBe(true)
    })

    it('handles unicode characters', () => {
      const request = createMockRequest({
        response: {
          headers: [],
          headersSize: 0,
          body: JSON.stringify({ data: { message: 'Hello \u4e16\u754c' } }),
          bodySize: 30,
        },
      })
      const results = getSearchResults('\u4e16\u754c', [request])
      expect(results).toHaveLength(1)
    })

    it('filters out non-matching requests', () => {
      const requests = [
        createMockRequest({ id: '1' }),
        createMockRequest({
          id: '2',
          request: {
            ...createMockRequest().request,
            body: [{ query: 'query GetPosts { posts { id } }', variables: {} }],
          },
        }),
      ]
      const results = getSearchResults('GetUser', requests)
      expect(results).toHaveLength(1)
      expect(results[0].networkRequest.id).toBe('1')
    })

    it('handles large datasets efficiently', () => {
      const requests = Array.from({ length: 1000 }, (_, i) =>
        createMockRequest({ id: String(i) })
      )
      const startTime = Date.now()
      const results = getSearchResults('GetUser', requests)
      const duration = Date.now() - startTime
      expect(results).toHaveLength(1000)
      // Should complete in reasonable time (less than 500ms)
      expect(duration).toBeLessThan(500)
    })

    it('handles requests with missing response', () => {
      const request = createMockRequest()
      delete (request as any).response
      const results = getSearchResults('GetUser', [request])
      expect(results).toHaveLength(1)
      expect(results[0].matches.request).toBe(true)
      expect(results[0].matches.response).toBe(false)
    })

    it('handles requests with empty body array', () => {
      const request = createMockRequest({
        request: {
          ...createMockRequest().request,
          body: [],
        },
      })
      const results = getSearchResults('anything', [request])
      expect(results).toHaveLength(0)
    })

    it('returns correct match flags for multiple match types', () => {
      const request = createMockRequest({
        request: {
          ...createMockRequest().request,
          headers: [{ name: 'x-test', value: 'findme' }],
          body: [{ query: 'query findme { test }', variables: {} }],
        },
        response: {
          headers: [],
          headersSize: 0,
          body: 'findme in response',
          bodySize: 20,
        },
      })
      const results = getSearchResults('findme', [request])
      expect(results).toHaveLength(1)
      expect(results[0].matches.request).toBe(true)
      expect(results[0].matches.response).toBe(true)
      expect(results[0].matches.headers).toBe(true)
    })
  })
})
