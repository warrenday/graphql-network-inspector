/**
 * Incremental Response Helpers
 *
 * This module provides utilities for handling GraphQL incremental delivery
 * responses, which are used by @defer and @stream directives.
 *
 * GraphQL servers can use incremental delivery to send parts of a response
 * as they become available, rather than waiting for the entire response.
 * This improves perceived performance for complex queries.
 *
 * The response format follows the GraphQL-over-HTTP specification:
 * - Initial response: Contains the initial data and hasNext: true
 * - Subsequent responses: Contains incremental data at specific paths
 * - Final response: Contains hasNext: false
 *
 * @see https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md
 */

import { IResponseChunk } from './networkHelpers'
import { parse } from './safeJson'
import { IIncrementalResponse, IIncrementalDataChunk } from '../types'

/**
 * Get a value at a specific path in an object.
 *
 * @param obj - The object to traverse
 * @param path - Array of keys/indices representing the path (e.g., ['user', 'posts', 0])
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * getValueAtPath({ user: { posts: [{ id: 1 }] } }, ['user', 'posts', 0, 'id']) // returns 1
 */
function getValueAtPath(obj: any, path: (string | number)[]): any {
  let current = obj
  for (const key of path) {
    if (current == null) return undefined
    current = current[key]
  }
  return current
}

/**
 * Set a value at a specific path in an object, creating intermediate
 * objects/arrays as needed. Merges with existing value if present.
 *
 * @param obj - The object to modify (mutated in place)
 * @param path - Array of keys/indices representing the path (e.g., ['user', 'posts', 0])
 * @param value - The value to set at the path
 *
 * @example
 * const obj = { data: {} }
 * setValueAtPath(obj, ['data', 'user', 'name'], 'John')
 * // obj is now { data: { user: { name: 'John' } } }
 */
function setValueAtPath(obj: any, path: (string | number)[], value: any): void {
  if (path.length === 0) {
    return
  }

  let current = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!(key in current)) {
      // Create array or object based on next key type
      const nextKey = path[i + 1]
      current[key] = typeof nextKey === 'number' ? [] : {}
    }
    current = current[key]
  }

  const lastKey = path[path.length - 1]
  // Deep merge with existing value
  const existingValue = current[lastKey]
  if (existingValue !== undefined) {
    current[lastKey] = deepMerge(existingValue, value)
  } else {
    current[lastKey] = value
  }
}

/**
 * Deep merge two values, combining arrays and objects recursively.
 *
 * - Arrays are concatenated (target + source)
 * - Objects are merged recursively
 * - Primitives: source overwrites target
 * - null/undefined: returns the other value
 *
 * @param target - The base value to merge into
 * @param source - The value to merge from
 * @returns The merged result
 *
 * @example
 * deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } })
 * // returns { a: 1, b: { c: 2, d: 3 } }
 *
 * deepMerge([1, 2], [3, 4]) // returns [1, 2, 3, 4]
 */
function deepMerge(target: any, source: any): any {
  if (source === null || source === undefined) {
    return target
  }

  if (target === null || target === undefined) {
    return source
  }

  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source]
  }

  if (typeof target === 'object' && typeof source === 'object') {
    const result = { ...target }
    for (const key in source) {
      if (key in result) {
        result[key] = deepMerge(result[key], source[key])
      } else {
        result[key] = source[key]
      }
    }
    return result
  }

  return source
}

/**
 * Merge an incremental chunk into the base response.
 *
 * Handles the GraphQL incremental delivery format where chunks specify
 * a path to indicate where their data should be merged in the response tree.
 *
 * @param baseResponse - The current accumulated response
 * @param chunk - The incremental chunk to merge (contains path, data, errors, extensions)
 * @returns A new response object with the chunk merged in
 *
 * @example
 * const base = { data: { user: { id: '1' } } }
 * const chunk = { data: { name: 'John' }, path: ['user'] }
 * mergeIncrementalChunk(base, chunk)
 * // returns { data: { user: { id: '1', name: 'John' } } }
 */
