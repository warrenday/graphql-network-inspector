import { IApolloServerTracing, IApolloServerTracingResolvers } from "@/types"
import { useRef, useCallback, MutableRefObject, useMemo } from 'react'
import { useVirtualization } from '@/hooks/useVirtualization'

const EMPTY_ARRAY: IApolloServerTracingResolvers[] = []

interface Options {
  height?: number
}

interface Results extends ReturnType<typeof useVirtualization> {
  ref: MutableRefObject<HTMLDivElement | null>;
  resolvers: IApolloServerTracingResolvers[];
}

export const useTracingVirtualization = (
  tracing?: IApolloServerTracing,
  options?: Options,
): Results => {
  const height = options?.height || 20;
  const resolvers = tracing?.execution.resolvers || EMPTY_ARRAY;

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualization({
    size: resolvers.length,
    parentRef,
    estimateSize: useCallback(() => height, []),
    overscan: 5,
  })

  const memoResults = useMemo(() => ({
    ref: parentRef,
    resolvers,
    ...rowVirtualizer,
  }), [resolvers, rowVirtualizer])

  return memoResults;
}