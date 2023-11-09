import { useEffect } from "react"

/**
 * Call a function every `ms` milliseconds. Ensure
 * the callback given is memoized with useCallback.
 *
 */
const useInterval = (cb: () => void, ms: number) => {
  // Run once on mount
  useEffect(() => {
    const run = async () => {
      await cb()
    }
    run()
  }, [cb])

  // Run every `ms` milliseconds
  useEffect(() => {
    let timer: ReturnType<typeof window.setTimeout>
    const run = () => {
      timer = setTimeout(async () => {
        await cb()
        run()
      }, ms)
    }
    run()

    return () => clearTimeout(timer)
  }, [cb, ms])
}

export default useInterval