export function mergeIncrementalChunk(
  baseResponse: any,
  chunk: IIncrementalDataChunk
): any {
  const result = { ...baseResponse }

  // If chunk has a path, merge data at that path
  if (chunk.path !== undefined && chunk.data !== undefined) {
    if (chunk.path.length === 0) {
      // Path is empty, merge at data root
      result.data = deepMerge(result.data || {}, chunk.data)
    } else {
      // Path is relative to the data field in GraphQL responses
      // So we need to prepend 'data' to the path
      const fullPath = ['data', ...chunk.path]
      setValueAtPath(result, fullPath, chunk.data)
    }
  }

  // Merge errors if present
  if (chunk.errors) {
    result.errors = result.errors
      ? [...result.errors, ...chunk.errors]
      : chunk.errors
  }

  // Merge extensions if present
  if (chunk.extensions) {
    result.extensions = result.extensions
      ? { ...result.extensions, ...chunk.extensions }
      : chunk.extensions
  }

  return result
}

/**
 * Merge all response chunks into a single complete response.
 *
 * This handles the @defer/@stream incremental delivery format,
 * processing chunks in order and merging them into a final response.
 *
 * Supports multiple chunk formats:
 * - `incremental` array format: chunks contain an incremental array with multiple updates
 * - Single chunk format: chunks contain path and data directly
 * - Full response format: chunks are complete responses to merge
 *
 * @param chunks - Array of response chunks to merge
 * @returns Object containing:
 *   - mergedData: The final merged response object
 *   - hasIncrementalData: true if there were multiple chunks
 *   - chunks: The original chunks array (for timeline display)
 */
export function mergeResponseChunks(chunks: IResponseChunk[]): {
  mergedData: any
  hasIncrementalData: boolean
  chunks: IResponseChunk[]
} {
  if (chunks.length === 0) {
    return {
      mergedData: null,
      hasIncrementalData: false,
      chunks: [],
    }
  }

  // Parse the first chunk as base response
  const firstChunkData = parse<any>(chunks[0].body)
  let mergedData = firstChunkData || {}

  const hasIncrementalData = chunks.length > 1

  // Process subsequent chunks
  for (let i = 1; i < chunks.length; i++) {
    const chunkData = parse<IIncrementalResponse | IIncrementalDataChunk>(
      chunks[i].body
    )

    if (!chunkData) continue

    // Handle incremental response format (with incremental array)
    if ('incremental' in chunkData && chunkData.incremental) {
      for (const incrementalChunk of chunkData.incremental) {
        mergedData = mergeIncrementalChunk(mergedData, incrementalChunk)
      }
    }
    // Handle single incremental chunk format
    else if ('path' in chunkData) {
      mergedData = mergeIncrementalChunk(
        mergedData,
        chunkData as IIncrementalDataChunk
      )
    }
    // Handle full response format (merge everything)
    else {
      mergedData = deepMerge(mergedData, chunkData)
    }
  }

  return {
    mergedData,
    hasIncrementalData,
    chunks,
  }
}

/**
 * Format incremental response chunks for timeline display.
 *
 * Creates a timeline view showing how the response was built up
 * from multiple chunks, useful for debugging @defer/@stream performance.
 *
 * @param chunks - Array of response chunks
 * @returns Array of timeline entries with parsed data and metadata
 */
export function formatIncrementalResponseTimeline(
  chunks: IResponseChunk[]
): Array<{
  timestamp: number
  isIncremental: boolean
  data: any
  chunkIndex: number
}> {
  const timeline: Array<{
    timestamp: number
    isIncremental: boolean
    data: any
    chunkIndex: number
  }> = []

  for (let i = 0; i < chunks.length; i++) {
    const chunkData = parse(chunks[i].body)
    timeline.push({
      timestamp: chunks[i].timestamp,
      isIncremental: chunks[i].isIncremental,
      data: chunkData || {},
      chunkIndex: i,
    })
  }

  return timeline
}
