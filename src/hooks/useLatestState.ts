import { useCallback, useRef, useState } from 'react'

/**
 * Has a matching API to useState, but also provides a getter to always
 * access the latest state.
 *
 * This is handled through a ref, so it's safe to use in callbacks or
 * other places where the state might be stale.
 *
 */
const useLatestState = <T>(initialState: T) => {
  const [state, setState] = useState(initialState)
  const latestStateRef = useRef(state)

  // This getter can be used to always access the latest state
  const getState = useCallback(() => latestStateRef.current, [])

  const setStateWrapper = useCallback(
    (newState: T | ((state: T) => T)) => {
      setState((prevState) => {
        const updatedState =
          typeof newState === 'function'
            ? (newState as any)(prevState)
            : newState
        latestStateRef.current = updatedState
        return updatedState
      })
    },
    [setState]
  )

  return [state, setStateWrapper, getState] as const
}

export default useLatestState
