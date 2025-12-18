import { IResponseChunk } from './networkHelpers'
import { parse } from './safeJson'
import { IIncrementalResponse, IIncrementalDataChunk } from '../types'

/**
 * Get a value at a specific path in an object
 * Path is an array like ['user', 'posts', 0, 'comments']
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
 * Set a value at a specific path in an object
 * Path is an array like ['user', 'posts', 0, 'comments']
 * Merges with existing value if present
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
 * Deep merge two objects, combining arrays and objects
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
 * Merge an incremental chunk into the base response
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
 * Merge all response chunks into a single complete response
 * This handles @defer/@stream incremental delivery format
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
 * Format incremental response for display
 * Shows the progression of data as chunks arrive
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
