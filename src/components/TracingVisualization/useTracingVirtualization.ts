import { IApolloServerTracing, IApolloServerTracingResolvers, Maybe } from "@/types"
import { useRef, useCallback, MutableRefObject, useMemo } from 'react'
import { useVirtualization } from '@/hooks/useVirtualization'

const EMPTY_ARRAY: IApolloServerTracingResolvers[] = []

interface Results extends ReturnType<typeof useVirtualization> {
  ref: MutableRefObject<HTMLDivElement | null>;
  resolvers: IApolloServerTracingResolvers[];
  height: number;
}

export const useTracingVirtualization = (tracing: Maybe<IApolloServerTracing>): Results => {
  const height = 20;
  const resolvers = tracing?.execution.resolvers || EMPTY_ARRAY;

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualization({
    size: resolvers.length,
    parentRef,
    estimateSize: useCallback(() => height, []),
    overscan: 5,
    paddingEnd: 20,
  })

  const memoResults = useMemo(() => ({
    ref: parentRef,
    resolvers,
    height,
    ...rowVirtualizer,
  }), [resolvers, rowVirtualizer])

  return memoResults;
}