import { generateCurlCommand } from './curlHelpers'
import { ICompleteNetworkRequest } from './networkHelpers'

describe('curlHelpers', () => {
  const createMockRequest = (overrides = {}): ICompleteNetworkRequest => ({
    id: '1',
    status: 200,
    url: 'http://example.com/graphql',
    time: 100,
    method: 'POST',
    request: {
      headers: [{ name: 'Authorization', value: 'Bearer token123' }],
      body: [
        {
          query: 'query { user { id } }',
          variables: { userId: 123 },
        },
      ],
      primaryOperation: {
        operationName: 'GetUser',
        operation: 'query',
      },
      headersSize: 0,
      bodySize: 0,
    },
    response: {
      headers: [],
      body: '',
      bodySize: 0,
      headersSize: 0,
    },
    native: {
      webRequest: {} as chrome.webRequest.WebRequestBodyDetails,
      networkRequest: undefined,
    },
    ...overrides,
  })

  describe('generateCurlCommand', () => {
    it('should generate correct curl command for single query', () => {
      const request = createMockRequest()
      const result = generateCurlCommand(request)

      expect(result).toContain('curl')
      expect(result).toContain("'http://example.com/graphql'")
      expect(result).toContain("-H 'Authorization: Bearer token123'")
      expect(result).toContain("-H 'Content-Type: application/json'")
      expect(result).toContain('--data-raw')
      expect(result).toContain('--compressed')
    })

    it('should handle special characters in headers', () => {
      const request = createMockRequest({
        request: {
          headers: [{ name: 'X-Test', value: "value with 'quotes'" }],
          body: [{ query: 'query { user { id } }' }],
          primaryOperation: { operationName: '', operation: 'query' },
          headersSize: 0,
          bodySize: 0,
        },
      })

      const result = generateCurlCommand(request)
      expect(result).toContain("-H 'X-Test: value with '\\''quotes'\\'''")
    })

    it('should handle batched queries', () => {
      const request = createMockRequest({
        request: {
          headers: [],
          body: [
            { query: 'query { user { id } }' },
            { query: 'query { posts { id } }' },
          ],
          primaryOperation: { operationName: '', operation: 'query' },
          headersSize: 0,
          bodySize: 0,
        },
      })

      const result = generateCurlCommand(request)
      const body = result.match(/--data-raw '(.+?)'/)?.[1]
      const parsed = JSON.parse(body?.replace(/\\'/g, "'") ?? '')
      expect(parsed).toHaveLength(2)
      expect(parsed[0].query).toBe('query { user { id } }')
      expect(parsed[1].query).toBe('query { posts { id } }')
    })

    it('should not duplicate content-type header', () => {
      const request = createMockRequest({
        request: {
          headers: [{ name: 'Content-Type', value: 'application/json' }],
          body: [{ query: 'query { user { id } }' }],
          primaryOperation: { operationName: '', operation: 'query' },
          headersSize: 0,
          bodySize: 0,
        },
      })

      const result = generateCurlCommand(request)
      const contentTypeCount = (result.match(/Content-Type/g) || []).length
      expect(contentTypeCount).toBe(1)
    })

    it('should respect method option', () => {
      const request = createMockRequest()
      const result = generateCurlCommand(request, { method: 'GET' })

      expect(result).toContain('-X GET')
      expect(result).not.toContain('--data-raw')
    })
  })

  describe('headers handling', () => {
    it('should handle complex accept headers', () => {
      const request = createMockRequest({
        request: {
          headers: [
            {
              name: 'accept',
              value:
                'application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed',
            },
          ],
          body: [{ query: 'query { user { id } }' }],
          primaryOperation: { operationName: '', operation: 'query' },
          headersSize: 0,
          bodySize: 0,
        },
      })

      const result = generateCurlCommand(request)
      expect(result).toContain(
        "-H 'accept: application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed'"
      )
    })

    it('should handle authorization bearer token', () => {
      const token =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmYWtlIjoidGVzdCJ9.invalid-signature'
      const request = createMockRequest({
        request: {
          headers: [
            {
              name: 'authorization',
              value: `Bearer ${token}`,
            },
          ],
          body: [{ query: 'query { user { id } }' }],
          primaryOperation: { operationName: '', operation: 'query' },
          headersSize: 0,
          bodySize: 0,
        },
      })

      const result = generateCurlCommand(request)
      expect(result).toContain(`-H 'authorization: Bearer ${token}'`)
    })

    it('should handle multiple browser-specific headers', () => {
      const request = createMockRequest({
        request: {
          headers: [
            { name: 'accept-language', value: 'en-US,en;q=0.9' },
            { name: 'dnt', value: '1' },
            { name: 'origin', value: 'http://localhost:3000' },
            {
              name: 'sec-ch-ua',
              value: '"Not A(Brand";v="8", "Chromium";v="132"',
            },
            { name: 'sec-ch-ua-mobile', value: '?0' },
            { name: 'sec-ch-ua-platform', value: '"macOS"' },
            { name: 'sec-fetch-dest', value: 'empty' },
            {
              name: 'user-agent',
              value:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
          ],
          body: [{ query: 'query { user { id } }' }],
          primaryOperation: { operationName: '', operation: 'query' },
          headersSize: 0,
          bodySize: 0,
        },
      })

      const result = generateCurlCommand(request)

      // Verify each header is properly formatted
      expect(result).toContain("-H 'accept-language: en-US,en;q=0.9'")
      expect(result).toContain("-H 'dnt: 1'")
      expect(result).toContain("-H 'origin: http://localhost:3000'")
      expect(result).toContain(
        '-H \'sec-ch-ua: "Not A(Brand";v="8", "Chromium";v="132"\''
      )
      expect(result).toContain("-H 'sec-ch-ua-mobile: ?0'")
      expect(result).toContain('-H \'sec-ch-ua-platform: "macOS"\'')
      expect(result).toContain("-H 'sec-fetch-dest: empty'")
      expect(result).toContain(
        "-H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'"
      )
    })

    it('should handle complex GraphQL query with variables', () => {
      const request = createMockRequest({
        request: {
          headers: [{ name: 'Content-Type', value: 'application/json' }],
          body: [
            {
              operationName: 'ProductSharedInformation',
              query:
                'query ProductSharedInformation($productId: Int!) { product { get(input: {productId: $productId}) { ... } } }',
              variables: { productId: null },
            },
          ],
          primaryOperation: {
            operationName: 'ProductSharedInformation',
            operation: 'query',
          },
          headersSize: 0,
          bodySize: 0,
        },
      })

      const result = generateCurlCommand(request)

      expect(result).toContain('"operationName":"ProductSharedInformation"')
      expect(result).toContain('"variables":{"productId":null}')
      expect(result).toContain(
        'query ProductSharedInformation($productId: Int!)'
      )
    })
  })
})
