import {
  mergeIncrementalChunk,
  mergeResponseChunks,
  formatIncrementalResponseTimeline,
} from './incrementalResponseHelpers'
import { IResponseChunk } from './networkHelpers'

describe('incrementalResponseHelpers', () => {
  describe('mergeIncrementalChunk', () => {
    it('merges data at a specific path', () => {
      const baseResponse = {
        data: {
          user: {
            id: '1',
            name: 'John',
          },
        },
      }

      const chunk = {
        data: { email: 'john@example.com' },
        path: ['user'],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result).toEqual({
        data: {
          user: {
            id: '1',
            name: 'John',
            email: 'john@example.com',
          },
        },
      })
    })

    it('merges data at root when path is empty', () => {
      const baseResponse = {
        data: {
          user: { id: '1' },
        },
      }

      const chunk = {
        data: { extra: 'value' },
        path: [],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result).toEqual({
        data: {
          user: { id: '1' },
          extra: 'value',
        },
      })
    })

    it('merges arrays at a specific path', () => {
      const baseResponse = {
        data: {
          user: {
            id: '1',
            posts: [{ id: 'a' }],
          },
        },
      }

      const chunk = {
        data: [{ id: 'b' }],
        path: ['user', 'posts'],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result).toEqual({
        data: {
          user: {
            id: '1',
            posts: [{ id: 'a' }, { id: 'b' }],
          },
        },
      })
    })

    it('merges errors', () => {
      const baseResponse = {
        data: { user: { id: '1' } },
        errors: [{ message: 'Error 1', path: ['user'] }],
      }

      const chunk = {
        data: { email: 'test@example.com' },
        path: ['user'],
        errors: [{ message: 'Error 2', path: ['user', 'email'] }],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result.errors).toHaveLength(2)
      expect(result.errors[0].message).toBe('Error 1')
      expect(result.errors[1].message).toBe('Error 2')
    })

    it('creates nested structure when path does not exist', () => {
      const baseResponse = {
        data: {},
      }

      const chunk = {
        data: { title: 'Post 1' },
        path: ['user', 'posts', 0],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result).toEqual({
        data: {
          user: {
            posts: [{ title: 'Post 1' }],
          },
        },
      })
    })
  })

  describe('mergeResponseChunks', () => {
    it('returns empty result for no chunks', () => {
      const result = mergeResponseChunks([])

      expect(result).toEqual({
        mergedData: null,
        hasIncrementalData: false,
        chunks: [],
      })
    })

    it('returns single chunk data when only one chunk', () => {
      const chunks: IResponseChunk[] = [
        {
          body: JSON.stringify({ data: { user: { id: '1' } } }),
          timestamp: Date.now(),
          isIncremental: false,
        },
      ]

      const result = mergeResponseChunks(chunks)

      expect(result.hasIncrementalData).toBe(false)
      expect(result.mergedData).toEqual({ data: { user: { id: '1' } } })
    })

    it('merges multiple chunks with incremental array format', () => {
      const chunks: IResponseChunk[] = [
        {
          body: JSON.stringify({
            data: { user: { id: '1', name: 'John' } },
            hasNext: true,
          }),
          timestamp: Date.now(),
          isIncremental: false,
        },
        {
          body: JSON.stringify({
            incremental: [
              {
                data: { email: 'john@example.com' },
                path: ['user'],
              },
            ],
            hasNext: true,
          }),
          timestamp: Date.now(),
          isIncremental: true,
        },
        {
          body: JSON.stringify({
            incremental: [
              {
                data: [{ title: 'Post 1' }],
                path: ['user', 'posts'],
              },
            ],
            hasNext: false,
          }),
          timestamp: Date.now(),
          isIncremental: true,
        },
      ]

      const result = mergeResponseChunks(chunks)

      expect(result.hasIncrementalData).toBe(true)
      expect(result.mergedData).toEqual({
        data: {
          user: {
            id: '1',
            name: 'John',
            email: 'john@example.com',
            posts: [{ title: 'Post 1' }],
          },
        },
        hasNext: true,
      })
    })

    it('merges multiple chunks with single incremental chunk format', () => {
      const chunks: IResponseChunk[] = [
        {
          body: JSON.stringify({
            data: { user: { id: '1' } },
          }),
          timestamp: Date.now(),
          isIncremental: false,
        },
        {
          body: JSON.stringify({
            data: { email: 'john@example.com' },
            path: ['user'],
          }),
          timestamp: Date.now(),
          isIncremental: true,
        },
      ]

      const result = mergeResponseChunks(chunks)

      expect(result.hasIncrementalData).toBe(true)
      expect(result.mergedData).toEqual({
        data: {
          user: {
            id: '1',
            email: 'john@example.com',
          },
        },
      })
    })

    it('handles invalid JSON in chunks gracefully', () => {
      const chunks: IResponseChunk[] = [
        {
          body: JSON.stringify({ data: { user: { id: '1' } } }),
          timestamp: Date.now(),
          isIncremental: false,
        },
        {
          body: 'invalid json',
          timestamp: Date.now(),
          isIncremental: true,
        },
      ]

      const result = mergeResponseChunks(chunks)

      expect(result.hasIncrementalData).toBe(true)
      expect(result.mergedData).toEqual({
        data: { user: { id: '1' } },
      })
    })
  })

  describe('formatIncrementalResponseTimeline', () => {
    it('returns empty array for no chunks', () => {
      const result = formatIncrementalResponseTimeline([])
      expect(result).toEqual([])
    })

    it('formats chunks into timeline format', () => {
      const chunks: IResponseChunk[] = [
        {
          body: JSON.stringify({ data: { user: { id: '1' } } }),
          timestamp: 1000,
          isIncremental: false,
        },
        {
          body: JSON.stringify({
            incremental: [{ data: { email: 'test@example.com' }, path: ['user'] }],
          }),
          timestamp: 2000,
          isIncremental: true,
        },
      ]

      const result = formatIncrementalResponseTimeline(chunks)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        timestamp: 1000,
        isIncremental: false,
        data: { data: { user: { id: '1' } } },
        chunkIndex: 0,
      })
      expect(result[1]).toEqual({
        timestamp: 2000,
        isIncremental: true,
        data: {
          incremental: [{ data: { email: 'test@example.com' }, path: ['user'] }],
        },
        chunkIndex: 1,
      })
    })

    it('handles invalid JSON in timeline', () => {
      const chunks: IResponseChunk[] = [
        {
          body: 'invalid json',
          timestamp: 1000,
          isIncremental: false,
        },
      ]

      const result = formatIncrementalResponseTimeline(chunks)

      expect(result).toHaveLength(1)
      expect(result[0].data).toEqual({})
    })
  })

  describe('edge cases', () => {
    it('handles deeply nested paths', () => {
      const baseResponse = {
        data: {},
      }

      const chunk = {
        data: { value: 'deep' },
        path: ['a', 'b', 'c', 'd', 'e'],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result.data.a.b.c.d.e).toEqual({ value: 'deep' })
    })

    it('handles numeric path indices for arrays', () => {
      const baseResponse = {
        data: {
          users: [{ id: '1' }, { id: '2' }],
        },
      }

      const chunk = {
        data: { name: 'John' },
        path: ['users', 0],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result.data.users[0]).toEqual({ id: '1', name: 'John' })
    })

    it('handles null values in merge', () => {
      const baseResponse = {
        data: { user: { id: '1', name: null } },
      }

      const chunk = {
        data: { name: 'John' },
        path: ['user'],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result.data.user.name).toBe('John')
    })

    it('handles undefined path gracefully', () => {
      const baseResponse = {
        data: { user: { id: '1' } },
      }

      const chunk = {
        data: { email: 'test@example.com' },
        path: undefined as any,
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      // Should not throw and return base response unchanged
      expect(result.data.user).toEqual({ id: '1' })
    })

    it('handles undefined data gracefully', () => {
      const baseResponse = {
        data: { user: { id: '1' } },
      }

      const chunk = {
        data: undefined as any,
        path: ['user'],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      // Should not throw
      expect(result.data.user).toEqual({ id: '1' })
    })

    it('merges extensions from multiple chunks', () => {
      const chunks: IResponseChunk[] = [
        {
          body: JSON.stringify({
            data: { user: { id: '1' } },
            extensions: { tracing: { startTime: 1000 } },
          }),
          timestamp: Date.now(),
          isIncremental: false,
        },
        {
          body: JSON.stringify({
            data: { email: 'test@example.com' },
            path: ['user'],
            extensions: { caching: { ttl: 60 } },
          }),
          timestamp: Date.now(),
          isIncremental: true,
        },
      ]

      const result = mergeResponseChunks(chunks)

      // Extensions from incremental chunks are merged (not deeply merged for nested objects)
      expect(result.mergedData.extensions).toEqual({
        tracing: { startTime: 1000 },
        caching: { ttl: 60 },
      })
    })

    it('handles empty arrays in merge', () => {
      const baseResponse = {
        data: { posts: [] },
      }

      const chunk = {
        data: [{ id: '1' }],
        path: ['posts'],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result.data.posts).toEqual([{ id: '1' }])
    })

    it('handles primitive values at path', () => {
      const baseResponse = {
        data: { user: { count: 5 } },
      }

      const chunk = {
        data: 10,
        path: ['user', 'count'],
      }

      const result = mergeIncrementalChunk(baseResponse, chunk)

      expect(result.data.user.count).toBe(10)
    })
  })
})
