import { useEffect } from "react"

/**
 * Call a function every `ms` milliseconds. Ensure
 * the callback given is memoized with useCallback.
 *
 */
const useLoop = (cb: () => void, ms: number) => {
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

export default useLoop
