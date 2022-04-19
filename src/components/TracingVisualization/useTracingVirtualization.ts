import { IApolloServerTracing, IApolloServerTracingResolvers, Maybe } from "@/types"
import { useRef, useCallback, MutableRefObject, useMemo } from 'react'
import { useVirtualization } from '@/hooks/useVirtualization'

const EMPTY_ARRAY: IApolloServerTracingResolvers[] = []

interface Results extends ReturnType<typeof useVirtualization> {
  ref: MutableRefObject<HTMLDivElement | null>;
  resolvers: IApolloServerTracingResolvers[];
}

export const useTracingVirtualization = (tracing: Maybe<IApolloServerTracing>): Results => {
  const resolvers = tracing?.execution.resolvers || EMPTY_ARRAY;

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualization({
    size: resolvers.length,
    parentRef,
    estimateSize: useCallback(() => 20, []),
    overscan: 5,
    paddingEnd: 20,
  })

  const memoResults = useMemo(() => ({
    ref: parentRef,
    resolvers,
    ...rowVirtualizer,
  }), [resolvers, rowVirtualizer])

  return memoResults;
}