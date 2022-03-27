import { useLayoutEffect } from "react"

const scrollStates = new Map()

export const usePersistedScrollState = (
  ref: { current: HTMLElement },
  key: string
) => {
  useLayoutEffect(() => {
    ref.current.scrollTop = scrollStates.get(key) ?? 0

    return () => {
      scrollStates.set(key, ref.current?.scrollTop ?? 0)
    }
  })
}
