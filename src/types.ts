import { ExecutionResult } from "graphql"

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

export type Maybe<T> = T | null | undefined

export interface IResponseBody
  extends ExecutionResult<unknown, IApolloServerExtensions> {}

export interface IApolloServerExtensions {
  tracing?: IApolloServerTracing
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
