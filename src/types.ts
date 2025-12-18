import { ExecutionResult } from "graphql"

export type Maybe<T> = T | null | undefined

export interface IResponseBody
  extends ExecutionResult<unknown, IApolloServerExtensions> {}

export interface IApolloServerExtensions {
  tracing?: IApolloServerTracing
}

// Incremental delivery (defer/stream) support
export interface IIncrementalDataChunk {
  data?: unknown
  path?: (string | number)[]
  label?: string
  errors?: Array<{
    message: string
    path?: (string | number)[]
  }>
  extensions?: IApolloServerExtensions
  hasNext?: boolean
}

export interface IIncrementalResponse {
  data?: unknown
  errors?: Array<{
    message: string
    path?: (string | number)[]
  }>
  extensions?: IApolloServerExtensions
  hasNext: boolean
  incremental?: IIncrementalDataChunk[]
}

export interface IApolloServerTracing {
  version: number
  startTime: string
  endTime: string
  duration: number
  execution: {
    resolvers: IApolloServerTracingResolvers[]
  }
}

export interface IApolloServerTracingResolvers {
  path: Array<string | number>
  parentType: string
  fieldName: string
  returnType: string
  startOffset: number
  duration: number
}
